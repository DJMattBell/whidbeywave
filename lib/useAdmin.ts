'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

/**
 * Hook that verifies admin status via server-side API.
 * Returns { isAdmin, loading } — never exposes the admin email to the client.
 */
export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setIsAdmin(null);
      return;
    }

    let cancelled = false;

    async function verify() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token || cancelled) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (!cancelled) setIsAdmin(data.isAdmin === true);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  return {
    user,
    isAdmin: isAdmin === true,
    loading: authLoading || (!!user && isAdmin === null),
  };
}
