'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';
import { ALLOWED_TOWNS, ALLOWED_EVENT_CATEGORIES, ALLOWED_EVENT_TAGS } from '@/lib/validate';
import { recurrenceSummary } from '@/lib/recurring';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type RecurringTemplate = {
  id: string;
  title: string;
  time: string;
  location: string;
  town: string;
  category: string;
  description: string | null;
  tags: string[];
  recurrence_type: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  day_of_week: number | null;
  day_of_month: number | null;
  custom_interval_days: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  generated_count: number;
};

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch(method: string, body?: object) {
  const token = await getToken();
  const res = await fetch('/api/events/recurring', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

type FormState = {
  title: string;
  time: string;
  location: string;
  town: string;
  category: string;
  description: string;
  tags: string[];
  recurrence_type: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  day_of_week: number;
  day_of_month: number;
  custom_interval_days: number;
  start_date: string;
  end_date: string;
  perpetual: boolean;
};

const defaultForm: FormState = {
  title: '',
  time: '',
  location: '',
  town: 'Oak Harbor',
  category: 'Community & Social',
  description: '',
  tags: [],
  recurrence_type: 'weekly',
  day_of_week: 6,
  day_of_month: 1,
  custom_interval_days: 14,
  start_date: '',
  end_date: '',
  perpetual: true,
};

export default function RecurringEventsPage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [fetching, setFetching] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [acting, setActing] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = Boolean(user && ADMIN_EMAIL && user.email === ADMIN_EMAIL);

  const loadTemplates = useCallback(async () => {
    setFetching(true);
    const data = await apiFetch('GET');
    setTemplates(data.templates ?? []);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    apiFetch('GET').then(data => {
      if (!cancelled) {
        setTemplates(data.templates ?? []);
      }
    });
    return () => { cancelled = true; };
  }, [isAdmin]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');

    const payload = {
      ...form,
      end_date: form.perpetual ? null : form.end_date || null,
      day_of_week: ['weekly', 'biweekly'].includes(form.recurrence_type) ? form.day_of_week : null,
      day_of_month: form.recurrence_type === 'monthly' ? form.day_of_month : null,
      custom_interval_days: form.recurrence_type === 'custom' ? form.custom_interval_days : null,
    };

    const res = await apiFetch('POST', payload);
    if (res.ok) {
      setCreateSuccess(`Created! ${res.generated} events generated.`);
      setForm(defaultForm);
      await loadTemplates();
    } else {
      setCreateError(res.error || 'Failed to create');
    }
    setCreating(false);
  }

  async function toggleActive(t: RecurringTemplate) {
    setActing(p => ({ ...p, [t.id]: true }));
    await apiFetch('PATCH', { id: t.id, is_active: !t.is_active });
    await loadTemplates();
    setActing(p => ({ ...p, [t.id]: false }));
  }

  async function handleDelete(id: string, deleteFuture: boolean) {
    setActing(p => ({ ...p, [id]: true }));
    await apiFetch('DELETE', { id, deleteFutureEvents: deleteFuture });
    setDeleteConfirm(null);
    await loadTemplates();
    setActing(p => ({ ...p, [id]: false }));
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setActing(p => ({ ...p, [editingId]: true }));

    const payload = {
      id: editingId,
      title: editForm.title,
      time: editForm.time,
      location: editForm.location,
      town: editForm.town,
      category: editForm.category,
      description: editForm.description || null,
      tags: editForm.tags,
      recurrence_type: editForm.recurrence_type,
      day_of_week: ['weekly', 'biweekly'].includes(editForm.recurrence_type) ? editForm.day_of_week : null,
      day_of_month: editForm.recurrence_type === 'monthly' ? editForm.day_of_month : null,
      custom_interval_days: editForm.recurrence_type === 'custom' ? editForm.custom_interval_days : null,
      start_date: editForm.start_date,
      end_date: editForm.perpetual ? null : editForm.end_date || null,
    };

    await apiFetch('PATCH', payload);
    setEditingId(null);
    await loadTemplates();
    setActing(p => ({ ...p, [editingId]: false }));
  }

  function startEdit(t: RecurringTemplate) {
    setEditingId(t.id);
    setEditForm({
      title: t.title,
      time: t.time,
      location: t.location,
      town: t.town,
      category: t.category,
      description: t.description || '',
      tags: t.tags || [],
      recurrence_type: t.recurrence_type,
      day_of_week: t.day_of_week ?? 6,
      day_of_month: t.day_of_month ?? 1,
      custom_interval_days: t.custom_interval_days ?? 14,
      start_date: t.start_date,
      end_date: t.end_date || '',
      perpetual: !t.end_date,
    });
    setExpanded(p => ({ ...p, [t.id]: true }));
  }

  // Auth gates
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌊</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl text-stone-800 mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
              Admin access only
            </h1>
            <p className="text-stone-500 mb-5 text-sm">You need to be signed in as an admin.</p>
            <button onClick={() => setAuthOpen(true)} className="btn-primary">Sign in</button>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🌧️</div>
          <h1 className="text-2xl text-stone-800 mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            Not authorized
          </h1>
          <p className="text-stone-500 text-sm">This page is restricted to site administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Image src="/logo.png" alt="" aria-hidden={true} role="presentation" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
          <h1 className="text-3xl text-stone-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}>
            Recurring Events
          </h1>
        </div>
        <p className="text-stone-500 text-sm">Create templates that auto-generate calendar events.</p>
        <div className="mt-3 flex gap-4 text-sm flex-wrap">
          <Link href="/admin/events" className="text-forest-600 hover:text-forest-800 font-medium">Events</Link>
          <span className="text-stone-300">|</span>
          <span className="text-stone-400 font-medium">Recurring</span>
          <span className="text-stone-300">|</span>
          <Link href="/admin/news" className="text-forest-600 hover:text-forest-800 font-medium">News Posts</Link>
          <span className="text-stone-300">|</span>
          <Link href="/admin/listings" className="text-forest-600 hover:text-forest-800 font-medium">Marketplace</Link>
        </div>
      </div>

      {/* Create Form */}
      <div className="mb-10 bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          New Recurring Event
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Title + Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Title</label>
              <input type="text" required value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                placeholder="e.g. Bayview Farmers Market" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Time</label>
              <input type="text" required value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                placeholder="e.g. 10:00 AM – 2:00 PM" />
            </div>
          </div>

          {/* Location + Town */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Location</label>
              <input type="text" required value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                placeholder="e.g. Bayview Corner, Langley" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Town</label>
              <select value={form.town}
                onChange={e => setForm(f => ({ ...f, town: e.target.value }))}
                className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800">
                {ALLOWED_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Category + Description */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Category</label>
              <select value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800">
                {ALLOWED_EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Description <span className="text-stone-400 font-normal">(optional)</span></label>
              <input type="text" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                placeholder="Brief description" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALLOWED_EVENT_TAGS.map(tag => (
                <button key={tag} type="button"
                  onClick={() => setForm(f => ({
                    ...f,
                    tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
                  }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.tags.includes(tag)
                      ? 'bg-forest-500 text-parchment-50 border-forest-500'
                      : 'bg-white text-stone-600 border-parchment-300 hover:border-forest-400'
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div className="border-t border-parchment-200 pt-4">
            <label className="block text-xs font-medium text-stone-600 mb-2">Recurrence</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(['weekly', 'biweekly', 'monthly', 'custom'] as const).map(rt => (
                <button key={rt} type="button"
                  onClick={() => setForm(f => ({ ...f, recurrence_type: rt }))}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.recurrence_type === rt
                      ? 'bg-forest-500 text-parchment-50 border-forest-500'
                      : 'bg-white text-stone-600 border-parchment-300 hover:border-forest-400'
                  }`}>
                  {rt === 'biweekly' ? 'Biweekly' : rt.charAt(0).toUpperCase() + rt.slice(1)}
                </button>
              ))}
            </div>

            {/* Conditional recurrence inputs */}
            {['weekly', 'biweekly'].includes(form.recurrence_type) && (
              <div className="mb-3">
                <label className="block text-xs text-stone-500 mb-1">Day of week</label>
                <div className="flex gap-1.5">
                  {DAY_NAMES.map((name, i) => (
                    <button key={i} type="button"
                      onClick={() => setForm(f => ({ ...f, day_of_week: i }))}
                      className={`w-10 h-10 rounded-lg text-xs font-medium border transition-colors ${
                        form.day_of_week === i
                          ? 'bg-forest-500 text-parchment-50 border-forest-500'
                          : 'bg-white text-stone-600 border-parchment-300 hover:border-forest-400'
                      }`}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.recurrence_type === 'monthly' && (
              <div className="mb-3">
                <label className="block text-xs text-stone-500 mb-1">Day of month</label>
                <input type="number" min={1} max={31} value={form.day_of_month}
                  onChange={e => setForm(f => ({ ...f, day_of_month: parseInt(e.target.value) || 1 }))}
                  className="w-20 px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800" />
              </div>
            )}

            {form.recurrence_type === 'custom' && (
              <div className="mb-3">
                <label className="block text-xs text-stone-500 mb-1">Repeat every N days</label>
                <input type="number" min={1} value={form.custom_interval_days}
                  onChange={e => setForm(f => ({ ...f, custom_interval_days: parseInt(e.target.value) || 1 }))}
                  className="w-20 px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800" />
              </div>
            )}
          </div>

          {/* Date range */}
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Start date</label>
              <input type="date" required value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">End date</label>
              <input type="date" value={form.end_date} disabled={form.perpetual}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 disabled:opacity-40" />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <input type="checkbox" id="perpetual" checked={form.perpetual}
                onChange={e => setForm(f => ({ ...f, perpetual: e.target.checked, end_date: '' }))}
                className="rounded border-parchment-300 text-forest-500 focus:ring-forest-400" />
              <label htmlFor="perpetual" className="text-sm text-stone-600">Perpetual (no end date)</label>
            </div>
          </div>

          {createError && <p className="text-sm text-terra-600 font-medium">{createError}</p>}
          {createSuccess && <p className="text-sm text-forest-700 font-medium">{createSuccess}</p>}

          <button type="submit" disabled={creating} className="btn-primary py-2 px-6 text-sm disabled:opacity-60">
            {creating ? 'Creating...' : 'Create Recurring Event'}
          </button>
        </form>
      </div>

      {/* Templates List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-800"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Templates ({templates.length})
        </h2>
        <button onClick={loadTemplates}
          className="px-3 py-1.5 rounded-full text-xs text-stone-400 border border-parchment-300 hover:border-stone-400 transition-colors">
          {fetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-stone-500 text-sm">
            {fetching ? 'Loading...' : 'No recurring event templates yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map(t => {
            const isExpanded = expanded[t.id] ?? false;
            const isEditing = editingId === t.id;

            return (
              <div key={t.id} className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm overflow-hidden">
                {/* Collapsed header */}
                <button
                  onClick={() => setExpanded(p => ({ ...p, [t.id]: !isExpanded }))}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-parchment-100 transition-colors"
                >
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    t.is_active
                      ? 'bg-forest-100 text-forest-800 border border-forest-200'
                      : 'bg-stone-100 text-stone-500 border border-stone-200'
                  }`}>
                    {t.is_active ? 'Active' : 'Paused'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate"
                       style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {t.title}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {recurrenceSummary(t)} · {t.town} · {t.generated_count} events
                    </p>
                  </div>
                  <span className="text-stone-400 text-sm shrink-0">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-parchment-200 p-5 space-y-4">
                    {isEditing ? (
                      /* Inline edit form */
                      <form onSubmit={handleEdit} className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input type="text" required value={editForm.title}
                            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                            className="px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                            placeholder="Title" />
                          <input type="text" required value={editForm.time}
                            onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}
                            className="px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                            placeholder="Time" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input type="text" required value={editForm.location}
                            onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                            className="px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                            placeholder="Location" />
                          <select value={editForm.town}
                            onChange={e => setEditForm(f => ({ ...f, town: e.target.value }))}
                            className="px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800">
                            {ALLOWED_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <select value={editForm.category}
                            onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                            className="px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800">
                            {ALLOWED_EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input type="text" value={editForm.description}
                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                            className="px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                            placeholder="Description (optional)" />
                        </div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {ALLOWED_EVENT_TAGS.map(tag => (
                            <button key={tag} type="button"
                              onClick={() => setEditForm(f => ({
                                ...f,
                                tags: f.tags.includes(tag) ? f.tags.filter(x => x !== tag) : [...f.tags, tag],
                              }))}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                editForm.tags.includes(tag)
                                  ? 'bg-forest-500 text-parchment-50 border-forest-500'
                                  : 'bg-white text-stone-500 border-parchment-300'
                              }`}>
                              {tag}
                            </button>
                          ))}
                        </div>
                        {/* Recurrence */}
                        <div className="flex flex-wrap gap-1.5">
                          {(['weekly', 'biweekly', 'monthly', 'custom'] as const).map(rt => (
                            <button key={rt} type="button"
                              onClick={() => setEditForm(f => ({ ...f, recurrence_type: rt }))}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                editForm.recurrence_type === rt
                                  ? 'bg-forest-500 text-parchment-50 border-forest-500'
                                  : 'bg-white text-stone-500 border-parchment-300'
                              }`}>
                              {rt === 'biweekly' ? 'Biweekly' : rt.charAt(0).toUpperCase() + rt.slice(1)}
                            </button>
                          ))}
                        </div>
                        {['weekly', 'biweekly'].includes(editForm.recurrence_type) && (
                          <div className="flex gap-1">
                            {DAY_NAMES.map((name, i) => (
                              <button key={i} type="button"
                                onClick={() => setEditForm(f => ({ ...f, day_of_week: i }))}
                                className={`w-9 h-9 rounded-lg text-xs font-medium border transition-colors ${
                                  editForm.day_of_week === i
                                    ? 'bg-forest-500 text-parchment-50 border-forest-500'
                                    : 'bg-white text-stone-500 border-parchment-300'
                                }`}>
                                {name}
                              </button>
                            ))}
                          </div>
                        )}
                        {editForm.recurrence_type === 'monthly' && (
                          <input type="number" min={1} max={31} value={editForm.day_of_month}
                            onChange={e => setEditForm(f => ({ ...f, day_of_month: parseInt(e.target.value) || 1 }))}
                            className="w-20 px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800" />
                        )}
                        {editForm.recurrence_type === 'custom' && (
                          <input type="number" min={1} value={editForm.custom_interval_days}
                            onChange={e => setEditForm(f => ({ ...f, custom_interval_days: parseInt(e.target.value) || 1 }))}
                            className="w-20 px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800" />
                        )}
                        <div className="grid sm:grid-cols-3 gap-3 items-end">
                          <input type="date" required value={editForm.start_date}
                            onChange={e => setEditForm(f => ({ ...f, start_date: e.target.value }))}
                            className="px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800" />
                          <input type="date" value={editForm.end_date} disabled={editForm.perpetual}
                            onChange={e => setEditForm(f => ({ ...f, end_date: e.target.value }))}
                            className="px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 disabled:opacity-40" />
                          <label className="flex items-center gap-2 text-sm text-stone-600 pb-2">
                            <input type="checkbox" checked={editForm.perpetual}
                              onChange={e => setEditForm(f => ({ ...f, perpetual: e.target.checked, end_date: '' }))}
                              className="rounded border-parchment-300 text-forest-500 focus:ring-forest-400" />
                            Perpetual
                          </label>
                        </div>
                        <div className="flex gap-3">
                          <button type="submit" disabled={acting[t.id]} className="btn-primary py-2 px-5 text-sm disabled:opacity-40">
                            {acting[t.id] ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button type="button" onClick={() => setEditingId(null)}
                            className="px-5 py-2 rounded-xl text-sm font-medium bg-white text-stone-600 border border-parchment-300 hover:border-stone-400 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Read-only detail */
                      <>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div><span className="text-stone-400">Time</span><p className="text-stone-800 font-medium">{t.time}</p></div>
                          <div><span className="text-stone-400">Location</span><p className="text-stone-800 font-medium">{t.location}, {t.town}</p></div>
                          <div><span className="text-stone-400">Category</span><p className="text-stone-800 font-medium">{t.category}</p></div>
                          <div><span className="text-stone-400">Recurrence</span><p className="text-stone-800 font-medium">{recurrenceSummary(t)}</p></div>
                          <div><span className="text-stone-400">Start</span><p className="text-stone-800 font-medium">{t.start_date}</p></div>
                          <div><span className="text-stone-400">End</span><p className="text-stone-800 font-medium">{t.end_date || 'Perpetual'}</p></div>
                          <div><span className="text-stone-400">Tags</span><p className="text-stone-800 font-medium">{t.tags?.join(', ') || '—'}</p></div>
                          <div><span className="text-stone-400">Generated Events</span><p className="text-stone-800 font-medium">{t.generated_count}</p></div>
                        </div>

                        {t.description && (
                          <div>
                            <p className="text-xs text-stone-400 mb-1">Description</p>
                            <p className="text-sm text-stone-700 leading-relaxed bg-white rounded-xl border border-parchment-200 p-3">
                              {t.description}
                            </p>
                          </div>
                        )}

                        <div className="border-t border-parchment-200 pt-4 flex flex-wrap gap-3">
                          <button onClick={() => toggleActive(t)} disabled={acting[t.id]}
                            className={`px-5 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40 ${
                              t.is_active
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-forest-50 text-forest-700 border-forest-200 hover:bg-forest-100'
                            }`}>
                            {acting[t.id] ? 'Saving...' : t.is_active ? 'Pause' : 'Resume'}
                          </button>
                          <button onClick={() => startEdit(t)}
                            className="px-5 py-2 rounded-xl text-sm font-medium bg-white text-stone-600 border border-parchment-300 hover:border-forest-400 transition-colors">
                            Edit
                          </button>
                          {deleteConfirm === t.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-500">Delete future events too?</span>
                              <button onClick={() => handleDelete(t.id, true)} disabled={acting[t.id]}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-terra-100 text-terra-700 border border-terra-200 hover:bg-terra-200 transition-colors disabled:opacity-40">
                                Yes, delete all
                              </button>
                              <button onClick={() => handleDelete(t.id, false)} disabled={acting[t.id]}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-stone-600 border border-parchment-300 hover:border-stone-400 transition-colors disabled:opacity-40">
                                Template only
                              </button>
                              <button onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(t.id)}
                              className="px-5 py-2 rounded-xl text-sm font-medium bg-terra-50 text-terra-700 border border-terra-200 hover:bg-terra-100 transition-colors">
                              Delete
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
