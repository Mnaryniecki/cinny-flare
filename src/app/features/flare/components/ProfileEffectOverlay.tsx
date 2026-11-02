import React, { useState, useEffect } from 'react';
import { ProfileEffect, PRESET_EFFECTS } from '../types';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../../utils/matrix';

type ProfileEffectOverlayProps = {
  effect?: ProfileEffect;
  forcePlay?: boolean;
};

export function ProfileEffectOverlay({ effect, forcePlay }: ProfileEffectOverlayProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();
  const [isPlaying, setIsPlaying] = useState(true);

  // Profile effects in Discord run once upon opening/hover, then stop
  useEffect(() => {
    setIsPlaying(true);
    const timer = setTimeout(() => {
      setIsPlaying(false);
    }, 3800); // stops after 3.8s
    return () => clearTimeout(timer);
  }, [effect?.preset, effect?.url, forcePlay]);

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
      onMouseEnter={() => setIsPlaying(true)}
      style={{
        position: 'absolute',
        inset: '-20px',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
        borderRadius: '20px',
        opacity: isPlaying ? 1 : 0.15, // Temporary animation that stops and fades to subtle resting glow
        transform: isPlaying ? 'scale(1)' : 'scale(0.98)',
        transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
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
            muted
            playsInline
            onEnded={() => setIsPlaying(false)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Profile Effect"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )
      ) : null}
    </div>
  );
}
