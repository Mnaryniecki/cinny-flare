import React, { ReactNode, useEffect } from 'react';
import { ProfileNameplate, ProfileFont, PRESET_NAMEPLATES, PRESET_FONTS } from '../types';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../../utils/matrix';
import { loadCustomFont, loadGoogleFont } from '../fontLoader';

type UserNameplateProps = {
  nameplate?: ProfileNameplate;
  font?: ProfileFont;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function UserNameplate({ nameplate, font, children, className, style }: UserNameplateProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();

  // 1. Resolve Font Preset or Custom
  const presetFont = font?.preset ? PRESET_FONTS.find((f) => f.id === font.preset) : undefined;

  let fontFamily: string | undefined = undefined;
  let letterSpacing: string | undefined = undefined;
  let textShadow: string | undefined = undefined;
  let fontWeight: string | undefined = undefined;
  let textTransform: any = font?.textTransform && font.textTransform !== 'none' ? font.textTransform : undefined;
  let textColor: string | undefined = font?.textColor || undefined;

  if (presetFont) {
    fontFamily = presetFont.family;
    letterSpacing = presetFont.letterSpacing;
    textShadow = presetFont.textShadow;
    fontWeight = presetFont.weight;
  }

  // Load custom uploaded font if present
  useEffect(() => {
    if (font?.url) {
      const resolvedUrl = font.url.startsWith('mxc://')
        ? mxcUrlToHttp(mx, font.url, useAuth)
        : font.url;
      if (resolvedUrl) {
        const familyName = font.family || 'CinnyCustomFont';
        loadCustomFont(familyName, resolvedUrl);
      }
    } else if (font?.family && !presetFont) {
      // Dynamic Google Font loader
      loadGoogleFont(font.family);
    }
  }, [font?.url, font?.family, mx, useAuth, presetFont]);

  if (font?.url) {
    fontFamily = `"${font.family || 'CinnyCustomFont'}", sans-serif`;
  } else if (font?.family && !presetFont) {
    fontFamily = `"${font.family}", sans-serif`;
  }

  // User-defined overrides
  if (font?.letterSpacing && font.letterSpacing !== 'normal') {
    letterSpacing = font.letterSpacing;
  }
  if (font?.textShadow && font.textShadow !== 'none') {
    textShadow = font.textShadow;
  }
  if (font?.weight && font.weight !== 'normal') {
    fontWeight = font.weight;
  }

  // 2. Resolve Nameplate Background
  const hasNameplate = Boolean(nameplate && (nameplate.preset || nameplate.url || nameplate.gradient));
  const hasFont = Boolean(font && (font.preset || font.family || font.url || font.textShadow || font.textColor || font.letterSpacing));

  if (!hasNameplate && !hasFont) {
    return <span className={className} style={style}>{children}</span>;
  }

  // Case A: Custom font only (no banner background)
  if (!hasNameplate && hasFont) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily,
          letterSpacing,
          textShadow,
          fontWeight,
          textTransform,
          color: textColor,
          maxWidth: '100%',
          ...style,
        }}
      >
        {children}
      </span>
    );
  }

  // Case B: Nameplate background (with or without custom font)
  const presetNameplate = PRESET_NAMEPLATES.find((p) => p.id === nameplate?.preset);

  let background = nameplate?.gradient || presetNameplate?.gradient;
  let border = presetNameplate?.border || '1px solid rgba(255, 255, 255, 0.15)';
  let color = textColor || nameplate?.textColor || presetNameplate?.textColor || undefined;

  if (nameplate?.url) {
    const resolvedUrl = nameplate.url.startsWith('mxc://')
      ? mxcUrlToHttp(mx, nameplate.url, useAuth)
      : nameplate.url;
    if (resolvedUrl) {
      background = `url(${resolvedUrl}) center/cover no-repeat`;
    }
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '6px',
        background: background || undefined,
        border,
        color,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily,
        letterSpacing,
        fontWeight,
        textTransform,
        ...style,
      }}
    >
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          textShadow: textShadow || '0 1px 3px rgba(0,0,0,0.8)',
          fontFamily,
          letterSpacing,
          fontWeight,
          textTransform,
          color,
        }}
      >
        {children}
      </span>
    </span>
  );
}
