import { NextRequest, NextResponse } from 'next/server';
import { isWhidbeyLocal } from '@/lib/whidbey-zips';
import { verifyUserRequest } from '@/lib/userAuth';

export async function POST(request: NextRequest) {
  let recommendationId: string, rating: number, body: string, zip: string;

  try {
    const json = await request.json();
    recommendationId = json.recommendationId;
    rating           = json.rating;
    body             = json.body;
    zip              = json.zip;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!recommendationId || typeof recommendationId !== 'string') {
    return NextResponse.json({ error: 'Missing recommendationId' }, { status: 400 });
  }
  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }
  if (!body || typeof body !== 'string' || !body.trim()) {
    return NextResponse.json({ error: 'Review body is required' }, { status: 400 });
  }
  if (body.length > 5000) {
    return NextResponse.json({ error: 'Review must be 5,000 characters or fewer' }, { status: 400 });
  }
  if (!zip || typeof zip !== 'string' || !zip.trim()) {
    return NextResponse.json({ error: 'Zip code is required' }, { status: 400 });
  }

  // Server-side zip validation — cannot be bypassed client-side
  if (!isWhidbeyLocal(zip.trim())) {
    return NextResponse.json(
      { error: 'Reviews require a valid Whidbey Island zip code (98236, 98239, 98249, 98250, 98253, 98260, 98277, or 98278).' },
      { status: 422 }
    );
  }

  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;
  const { user, displayName, supabase: supabaseUser } = auth;

  const { data: review, error: insertError } = await supabaseUser
    .from('reviews')
    .insert({
      recommendation_id: recommendationId,
      rating,
      body:        body.trim(),
      author_id:   user.id,
      author_name: displayName,
      zipcode:     zip.trim(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: 'Failed to post review' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, review });
}
