import React, { useMemo } from 'react';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../../utils/matrix';
import { AvatarDecoration, PRESET_DECORATIONS } from '../types';

type AvatarDecorationOverlayProps = {
  decoration?: AvatarDecoration;
  size?: number; // In px, or container relative
  className?: string;
};

export function AvatarDecorationOverlay({
  decoration,
  className,
}: AvatarDecorationOverlayProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();

  const { resolvedSrc, presetSvg, glowColor, animation, scale } = useMemo(() => {
    if (!decoration || !decoration.url) {
      return { resolvedSrc: null, presetSvg: null, glowColor: undefined, animation: 'none', scale: 1.18 };
    }

    const anim = decoration.animation || 'none';
    const sc = decoration.scale || 1.18;
    const glow = decoration.glowColor || '#9333ea';

    // Check if it matches a preset ID
    const preset = PRESET_DECORATIONS.find((p) => p.id === decoration.url);
    if (preset) {
      return {
        resolvedSrc: null,
        presetSvg: preset.svg,
        glowColor: decoration.glowColor || preset.glowColor,
        animation: decoration.animation || preset.animation,
        scale: sc,
      };
    }

    // Check if it's an mxc:// URL
    if (decoration.url.startsWith('mxc://')) {
      const httpUrl = mxcUrlToHttp(mx, decoration.url, useAuth);
      return { resolvedSrc: httpUrl, presetSvg: null, glowColor: glow, animation: anim, scale: sc };
    }

    // Direct URL (http, https, data URI)
    return { resolvedSrc: decoration.url, presetSvg: null, glowColor: glow, animation: anim, scale: sc };
  }, [decoration, mx, useAuth]);

  if (!resolvedSrc && !presetSvg) return null;

  const animationStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${(scale || 1.18) * 100}%`,
    height: `${(scale || 1.18) * 100}%`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 2,
    filter: glowColor
      ? `drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 12px ${glowColor}66)`
      : undefined,
  };

  return (
    <>
      <style>{`
        @keyframes cinnyFlareSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes cinnyFlarePulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
        }
        @keyframes cinnyFlareFloat {
          0%, 100% { transform: translate(-50%, -50%); }
          50% { transform: translate(-50%, calc(-50% - 3px)); }
        }
        .cinny-flare-spin {
          animation: cinnyFlareSpin 8s linear infinite !important;
        }
        .cinny-flare-pulse {
          animation: cinnyFlarePulse 3s ease-in-out infinite !important;
        }
        .cinny-flare-float {
          animation: cinnyFlareFloat 2.5s ease-in-out infinite !important;
        }
      `}</style>
      <div
        className={`cinny-avatar-flair-container ${
          animation === 'spin-slow'
            ? 'cinny-flare-spin'
            : animation === 'pulse'
            ? 'cinny-flare-pulse'
            : animation === 'float'
            ? 'cinny-flare-float'
            : ''
        } ${className || ''}`}
        style={animationStyle}
      >
        {presetSvg ? (
          <div
            style={{ width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{ __html: presetSvg }}
          />
        ) : (
          <img
            src={resolvedSrc!}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>
    </>
  );
}
