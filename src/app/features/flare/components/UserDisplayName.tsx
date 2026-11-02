import React, { ReactNode, useEffect } from 'react';
import {
  DisplayNameStyle,
  ProfileFont,
  DISCORD_FONTS,
  DISCORD_EFFECTS,
} from '../types';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../../utils/matrix';
import { loadCustomFont, loadGoogleFont } from '../fontLoader';

type UserDisplayNameProps = {
  style?: DisplayNameStyle | ProfileFont | null;
  children: ReactNode;
  className?: string;
  customStyle?: React.CSSProperties;
};

export function UserDisplayName({
  style,
  children,
  className,
  customStyle,
}: UserDisplayNameProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();

  if (!style) {
    return <span className={className} style={customStyle}>{children}</span>;
  }

  // Normalize style from either DisplayNameStyle or ProfileFont
  let fontId = (style as DisplayNameStyle).fontId;
  let effect = (style as DisplayNameStyle).effect || 'solid';
  let color = (style as DisplayNameStyle).color || (style as ProfileFont).textColor || '#22c55e';
  let gradient = (style as DisplayNameStyle).gradient;
  let customFamily = (style as any).fontFamily || (style as ProfileFont).family;
  let fontUrl = (style as any).fontUrl || (style as ProfileFont).url;

  // Resolve font family from DISCORD_FONTS or custom
  const matchedFont = fontId ? DISCORD_FONTS.find((f) => f.id === fontId) : undefined;
  let fontFamily = matchedFont ? matchedFont.family : customFamily ? `"${customFamily}", sans-serif` : undefined;

  // Dynamically load custom uploaded font or Google font
  useEffect(() => {
    if (fontUrl) {
      const resolved = fontUrl.startsWith('mxc://')
        ? mxcUrlToHttp(mx, fontUrl, useAuth)
        : fontUrl;
      if (resolved) {
        loadCustomFont(customFamily || 'CustomUserFont', resolved);
      }
    } else if (customFamily && !matchedFont) {
      loadGoogleFont(customFamily);
    }
  }, [fontUrl, customFamily, matchedFont, mx, useAuth]);

  // Compute CSS for each Discord effect
  let effectStyles: React.CSSProperties = {};

  switch (effect) {
    case 'neon':
      effectStyles = {
        color: color || '#22c55e',
        textShadow: `0 0 6px ${color || '#22c55e'}, 0 0 12px ${color || '#22c55e'}, 0 0 18px ${color || '#22c55e'}`,
      };
      break;

    case 'gradient':
      effectStyles = {
        backgroundImage: gradient || 'linear-gradient(90deg, #22c55e 0%, #06b6d4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
      break;

    case 'prism':
      effectStyles = {
        backgroundImage:
          'linear-gradient(90deg, #ff007f 0%, #7928ca 25%, #0070f3 50%, #00dfd8 75%, #ff4b4b 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 5px rgba(255, 0, 128, 0.4))',
      };
      break;

    case 'toon':
      effectStyles = {
        color: color || '#f43f5e',
        WebkitTextStroke: '1px #000000',
        textShadow: '2px 2px 0px #000000',
      };
      break;

    case 'pop':
      effectStyles = {
        color: color || '#10b981',
        textShadow:
          '1px 1px 0px #000, 2px 2px 0px #000, 3px 3px 0px #000, 4px 4px 5px rgba(0,0,0,0.5)',
      };
      break;

    case 'gummy':
      effectStyles = {
        color: color || '#ec4899',
        textShadow: `0 2px 0 rgba(0,0,0,0.5), 0 0 8px ${color || '#ec4899'}`,
      };
      break;

    case 'solid':
    default:
      effectStyles = {
        color: color || undefined,
      };
      break;
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily,
        ...effectStyles,
        ...customStyle,
      }}
    >
      {children}
    </span>
  );
}
