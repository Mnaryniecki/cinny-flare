import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  config,
  Header,
  Icon,
  Icons,
  Input,
  Scroll,
  Text,
} from 'folds';
import {
  DisplayNameStyle,
  DisplayNameEffect,
  DISCORD_FONTS,
  DISCORD_EFFECTS,
  DISCORD_COLORS,
  DISCORD_GRADIENTS,
  ProfileFlare,
} from '../types';
import { UserDisplayName } from './UserDisplayName';
import { AvatarDecorationOverlay } from './AvatarDecorationOverlay';
import { UserAvatar } from '../../../components/user-avatar';
import { nameInitials } from '../../../utils/common';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../../utils/matrix';
import { uploadFlareMedia } from '../api';
import { loadCustomFont } from '../fontLoader';

type DisplayNameStyleModalProps = {
  currentStyle?: DisplayNameStyle;
  flare: ProfileFlare;
  displayName: string;
  myUserId: string;
  avatarUrl?: string;
  onSave: (style: DisplayNameStyle) => void;
  onClose: () => void;
};

export function DisplayNameStyleModal({
  currentStyle,
  flare,
  displayName,
  myUserId,
  avatarUrl,
  onSave,
  onClose,
}: DisplayNameStyleModalProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();
  const fontUploadRef = useRef<HTMLInputElement>(null);

  const [style, setStyle] = useState<DisplayNameStyle>({
    fontId: currentStyle?.fontId || 'default',
    fontFamily: currentStyle?.fontFamily || '',
    fontUrl: currentStyle?.fontUrl || '',
    effect: currentStyle?.effect || 'neon',
    color: currentStyle?.color || '#22c55e',
    gradient: currentStyle?.gradient || 'linear-gradient(90deg, #22c55e 0%, #06b6d4 100%)',
  });

  const [uploading, setUploading] = useState(false);

  // Handle custom font file upload
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const mxc = await uploadFlareMedia(mx, file);
      const familyName = file.name.replace(/\.[^/.]+$/, '').trim();
      const resolved = mxc.startsWith('mxc://') ? mxcUrlToHttp(mx, mxc, useAuth) : mxc;
      if (resolved) {
        loadCustomFont(familyName, resolved);
      }
      setStyle((prev) => ({
        ...prev,
        fontId: 'custom',
        fontFamily: familyName,
        fontUrl: mxc,
      }));
    } catch (err: any) {
      alert(`Font upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Surprise Me: randomizes font, effect, and color
  const handleSurpriseMe = () => {
    const randomFont = DISCORD_FONTS[Math.floor(Math.random() * DISCORD_FONTS.length)];
    const randomEffect = DISCORD_EFFECTS[Math.floor(Math.random() * DISCORD_EFFECTS.length)];
    const randomColor = DISCORD_COLORS[Math.floor(Math.random() * DISCORD_COLORS.length)];
    const randomGrad = DISCORD_GRADIENTS[Math.floor(Math.random() * DISCORD_GRADIENTS.length)];

    setStyle({
      fontId: randomFont.id,
      fontFamily: '',
      fontUrl: '',
      effect: randomEffect.id,
      color: randomColor.hex,
      gradient: randomGrad.gradient,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '90vh',
          background: '#2b2d31',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={fontUploadRef}
          type="file"
          accept=".woff2,.woff,.ttf,.otf,font/*"
          style={{ display: 'none' }}
          onChange={handleFontUpload}
        />

        {/* Modal Header */}
        <Header
          size="500"
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#1e1f22',
          }}
        >
          <Box justifyContent="SpaceBetween" alignItems="Center" style={{ width: '100%' }}>
            <Text size="H400" style={{ fontWeight: 700, color: '#f2f3f5' }}>
              Change Display Name Style
            </Text>
            <Button size="300" variant="Surface" fill="None" radii="Pill" onClick={onClose}>
              <Icon src={Icons.Cross} size="100" />
            </Button>
          </Box>
        </Header>

        {/* Modal Body: Left controls + Right multi-context preview */}
        <Scroll style={{ flex: 1, padding: '24px' }}>
          <Box gap="600" wrap="Wrap" style={{ alignItems: 'flex-start' }}>
            {/* LEFT: Choose Font, Effect, Color */}
            <Box direction="Column" gap="400" style={{ flex: '1 1 420px', minWidth: 320 }}>
              {/* 1. CHOOSE FONT (4x3 "Gg" Grid) */}
              <Box direction="Column" gap="200">
                <Text
                  size="L100"
                  style={{ textTransform: 'uppercase', fontWeight: 700, color: '#b5bac1' }}
                >
                  CHOOSE FONT
                </Text>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                  }}
                >
                  {DISCORD_FONTS.map((f) => {
                    const isSelected = style.fontId === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() =>
                          setStyle((prev) => ({
                            ...prev,
                            fontId: f.id,
                            fontFamily: '',
                            fontUrl: '',
                          }))
                        }
                        style={{
                          height: 64,
                          borderRadius: '8px',
                          background: isSelected ? '#1e1f22' : '#313338',
                          border: isSelected
                            ? '2.5px solid #5865f2'
                            : '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontFamily: f.family,
                          fontSize: 22,
                          color: '#ffffff',
                          transition: 'all 0.15s ease',
                        }}
                        title={f.name}
                      >
                        {f.sample}
                      </div>
                    );
                  })}
                </div>

                {/* Upload Custom Font Button */}
                <Box gap="200" alignItems="Center" style={{ marginTop: 4 }}>
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => fontUploadRef.current?.click()}
                  >
                    <Text size="B200">
                      {uploading
                        ? 'Uploading...'
                        : style.fontId === 'custom' && style.fontFamily
                        ? `Custom: ${style.fontFamily}`
                        : '+ Upload Custom Font (.woff2/.ttf)'}
                    </Text>
                  </Button>
                </Box>
              </Box>

              {/* 2. CHOOSE EFFECT */}
              <Box direction="Column" gap="200" style={{ marginTop: 4 }}>
                <Text
                  size="L100"
                  style={{ textTransform: 'uppercase', fontWeight: 700, color: '#b5bac1' }}
                >
                  CHOOSE EFFECT
                </Text>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                  }}
                >
                  {DISCORD_EFFECTS.map((eff) => {
                    const isSelected = style.effect === eff.id;
                    return (
                      <div
                        key={eff.id}
                        onClick={() => setStyle((prev) => ({ ...prev, effect: eff.id }))}
                        style={{
                          height: 48,
                          borderRadius: '8px',
                          background: isSelected ? '#1e1f22' : '#313338',
                          border: isSelected
                            ? '2.5px solid #5865f2'
                            : '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <UserDisplayName
                          style={{
                            effect: eff.id,
                            color:
                              eff.id === 'toon'
                                ? '#f43f5e'
                                : eff.id === 'pop'
                                ? '#10b981'
                                : eff.id === 'gummy'
                                ? '#ec4899'
                                : eff.id === 'neon'
                                ? '#a855f7'
                                : '#ffffff',
                          }}
                        >
                          <Text size="B200" style={{ fontWeight: 700 }}>
                            {eff.label}
                          </Text>
                        </UserDisplayName>
                      </div>
                    );
                  })}
                </div>
              </Box>

              {/* 3. CHOOSE COLOR */}
              <Box direction="Column" gap="200" style={{ marginTop: 4 }}>
                <Text
                  size="L100"
                  style={{ textTransform: 'uppercase', fontWeight: 700, color: '#b5bac1' }}
                >
                  CHOOSE COLOR
                </Text>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Eyedropper Custom Color Picker */}
                  <label
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#313338',
                      border: '2px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    title="Custom Color Picker"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m14 7 3 3m-9 9-4 1 1-4 10-10a2.828 2.828 0 1 1 4 4L6 17Z" />
                      <path d="m16 5 3 3" />
                    </svg>
                    <input
                      type="color"
                      value={style.color || '#22c55e'}
                      onChange={(e) =>
                        setStyle((prev) => ({
                          ...prev,
                          color: e.target.value,
                          gradient: `linear-gradient(90deg, ${e.target.value} 0%, #06b6d4 100%)`,
                        }))
                      }
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        inset: 0,
                        cursor: 'pointer',
                      }}
                    />
                  </label>

                  {/* Preset Colors */}
                  {DISCORD_COLORS.map((col) => {
                    const isSelected = style.color === col.hex;
                    return (
                      <div
                        key={col.id}
                        onClick={() =>
                          setStyle((prev) => ({
                            ...prev,
                            color: col.hex,
                            gradient: `linear-gradient(90deg, ${col.hex} 0%, #06b6d4 100%)`,
                          }))
                        }
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: col.hex,
                          cursor: 'pointer',
                          border: isSelected
                            ? '3px solid #ffffff'
                            : '2px solid rgba(0,0,0,0.3)',
                          boxShadow: isSelected ? '0 0 10px rgba(255,255,255,0.5)' : undefined,
                        }}
                        title={col.name}
                      />
                    );
                  })}
                </div>

                {/* Preset Gradient Swatches */}
                {(style.effect === 'gradient' || style.effect === 'prism') && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: 6, flexWrap: 'wrap' }}>
                    {DISCORD_GRADIENTS.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setStyle((prev) => ({ ...prev, gradient: g.gradient }))}
                        style={{
                          width: 48,
                          height: 24,
                          borderRadius: '12px',
                          background: g.gradient,
                          cursor: 'pointer',
                          border:
                            style.gradient === g.gradient
                              ? '2px solid #ffffff'
                              : '1px solid rgba(0,0,0,0.4)',
                        }}
                        title={g.name}
                      />
                    ))}
                  </div>
                )}
              </Box>
            </Box>

            {/* RIGHT: LIVE MULTI-CONTEXT PREVIEW (Matching Discord) */}
            <Box
              direction="Column"
              gap="300"
              style={{
                flex: '1 1 360px',
                minWidth: 300,
                background: '#1e1f22',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <Text
                size="L100"
                style={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#949ba4',
                  letterSpacing: '0.5px',
                }}
              >
                PREVIEW
              </Text>

              {/* 1. Mini Profile Card Preview */}
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background:
                    flare.cardTheme?.gradient ||
                    'linear-gradient(180deg, #420914 0%, #1a0206 100%)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                {/* Banner */}
                <div
                  style={{
                    height: 80,
                    width: '100%',
                    background: flare.banner?.url
                      ? `url(${mxcUrlToHttp(mx, flare.banner.url, useAuth)}) center/cover`
                      : flare.banner?.gradient || flare.banner?.themeColor || '#76c800',
                  }}
                />
                <div style={{ padding: '0 16px 16px', marginTop: -32 }}>
                  <div
                    style={{
                      position: 'relative',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: '#1a0206',
                      padding: 3,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#2b2d31',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UserAvatar
                        userId={myUserId}
                        src={avatarUrl}
                        renderFallback={() => (
                          <Text size="H4" style={{ color: '#fff' }}>
                            {nameInitials(displayName)}
                          </Text>
                        )}
                      />
                    </div>
                    {flare.avatarDecoration?.url && (
                      <AvatarDecorationOverlay decoration={flare.avatarDecoration} />
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <UserDisplayName style={style}>
                      <Text size="H400" style={{ fontWeight: 700 }}>
                        {displayName}
                      </Text>
                    </UserDisplayName>
                    <Text size="L100" style={{ color: '#949ba4', marginTop: 2 }}>
                      {displayName} • {flare.pronouns || 'Cheese/Burger'}
                    </Text>
                  </div>
                </div>
              </div>

              {/* 2. Chat Message Preview */}
              <div
                style={{
                  padding: '12px 14px',
                  background: '#2b2d31',
                  borderRadius: '10px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#1e1f22',
                    flexShrink: 0,
                  }}
                >
                  <UserAvatar
                    userId={myUserId}
                    src={avatarUrl}
                    renderFallback={() => (
                      <Text size="H5" style={{ color: '#fff' }}>
                        {nameInitials(displayName)}
                      </Text>
                    )}
                  />
                  {flare.avatarDecoration?.url && (
                    <AvatarDecorationOverlay decoration={flare.avatarDecoration} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                    <UserDisplayName style={style}>
                      <Text size="T300" style={{ fontWeight: 700 }}>
                        {displayName}
                      </Text>
                    </UserDisplayName>
                    <Text size="L100" style={{ color: '#949ba4', fontSize: 11 }}>
                      1:10 AM
                    </Text>
                  </div>
                  <Text size="T200" style={{ color: '#dbdee1', marginTop: 2 }}>
                    does anyone read this?
                  </Text>
                </div>
              </div>

              {/* 3. Member List Tile Preview */}
              <div
                style={{
                  padding: '8px 12px',
                  background: '#2b2d31',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#1e1f22',
                    flexShrink: 0,
                  }}
                >
                  <UserAvatar
                    userId={myUserId}
                    src={avatarUrl}
                    renderFallback={() => (
                      <Text size="H6" style={{ color: '#fff' }}>
                        {nameInitials(displayName)}
                      </Text>
                    )}
                  />
                  {flare.avatarDecoration?.url && (
                    <AvatarDecorationOverlay decoration={flare.avatarDecoration} />
                  )}
                </div>
                <UserDisplayName style={style}>
                  <Text size="T300" style={{ fontWeight: 700 }}>
                    {displayName}
                  </Text>
                </UserDisplayName>
              </div>

              <Text size="L100" style={{ color: '#949ba4', fontSize: 11, lineHeight: '1.4' }}>
                Note: Display name colors and effects will appear across all rooms, server member lists, and profile cards.
              </Text>
            </Box>
          </Box>
        </Scroll>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#1e1f22',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            size="300"
            variant="Secondary"
            fill="Outline"
            radii="Pill"
            onClick={handleSurpriseMe}
          >
            <Text size="B200">🎲 Surprise Me</Text>
          </Button>

          <Box gap="200">
            <Button size="300" variant="Surface" fill="None" radii="Pill" onClick={onClose}>
              <Text size="B200">Cancel</Text>
            </Button>
            <Button
              size="300"
              variant="Primary"
              fill="Solid"
              radii="Pill"
              onClick={() => {
                onSave(style);
                onClose();
              }}
            >
              <Text size="B200" style={{ fontWeight: 700 }}>
                Apply
              </Text>
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
}
