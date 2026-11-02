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
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Profile effects run once upon opening/hover, strictly under 5 seconds, then stop
  useEffect(() => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    const timer = setTimeout(() => {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }, 4200); // stops at 4.2 seconds (strictly under 5s)
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
      onMouseEnter={() => {
        setIsPlaying(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      }}
      style={{
        position: 'absolute',
        inset: '-20px',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
        borderRadius: '20px',
        opacity: isPlaying ? 1 : 0.08, // Fades down so it doesn't obscure profile
        transform: isPlaying ? 'scale(1)' : 'scale(0.98)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        animationPlayState: isPlaying ? 'running' : 'paused',
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
            ref={videoRef}
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
