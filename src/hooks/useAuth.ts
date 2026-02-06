import type { User } from '@tma.js/sdk-react';
import { initData, useSignal } from '@tma.js/sdk-react';
import { useEffect, useState } from 'react';

import { getOrCreateUserProfile, type UserProfile } from '../lib/supabase';

export function useAuth() {
  const initDataState = useSignal(initData.state);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const raw = initDataState as ReturnType<typeof initData.state> | null;

        if (!raw || !raw.user) {
          setError('Не удалось получить данные Telegram');
          setLoading(false);
          return;
        }

        const profile = await getOrCreateUserProfile(raw.user as User);
        setUser(profile);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(message);
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    }

    void initAuth();
  }, [initDataState]);

  return { user, loading, error };
}

