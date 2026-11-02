import { useEffect } from 'react';
import { MatrixEvent, RoomEvent } from 'matrix-js-sdk';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import {
  FLARE_EVENT_TYPE,
  FLARE_REQUEST_EVENT,
  FLARE_RESPONSE_EVENT,
  FLARE_PUSH_EVENT,
  getCachedUserFlare,
  sendFlareToDevice,
  storeUserFlare,
} from '../api';

export function FlareSyncFeature() {
  const mx = useMatrixClient();

  useEffect(() => {
    if (!mx) return;
    const myUserId = mx.getSafeUserId();

    // 1. Listen for to-device events (real-time P2P sync across users)
    const handleToDevice = (evt: MatrixEvent) => {
      const sender = evt.getSender();
      const type = evt.getType();
      const content = evt.getContent();

      if (type === FLARE_REQUEST_EVENT) {
        // Another user is asking for our flare!
        const requester = content?.requester || sender;
        if (requester && requester !== myUserId) {
          const myFlare = getCachedUserFlare(myUserId);
          if (myFlare) {
            sendFlareToDevice(mx, requester, FLARE_RESPONSE_EVENT, {
              userId: myUserId,
              flare: myFlare,
            }).catch(() => {});
          }
        }
      } else if (type === FLARE_RESPONSE_EVENT || type === FLARE_PUSH_EVENT) {
        // Received flare from another user
        const targetUser = content?.userId || sender;
        if (targetUser && content?.flare) {
          storeUserFlare(targetUser, content.flare, true);
        }
      }
    };

    // 2. Listen for Room.timeline events (silent flare broadcasts or messages with flare attached)
    const handleTimelineEvent = (evt: MatrixEvent) => {
      const sender = evt.getSender();
      if (!sender || sender === myUserId) return;

      if (evt.getType() === FLARE_EVENT_TYPE) {
        const flare = evt.getContent()?.flare;
        if (flare && typeof flare === 'object') {
          storeUserFlare(sender, flare, true);
        }
      }

      const msgFlare = evt.getContent()?.['app.cinny.flare'];
      if (msgFlare && typeof msgFlare === 'object') {
        storeUserFlare(sender, msgFlare, true);
      }
    };

    mx.on('toDeviceEvent' as any, handleToDevice);
    mx.on(RoomEvent.Timeline, handleTimelineEvent);

    return () => {
      mx.removeListener('toDeviceEvent' as any, handleToDevice);
      mx.removeListener(RoomEvent.Timeline, handleTimelineEvent);
    };
  }, [mx]);

  return null;
}
