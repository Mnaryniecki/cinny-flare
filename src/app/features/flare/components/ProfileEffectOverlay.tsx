import React from 'react';
import { ProfileEffect, PRESET_EFFECTS } from '../types';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../../utils/matrix';

type ProfileEffectOverlayProps = {
  effect?: ProfileEffect;
};

export function ProfileEffectOverlay({ effect }: ProfileEffectOverlayProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();

  if (!effect || (!effect.preset && !effect.url)) return null;

  const preset = PRESET_EFFECTS.find((p) => p.id === effect.preset);

  let mediaUrl: string | null = null;
  if (effect.url) {
    mediaUrl = effect.url.startsWith('mxc://')
      ? mxcUrlToHttp(mx, effect.url, useAuth)
      : effect.url;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: '-20px',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
        borderRadius: '20px',
      }}
    >
      {preset ? (
        <div
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{ __html: preset.svg }}
        />
      ) : mediaUrl ? (
        mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') ? (
          <video
            src={mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Profile Effect"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          />
        )
      ) : null}
    </div>
  );
}
