import { MatrixClient, Method } from 'matrix-js-sdk';
import { ProfileFlare } from './types';

export const FLARE_ACCOUNT_DATA_EVENT = 'app.cinny.flare';

// In-memory cache for user flairs
const flareCache = new Map<string, { data: ProfileFlare | null; ts: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export const FLARE_UPDATE_EVENT = 'cinny:flare:update';

export function notifyFlareUpdated(userId: string, flare: ProfileFlare | null) {
  flareCache.set(userId, { data: flare, ts: Date.now() });
  window.dispatchEvent(
    new CustomEvent(FLARE_UPDATE_EVENT, {
      detail: { userId, flare },
    })
  );
}

/**
 * Fetch a user's flare data.
 * Checks memory cache -> account data (for self) -> MSC4133 profile API endpoint.
 */
export async function getUserFlare(
  mx: MatrixClient,
  userId: string,
  forceRefresh = false
): Promise<ProfileFlare | null> {
  const now = Date.now();
  const cached = flareCache.get(userId);
  if (!forceRefresh && cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const myUserId = mx.getSafeUserId();

  // 1. If self, check account data first
  if (userId === myUserId) {
    try {
      const accountDataEvent = mx.getAccountData(FLARE_ACCOUNT_DATA_EVENT as any);
      if (accountDataEvent) {
        const content = accountDataEvent.getContent() as ProfileFlare;
        if (content && typeof content === 'object') {
          flareCache.set(userId, { data: content, ts: now });
          return content;
        }
      }
    } catch {
      // Continue to profile endpoint
    }
  }

  // 2. Query MSC4133 profile endpoint: GET /_matrix/client/v3/profile/{userId}/app.cinny.flare
  try {
    const encodedUser = encodeURIComponent(userId);
    const res = await mx.http.authedRequest<{ [key: string]: any }>(
      Method.Get,
      `/_matrix/client/v3/profile/${encodedUser}/app.cinny.flare`
    );

    if (res && typeof res === 'object') {
      const flare = (res.flare || res) as ProfileFlare;
      flareCache.set(userId, { data: flare, ts: now });
      return flare;
    }
  } catch {
    // Homeserver might not support MSC4133 yet or user hasn't set flare
  }

  // Fallback: check localStorage for local testing or dev fallback
  try {
    const local = localStorage.getItem(`cinny_flare_${userId}`);
    if (local) {
      const parsed = JSON.parse(local) as ProfileFlare;
      flareCache.set(userId, { data: parsed, ts: now });
      return parsed;
    }
  } catch {
    // Ignore
  }

  flareCache.set(userId, { data: null, ts: now });
  return null;
}

/**
 * Save current user's profile flare.
 * Saves to Account Data, calls MSC4133 profile endpoint, and saves to localStorage fallback.
 */
export async function saveUserFlare(mx: MatrixClient, flare: ProfileFlare): Promise<void> {
  const myUserId = mx.getSafeUserId();
  const flareWithTimestamp: ProfileFlare = {
    ...flare,
    version: 1,
    updatedAt: Date.now(),
  };

  // 1. Set account data (Matrix Account Data event)
  await mx.setAccountData(FLARE_ACCOUNT_DATA_EVENT as any, flareWithTimestamp as any);

  // 2. Attempt to publish to public profile via MSC4133:
  // PUT /_matrix/client/v3/profile/{userId}/app.cinny.flare
  try {
    const encodedUser = encodeURIComponent(myUserId);
    await mx.http.authedRequest(
      Method.Put,
      `/_matrix/client/v3/profile/${encodedUser}/app.cinny.flare`,
      undefined,
      flareWithTimestamp
    );
  } catch {
    // If homeserver doesn't support MSC4133, the account data still syncs across user's devices
  }

  // 3. LocalStorage persistence for instant local feedback
  try {
    localStorage.setItem(`cinny_flare_${myUserId}`, JSON.stringify(flareWithTimestamp));
  } catch {
    // Ignore
  }

  // 4. Notify all UI listeners
  notifyFlareUpdated(myUserId, flareWithTimestamp);
}

/**
 * Upload media (image, animated gif/webp/apng, video) to the Matrix Media Repo
 */
export async function uploadFlareMedia(mx: MatrixClient, file: File): Promise<string> {
  const response = await mx.uploadContent(file, {
    type: file.type,
    name: file.name,
  });
  return response.content_uri; // returns mxc://...
}
