import React, { ReactNode } from 'react';
import { ProfileNameplate, PRESET_NAMEPLATES } from '../types';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../../utils/matrix';

type UserNameplateProps = {
  nameplate?: ProfileNameplate;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function UserNameplate({ nameplate, children, className, style }: UserNameplateProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();

  if (!nameplate || (!nameplate.preset && !nameplate.url && !nameplate.gradient)) {
    return <span className={className} style={style}>{children}</span>;
  }

  const preset = PRESET_NAMEPLATES.find((p) => p.id === nameplate.preset);

  let background = nameplate.gradient || preset?.gradient;
  let border = preset?.border || '1px solid rgba(255, 255, 255, 0.15)';
  let color = nameplate.textColor || preset?.textColor || undefined;

  if (nameplate.url) {
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
        ...style,
      }}
    >
      {/* Pattern texture overlay for Scratch Marks */}
      {preset?.pattern && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: preset.pattern,
            pointerEvents: 'none',
            opacity: 0.6,
          }}
        />
      )}
      <span style={{ position: 'relative', zIndex: 1, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
        {children}
      </span>
    </span>
  );
}
