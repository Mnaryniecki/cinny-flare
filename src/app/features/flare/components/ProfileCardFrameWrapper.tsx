import React, { ReactNode } from 'react';
import { ProfileCardFrame, PRESET_FRAMES } from '../types';

type ProfileCardFrameWrapperProps = {
  frame?: ProfileCardFrame;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function ProfileCardFrameWrapper({
  frame,
  children,
  className,
  style,
}: ProfileCardFrameWrapperProps) {
  if (!frame || (!frame.preset && !frame.url && !frame.borderColor)) {
    return <div className={className} style={style}>{children}</div>;
  }

  const preset = PRESET_FRAMES.find((p) => p.id === frame.preset);

  const frameStyle: React.CSSProperties = {
    position: 'relative',
    transition: 'all 0.25s ease',
    ...preset?.style,
    border: frame.borderColor ? `2px solid ${frame.borderColor}` : preset?.style?.border,
    boxShadow: frame.borderColor ? `0 0 20px ${frame.borderColor}66` : preset?.style?.boxShadow,
    ...style,
  };

  return (
    <div className={className} style={frameStyle}>
      {children}
    </div>
  );
}
