import { useEffect, useState, useCallback } from 'react';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { ProfileFlare } from './types';
import {
  getUserFlare,
  getCachedUserFlare,
  FLARE_UPDATE_EVENT,
  FLARE_ACCOUNT_DATA_EVENT,
} from './api';

export function useUserFlare(userId?: string) {
  const mx = useMatrixClient();
  const [flare, setFlare] = useState<ProfileFlare | null>(() =>
    userId ? getCachedUserFlare(userId) : null
  );
  const [loading, setLoading] = useState(false);

  // Sync state if userId changes
  useEffect(() => {
    if (userId) {
      setFlare(getCachedUserFlare(userId));
    } else {
      setFlare(null);
    }
  }, [userId]);

  const fetchFlare = useCallback(
    async (force = false) => {
      if (!userId || !mx) return;
      setLoading(true);
      try {
        const data = await getUserFlare(mx, userId, force);
        if (data) {
          setFlare(data);
        }
      } catch {
        // Ignore error, fallback to current or null
      } finally {
        setLoading(false);
      }
    },
    [mx, userId]
  );

  useEffect(() => {
    fetchFlare();
  }, [fetchFlare]);

  // Listen to custom flare update events
  useEffect(() => {
    if (!userId) return;

    const handleUpdate = (evt: Event) => {
      const customEvent = evt as CustomEvent<{ userId: string; flare: ProfileFlare | null }>;
      if (customEvent.detail?.userId === userId) {
        setFlare(customEvent.detail.flare);
      }
    };

    window.addEventListener(FLARE_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(FLARE_UPDATE_EVENT, handleUpdate);
  }, [userId]);

  // Listen to Matrix AccountData sync if this is the current user
  useEffect(() => {
    if (!mx || !userId || userId !== mx.getSafeUserId()) return;

    const handleAccountData = (event: any) => {
      if (event.getType() === FLARE_ACCOUNT_DATA_EVENT) {
        setFlare(event.getContent() as ProfileFlare);
      }
    };

    mx.on('accountData' as any, handleAccountData);
    return () => {
      mx.removeListener('accountData' as any, handleAccountData);
    };
  }, [mx, userId]);

  return {
    flare,
    loading,
    refresh: () => fetchFlare(true),
  };
}
