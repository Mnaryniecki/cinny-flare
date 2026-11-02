import { MatrixClient, Method, Room, MatrixEvent } from 'matrix-js-sdk';
import { ProfileFlare } from './types';

export const FLARE_ACCOUNT_DATA_EVENT = 'app.cinny.flare';
export const FLARE_EVENT_TYPE = 'app.cinny.flare';
export const FLARE_REQUEST_EVENT = 'app.cinny.flare.request';
export const FLARE_RESPONSE_EVENT = 'app.cinny.flare.response';
export const FLARE_PUSH_EVENT = 'app.cinny.flare.push';

// In-memory cache for user flairs
const flareCache = new Map<string, { data: ProfileFlare | null; ts: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache
const pendingRequests = new Set<string>();

export const FLARE_UPDATE_EVENT = 'cinny:flare:update';

export function notifyFlareUpdated(userId: string, flare: ProfileFlare | null) {
  flareCache.set(userId, { data: flare, ts: Date.now() });
  window.dispatchEvent(
    new CustomEvent(FLARE_UPDATE_EVENT, {
      detail: { userId, flare },
    })
  );
}

export function getCachedUserFlare(userId: string): ProfileFlare | null {
  const mem = flareCache.get(userId);
  if (mem && mem.data) return mem.data;

  try {
    const local = localStorage.getItem(`cinny_flare_${userId}`);
    if (local) {
      const parsed = JSON.parse(local) as ProfileFlare;
      flareCache.set(userId, { data: parsed, ts: Date.now() });
      return parsed;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function storeUserFlare(userId: string, flare: ProfileFlare | null, notify = true) {
  if (!userId) return;
  const now = Date.now();
  flareCache.set(userId, { data: flare, ts: now });
  if (flare) {
    try {
      localStorage.setItem(`cinny_flare_${userId}`, JSON.stringify(flare));
    } catch {
      // Ignore
    }
  }
  if (notify) {
    notifyFlareUpdated(userId, flare);
  }
}

/**
 * Scan a room for flare data for a specific user:
 * 1. Checks state events
 * 2. Scans live timeline events in reverse order
 */
export function getFlareFromRoom(room: Room, userId: string): ProfileFlare | null {
  try {
    // 1. Check state events in the room
    const stateEvt = room.currentState.getStateEvents(FLARE_EVENT_TYPE, userId);
    if (stateEvt) {
      const content = stateEvt.getContent();
      if (content && typeof content === 'object') {
        const flare = (content.flare || content) as ProfileFlare;
        if (
          flare &&
          (flare.displayNameStyle ||
            flare.avatarDecoration ||
            flare.nameplate ||
            flare.cardTheme ||
            flare.profileFrame ||
            flare.profileEffect)
        ) {
          return flare;
        }
      }
    }

    // 2. Scan recent timeline events in reverse order
    const events = room.getLiveTimeline().getEvents();
    for (let i = events.length - 1; i >= 0; i--) {
      const ev = events[i];
      if (ev.getSender() === userId) {
        // Direct flare event
        if (ev.getType() === FLARE_EVENT_TYPE) {
          const content = ev.getContent();
          if (content?.flare) return content.flare;
        }
        // Attached to message content
        const attachedFlare = ev.getContent()?.['app.cinny.flare'];
        if (attachedFlare && typeof attachedFlare === 'object') {
          return attachedFlare;
        }
      }
    }
  } catch {
    // Ignore room access errors
  }
  return null;
}

/**
 * Send a to-device message to a user using SendToDeviceContentMap
 */
export async function sendFlareToDevice(
  mx: MatrixClient,
  targetUserId: string,
  eventType: string,
  payload: Record<string, any>
): Promise<void> {
  try {
    const contentMap = new Map<string, Map<string, Record<string, any>>>();
    const userMap = new Map<string, Record<string, any>>();
    userMap.set('*', payload);
    contentMap.set(targetUserId, userMap);
    await mx.sendToDevice(eventType, contentMap);
  } catch {
    // Homeserver to-device error ignored
  }
}

/**
 * Request another user's flare via to-device protocol
 */
export async function requestFlareViaToDevice(mx: MatrixClient, targetUserId: string): Promise<void> {
  const myUserId = mx.getSafeUserId();
  if (!targetUserId || targetUserId === myUserId) return;

  // Debounce requests per user (at most once every 15s)
  const reqKey = `${targetUserId}_${Math.floor(Date.now() / 15000)}`;
  if (pendingRequests.has(reqKey)) return;
  pendingRequests.add(reqKey);

  await sendFlareToDevice(mx, targetUserId, FLARE_REQUEST_EVENT, {
    requester: myUserId,
    ts: Date.now(),
  });
}

/**
 * Broadcast current flare across all joined rooms where the user has permission to post
 */
export async function broadcastFlareToRooms(mx: MatrixClient, flare: ProfileFlare): Promise<void> {
  const myUserId = mx.getSafeUserId();
  const rooms = mx.getRooms();

  for (const room of rooms) {
    if (room.getMyMembership() !== 'join') continue;

    try {
      // If user can send state events (e.g. DM rooms or rooms where user is admin/mod), send state event!
      if (room.currentState.maySendStateEvent(FLARE_EVENT_TYPE, myUserId)) {
        await mx.sendStateEvent(room.roomId, FLARE_EVENT_TYPE, flare, myUserId).catch(() => {});
      } else if (room.currentState.maySendEvent(FLARE_EVENT_TYPE, myUserId)) {
        // Otherwise send regular timeline event (which is silent/invisible in chat)
        await mx.sendEvent(room.roomId, FLARE_EVENT_TYPE, {
          userId: myUserId,
          flare,
        }).catch(() => {});
      }
    } catch {
      // Ignore individual room failures
    }
  }

  // Also push to active direct peers
  for (const room of rooms) {
    if (room.getMyMembership() !== 'join') continue;
    const members = room.getJoinedMembers();
    if (members.length === 2) {
      const peer = members.find((m) => m.userId !== myUserId);
      if (peer) {
        sendFlareToDevice(mx, peer.userId, FLARE_PUSH_EVENT, {
          userId: myUserId,
          flare,
        }).catch(() => {});
      }
    }
  }
}

/**
 * Attach flare metadata to any outgoing message content
 */
export function attachFlareToMessageContent(mx: MatrixClient, content: any): void {
  try {
    if (!content || typeof content !== 'object') return;
    const myUserId = mx.getSafeUserId();
    const myFlare = getCachedUserFlare(myUserId);
    if (myFlare) {
      content['app.cinny.flare'] = myFlare;
    }
  } catch {
    // Ignore
  }
}

/**
 * Fetch a user's flare data:
 * 1. Checks memory cache
 * 2. Checks account data (for self)
 * 3. Checks localStorage
 * 4. Scans shared rooms (state events & timeline messages)
 * 5. Sends to-device request to target user
 * 6. Checks MSC4133 profile endpoint (opportunistic)
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
          storeUserFlare(userId, content, false);
          return content;
        }
      }
    } catch {
      // Continue
    }
  }

  // 2. Check local storage
  try {
    const local = localStorage.getItem(`cinny_flare_${userId}`);
    if (local) {
      const parsed = JSON.parse(local) as ProfileFlare;
      if (parsed && typeof parsed === 'object') {
        storeUserFlare(userId, parsed, false);
        if (!forceRefresh) return parsed;
      }
    }
  } catch {
    // Ignore
  }

  // 3. Scan shared rooms for state events or timeline messages
  try {
    const rooms = mx.getRooms();
    for (const room of rooms) {
      if (room.hasMembershipState(userId, 'join')) {
        const fromRoom = getFlareFromRoom(room, userId);
        if (fromRoom) {
          storeUserFlare(userId, fromRoom, false);
          return fromRoom;
        }
      }
    }
  } catch {
    // Ignore
  }

  // 4. Send to-device request to target user in background
  if (userId !== myUserId) {
    requestFlareViaToDevice(mx, userId).catch(() => {});
  }

  // 5. Query MSC4133 profile endpoint as fallback
  try {
    const encodedUser = encodeURIComponent(userId);
    const res = await mx.http.authedRequest<{ [key: string]: any }>(
      Method.Get,
      `/_matrix/client/v3/profile/${encodedUser}/app.cinny.flare`
    );

    if (res && typeof res === 'object') {
      const flare = (res.flare || res) as ProfileFlare;
      storeUserFlare(userId, flare, false);
      return flare;
    }
  } catch {
    // Homeserver might not support MSC4133
  }

  flareCache.set(userId, { data: null, ts: now });
  return null;
}

/**
 * Save current user's profile flare.
 * Saves to Account Data, localStorage, broadcasts to all joined rooms & DM peers,
 * and calls MSC4133 endpoint.
 */
export async function saveUserFlare(mx: MatrixClient, flare: ProfileFlare): Promise<void> {
  const myUserId = mx.getSafeUserId();
  const flareWithTimestamp: ProfileFlare = {
    ...flare,
    version: 1,
    updatedAt: Date.now(),
  };

  // 1. Account data (for own multi-device sync)
  await mx.setAccountData(FLARE_ACCOUNT_DATA_EVENT as any, flareWithTimestamp as any);

  // 2. Local storage & memory cache
  storeUserFlare(myUserId, flareWithTimestamp, true);

  // 3. Broadcast to all joined Matrix rooms & DM peers!
  broadcastFlareToRooms(mx, flareWithTimestamp).catch(() => {});

  // 4. Attempt MSC4133 profile endpoint (if supported by HS)
  try {
    const encodedUser = encodeURIComponent(myUserId);
    await mx.http.authedRequest(
      Method.Put,
      `/_matrix/client/v3/profile/${encodedUser}/app.cinny.flare`,
      undefined,
      flareWithTimestamp
    );
  } catch {
    // Ignore
  }

  // 5. Notify all UI listeners
  notifyFlareUpdated(myUserId, flareWithTimestamp);
}

/**
 * Upload media (image, animated gif/webp/apng, video, custom font) to the Matrix Media Repo
 */
export async function uploadFlareMedia(mx: MatrixClient, file: File): Promise<string> {
  const response = await mx.uploadContent(file, {
    type: file.type,
    name: file.name,
  });
  return response.content_uri; // returns mxc://...
}
