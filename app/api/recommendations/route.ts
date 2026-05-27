import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userAuth';
import { createServiceClient } from '@/lib/supabase';

const ALLOWED_CATEGORIES = [
  'Restaurants & Cafes', 'Contractors & Trades', 'Health & Wellness',
  'Arts & Studios', 'Farms & Markets', 'Marine & Boating',
  'Pet Services', 'Auto & Repair', 'Real Estate',
  'Entertainment', 'Retail & Shops', 'Services',
] as const;

const categorySet = new Set<string>(ALLOWED_CATEGORIES);

export async function POST(request: NextRequest) {
  let name: string, category: string, description: string | null,
      town: string | null, address: string | null, website: string | null;

  try {
    const json = await request.json();
    name        = json.name;
    category    = json.category;
    description = json.description ?? null;
    town        = json.town ?? null;
    address     = json.address ?? null;
    website     = json.website ?? null;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (name.length > 200) {
    return NextResponse.json({ error: 'Name must be 200 characters or fewer' }, { status: 400 });
  }
  if (!category || !categorySet.has(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  if (description && typeof description === 'string' && description.length > 2000) {
    return NextResponse.json({ error: 'Description must be 2,000 characters or fewer' }, { status: 400 });
  }
  if (website && typeof website === 'string') {
    try {
      const url = new URL(website);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return NextResponse.json({ error: 'Website must be an HTTP or HTTPS URL' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 });
    }
  }

  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;
  const { user, supabase: supabaseUser } = auth;

  const { data: rec, error: insertError } = await supabaseUser
    .from('recommendations')
    .insert({
      name: name.trim(),
      category,
      description: description?.trim() || null,
      town: town?.trim() || null,
      address: address?.trim() || null,
      website: website?.trim() || null,
      submitted_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: 'Failed to add recommendation' }, { status: 500 });
  }

  // Check if this is the user's first recommendation — one-time notification prompt
  let showNotificationPrompt = false;
  if (!user.user_metadata?.first_recommendation_prompt_shown) {
    try {
      const serviceClient = createServiceClient();
      await serviceClient.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, first_recommendation_prompt_shown: true },
      });
      showNotificationPrompt = true;
    } catch {
      // Non-fatal — prompt just won't show
    }
  }

  return NextResponse.json({ ok: true, recommendation: rec, showNotificationPrompt });
}
