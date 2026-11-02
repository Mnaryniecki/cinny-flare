import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Chip,
  config,
  Header,
  Icon,
  Icons,
  Input,
  Scroll,
  Text,
} from 'folds';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { mxcUrlToHttp, getMxIdLocalPart } from '../../../utils/matrix';
import { nameInitials } from '../../../utils/common';
import { UserAvatar } from '../../../components/user-avatar';
import {
  DEFAULT_FLARE,
  PRESET_DECORATIONS,
  PRESET_NAMEPLATES,
  PRESET_FONTS,
  PRESET_TEXT_GLOWS,
  PRESET_EFFECTS,
  PRESET_FRAMES,
  PRESET_CARD_THEMES,
  ProfileFlare,
  ShowcaseBoard,
} from '../types';
import { getUserFlare, saveUserFlare, uploadFlareMedia } from '../api';
import { loadCustomFont, loadGoogleFont } from '../fontLoader';
import { AvatarDecorationOverlay } from './AvatarDecorationOverlay';
import { UserNameplate } from './UserNameplate';
import { UserDisplayName } from './UserDisplayName';
import { DisplayNameStyleModal } from './DisplayNameStyleModal';
import { ProfileEffectOverlay } from './ProfileEffectOverlay';
import { ProfileCardFrameWrapper } from './ProfileCardFrameWrapper';
import { FlareProfileBoard } from './FlareProfileBoard';
import { CardGradientPicker } from './CardGradientPicker';

type FlareSettingsProps = {
  requestClose: () => void;
};

type ActiveSection =
  | 'nameplate'
  | 'avatar'
  | 'banner'
  | 'theme'
  | 'effectFrame'
  | 'font'
  | 'bioBoards'
  | null;

export function FlareSettings({ requestClose }: FlareSettingsProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();
  const myUserId = mx.getSafeUserId();
  const profile = useUserProfile(myUserId);

  const [flare, setFlare] = useState<ProfileFlare>(DEFAULT_FLARE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('font');
  const [googleFontInput, setGoogleFontInput] = useState('');
  const [replayEffectKey, setReplayEffectKey] = useState(0);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const nameplateInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const effectInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Load current flare on mount
  useEffect(() => {
    let isMounted = true;
    getUserFlare(mx, myUserId).then((data) => {
      if (isMounted) {
        if (data) {
          setFlare((prev) => ({
            ...prev,
            ...data,
            cardTheme: data.cardTheme || prev.cardTheme || DEFAULT_FLARE.cardTheme,
            banner: data.banner || prev.banner || DEFAULT_FLARE.banner,
          }));
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [mx, myUserId]);

  const displayName = profile.displayName || getMxIdLocalPart(myUserId) || myUserId;
  const avatarUrl = profile.avatarUrl
    ? mxcUrlToHttp(mx, profile.avatarUrl, useAuth, 96, 96, 'crop') ?? undefined
    : undefined;

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await saveUserFlare(mx, flare);
      setSaveStatus('Profile saved successfully to Matrix!');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    layer: 'avatar' | 'nameplate' | 'font' | 'effect' | 'frame' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaveStatus(`Uploading ${layer}...`);
      const mxc = await uploadFlareMedia(mx, file);

      if (layer === 'avatar') {
        setFlare((prev) => ({
          ...prev,
          avatarDecoration: {
            url: mxc,
            animation: prev.avatarDecoration?.animation || 'none',
            glowColor: prev.avatarDecoration?.glowColor || '#ea580c',
            scale: 1.18,
          },
        }));
      } else if (layer === 'nameplate') {
        setFlare((prev) => ({
          ...prev,
          nameplate: {
            ...prev.nameplate,
            url: mxc,
            preset: '',
          },
        }));
      } else if (layer === 'font') {
        const familyName = file.name.replace(/\.[^/.]+$/, '').trim();
        const resolvedUrl = mxc.startsWith('mxc://') ? mxcUrlToHttp(mx, mxc, useAuth) : mxc;
        if (resolvedUrl) {
          loadCustomFont(familyName, resolvedUrl);
        }
        setFlare((prev) => ({
          ...prev,
          font: {
            ...prev.font,
            preset: 'custom',
            family: familyName,
            url: mxc,
          },
        }));
      } else if (layer === 'effect') {
        setFlare((prev) => ({
          ...prev,
          profileEffect: {
            ...prev.profileEffect,
            url: mxc,
            preset: '',
          },
        }));
        setReplayEffectKey((k) => k + 1);
      } else if (layer === 'frame') {
        setFlare((prev) => ({
          ...prev,
          profileFrame: {
            ...prev.profileFrame,
            url: mxc,
            preset: '',
          },
        }));
      } else if (layer === 'banner') {
        setFlare((prev) => ({
          ...prev,
          banner: {
            type: file.type.startsWith('video/') ? 'video' : 'image',
            url: mxc,
            themeColor: prev.banner?.themeColor || '#76c800',
          },
        }));
      }
      setSaveStatus('Uploaded! Remember to click Save Changes.');
    } catch (err: any) {
      setSaveStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleAddSampleBoard = () => {
    const sampleBoard: ShowcaseBoard = {
      id: `board_${Date.now()}`,
      title: 'Marvel Rivals & Gaming',
      type: 'cards',
      items: [
        {
          id: `item_1`,
          title: 'Marvel Rivals',
          subtitle: 'Top Hero: Thor | 30 Matches',
          tags: ['Obsessed', 'Competitive'],
        },
        {
          id: `item_2`,
          title: 'Deep Rock Galactic',
          subtitle: 'Rock and Stone!',
          tags: ['Co-Op', 'Favorite Game'],
        },
      ],
    };

    setFlare((prev) => ({
      ...prev,
      boards: [...(prev.boards || []), sampleBoard],
    }));
  };

  if (loading) {
    return (
      <Box style={{ padding: config.space.S400 }} justifyContent="Center">
        <Text size="T300">Loading profile...</Text>
      </Box>
    );
  }

  // Active decoration/nameplate/effect/frame for previews
  const activeDecoration = flare.avatarDecoration?.url;
  const activeNameplatePreset = PRESET_NAMEPLATES.find((p) => p.id === flare.nameplate?.preset);
  const activeFontPreset = PRESET_FONTS.find((f) => f.id === flare.font?.preset);
  const activeEffectPreset = PRESET_EFFECTS.find((p) => p.id === flare.profileEffect?.preset);
  const activeFramePreset = PRESET_FRAMES.find((p) => p.id === flare.profileFrame?.preset);
  const activeCardTheme = PRESET_CARD_THEMES.find((t) => t.id === flare.cardTheme?.preset);

  return (
    <Box direction="Column" style={{ width: '100%', height: '100%', background: '#111214' }}>
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*,video/webm"
        style={{ display: 'none' }}
        onChange={(e) => handleCustomUpload(e, 'avatar')}
      />
      <input
        ref={nameplateInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleCustomUpload(e, 'nameplate')}
      />
      <input
        ref={fontInputRef}
        type="file"
        accept=".woff2,.woff,.ttf,.otf,font/*"
        style={{ display: 'none' }}
        onChange={(e) => handleCustomUpload(e, 'font')}
      />
      <input
        ref={effectInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        style={{ display: 'none' }}
        onChange={(e) => handleCustomUpload(e, 'effect')}
      />
      <input
        ref={frameInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleCustomUpload(e, 'frame')}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        style={{ display: 'none' }}
        onChange={(e) => handleCustomUpload(e, 'banner')}
      />

      {/* Top Header - Discord Style */}
      <Header
        size="500"
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '14px 24px',
          background: '#1e1f22',
        }}
      >
        <Box justifyContent="SpaceBetween" alignItems="Center" style={{ width: '100%' }}>
          <Box alignItems="Center" gap="200">
            <Icon size="200" src={Icons.User} />
            <Text size="H400" style={{ fontWeight: config.fontWeight.W700, color: '#f2f3f5' }}>
              Main Profile
            </Text>
          </Box>
          <Box alignItems="Center" gap="300">
            {saveStatus && (
              <Text
                size="T200"
                style={{
                  color:
                    saveStatus.includes('failed') || saveStatus.includes('Failed')
                      ? '#ef4444'
                      : '#22c55e',
                  fontWeight: config.fontWeight.W600,
                }}
              >
                {saveStatus}
              </Text>
            )}
            <Button
              size="300"
              variant="Primary"
              fill="Solid"
              radii="Pill"
              disabled={saving}
              onClick={handleSave}
            >
              <Text size="B300" style={{ fontWeight: config.fontWeight.W700 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </Button>
            <Button size="300" variant="Surface" fill="None" radii="Pill" onClick={requestClose}>
              <Icon src={Icons.Cross} size="100" />
            </Button>
          </Box>
        </Box>
      </Header>

      <Scroll style={{ flex: 1, padding: '24px' }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '24px',
          }}
        >
          {/* ========================================================= */}
          {/* LEFT COLUMN: DISCORD-STYLE EDIT PROFILE SIDEBAR PANEL       */}
          {/* ========================================================= */}
          <Box
            direction="Column"
            gap="300"
            style={{
              flex: '0 0 340px',
              width: 340,
              minWidth: 320,
              background: '#1e1f22',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <Text
              size="L200"
              style={{
                textTransform: 'uppercase',
                fontWeight: config.fontWeight.W700,
                color: '#949ba4',
                letterSpacing: '0.5px',
                marginBottom: 4,
              }}
            >
              Customization Options
            </Text>

            {/* 1. DISPLAY NAME STYLE */}
            <div
              style={{
                background: '#2b2d31',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <Box justifyContent="SpaceBetween" alignItems="Center" gap="200">
                <Box direction="Column" gap="50" style={{ minWidth: 0, flex: 1 }}>
                  <Text size="L100" style={{ color: '#949ba4', fontWeight: config.fontWeight.W700 }}>
                    DISPLAY NAME STYLE
                  </Text>
                  <div style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <UserDisplayName style={flare.displayNameStyle || flare.font}>
                      <Text size="T300" style={{ fontWeight: config.fontWeight.W700 }} truncate>
                        {displayName}
                      </Text>
                    </UserDisplayName>
                  </div>
                </Box>
                <Button
                  size="300"
                  variant="Primary"
                  fill="Solid"
                  radii="Pill"
                  style={{ flexShrink: 0 }}
                  onClick={() => setShowDisplayNameModal(true)}
                >
                  <Text size="B200" style={{ whiteSpace: 'nowrap' }}>Change Style</Text>
                </Button>
              </Box>
            </div>

            {/* 2. NAMEPLATE (SERVER MEMBER LIST) */}
            <div
              style={{
                background:
                  activeSection === 'nameplate' ? 'rgba(234, 88, 12, 0.12)' : '#2b2d31',
                border:
                  activeSection === 'nameplate'
                    ? '1.5px solid #ea580c'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
                cursor: 'pointer',
              }}
              onClick={() => setActiveSection(activeSection === 'nameplate' ? null : 'nameplate')}
            >
              <Box justifyContent="SpaceBetween" alignItems="Center" gap="200">
                <Box direction="Column" gap="100" style={{ minWidth: 0, flex: 1 }}>
                  <Text size="L100" style={{ color: '#949ba4', fontWeight: config.fontWeight.W700 }}>
                    NAMEPLATE (SERVER MEMBER LIST)
                  </Text>
                  {/* Miniature member list tile preview with the nameplate banner! */}
                  <div
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: flare.nameplate?.url
                        ? `url(${flare.nameplate.url.startsWith('mxc://') ? mxcUrlToHttp(mx, flare.nameplate.url, useAuth) : flare.nameplate.url}) center/cover`
                        : activeNameplatePreset?.gradient || '#1e1f22',
                      border: activeNameplatePreset?.border || '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      maxWidth: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ff7b72', flexShrink: 0 }} />
                    <UserDisplayName style={flare.displayNameStyle || flare.font}>
                      <Text size="L100" style={{ fontWeight: 700, color: '#ffffff' }} truncate>
                        {displayName}
                      </Text>
                    </UserDisplayName>
                  </div>
                </Box>
                <Chip size="200" variant={activeSection === 'nameplate' ? 'Primary' : 'Surface'} style={{ flexShrink: 0 }}>
                  <Text size="L100" style={{ whiteSpace: 'nowrap' }}>{activeSection === 'nameplate' ? 'Close' : 'Choose'}</Text>
                </Chip>
              </Box>

              {activeSection === 'nameplate' && (
                <Box
                  direction="Column"
                  gap="300"
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    <div
                      onClick={() =>
                        setFlare((p) => ({ ...p, nameplate: { preset: '', url: '' } }))
                      }
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border:
                          !flare.nameplate?.preset && !flare.nameplate?.url
                            ? '2px solid #ea580c'
                            : '1px solid rgba(255,255,255,0.08)',
                        background: '#1e1f22',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Text size="L100">None</Text>
                    </div>
                    {PRESET_NAMEPLATES.map((p) => (
                      <div
                        key={p.id}
                        onClick={() =>
                          setFlare((prev) => ({
                            ...prev,
                            nameplate: { preset: p.id, gradient: p.gradient, textColor: p.textColor },
                          }))
                        }
                        style={{
                          padding: '10px',
                          borderRadius: '6px',
                          background: p.gradient,
                          border:
                            flare.nameplate?.preset === p.id
                              ? '2px solid #ea580c'
                              : '1px solid rgba(255,255,255,0.08)',
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Text size="L100" style={{ color: p.textColor, fontWeight: 700 }}>
                          {p.name}
                        </Text>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => nameplateInputRef.current?.click()}
                  >
                    <Text size="B200">Upload Custom Nameplate Banner</Text>
                  </Button>
                </Box>
              )}
            </div>

            {/* 3. AVATAR & DECORATION */}
            <div
              style={{
                background:
                  activeSection === 'avatar' ? 'rgba(234, 88, 12, 0.12)' : '#2b2d31',
                border:
                  activeSection === 'avatar'
                    ? '1.5px solid #ea580c'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
              }}
              onClick={() => setActiveSection(activeSection === 'avatar' ? null : 'avatar')}
            >
              <Box justifyContent="SpaceBetween" alignItems="Center" gap="200">
                <Box alignItems="Center" gap="200" style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      position: 'relative',
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#1e1f22',
                      flexShrink: 0,
                    }}
                  >
                    <UserAvatar
                      userId={myUserId}
                      src={avatarUrl}
                      alt=""
                      renderFallback={() => (
                        <Text size="H5" style={{ color: '#fff', fontWeight: 700 }}>
                          {nameInitials(displayName)}
                        </Text>
                      )}
                    />
                    {activeDecoration && (
                      <AvatarDecorationOverlay decoration={flare.avatarDecoration} />
                    )}
                  </div>
                  <Box direction="Column" gap="50" style={{ minWidth: 0, flex: 1 }}>
                    <Text size="L100" style={{ color: '#949ba4', fontWeight: config.fontWeight.W700 }}>
                      AVATAR & DECORATION
                    </Text>
                    <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }} truncate>
                      {activeDecoration ? 'Custom Frame Active' : 'No Decoration'}
                    </Text>
                  </Box>
                </Box>
                <Chip size="200" variant={activeSection === 'avatar' ? 'Primary' : 'Surface'} style={{ flexShrink: 0 }}>
                  <Text size="L100" style={{ whiteSpace: 'nowrap' }}>{activeSection === 'avatar' ? 'Close' : 'Edit'}</Text>
                </Chip>
              </Box>

              {activeSection === 'avatar' && (
                <Box
                  direction="Column"
                  gap="300"
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    <div
                      onClick={() =>
                        setFlare((p) => ({
                          ...p,
                          avatarDecoration: { ...p.avatarDecoration, url: '' },
                        }))
                      }
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: !flare.avatarDecoration?.url
                          ? '2px solid #ea580c'
                          : '1px solid rgba(255,255,255,0.08)',
                        background: '#1e1f22',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Text size="L100">None</Text>
                    </div>
                    {PRESET_DECORATIONS.map((d) => (
                      <div
                        key={d.id}
                        onClick={() =>
                          setFlare((p) => ({
                            ...p,
                            avatarDecoration: {
                              url: `data:image/svg+xml;utf8,${encodeURIComponent(d.svg)}`,
                              animation: d.animation,
                              glowColor: d.glowColor,
                              scale: 1.18,
                            },
                          }))
                        }
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border:
                            flare.avatarDecoration?.glowColor === d.glowColor &&
                            flare.avatarDecoration?.url?.length
                              ? '2px solid #ea580c'
                              : '1px solid rgba(255,255,255,0.08)',
                          background: '#1e1f22',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{ width: 34, height: 34 }}
                          dangerouslySetInnerHTML={{ __html: d.svg }}
                        />
                        <Text size="L100" style={{ fontSize: 10, marginTop: 4 }}>
                          {d.name}
                        </Text>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Text size="B200">Upload Circular Frame (GIF/PNG)</Text>
                  </Button>
                </Box>
              )}
            </div>

            {/* 4. BANNER COLOR & IMAGE */}
            <div
              style={{
                background:
                  activeSection === 'banner' ? 'rgba(234, 88, 12, 0.12)' : '#2b2d31',
                border:
                  activeSection === 'banner'
                    ? '1.5px solid #ea580c'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
              }}
              onClick={() => setActiveSection(activeSection === 'banner' ? null : 'banner')}
            >
              <Box justifyContent="SpaceBetween" alignItems="Center" gap="200">
                <Box alignItems="Center" gap="200" style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 44,
                      height: 28,
                      borderRadius: '6px',
                      background: flare.banner?.url
                        ? `url(${mxcUrlToHttp(mx, flare.banner.url, useAuth)}) center/cover`
                        : flare.banner?.gradient || flare.banner?.themeColor || '#76c800',
                      border: '1px solid rgba(255,255,255,0.2)',
                      flexShrink: 0,
                    }}
                  />
                  <Box direction="Column" gap="50" style={{ minWidth: 0, flex: 1 }}>
                    <Text size="L100" style={{ color: '#949ba4', fontWeight: config.fontWeight.W700 }}>
                      BANNER COLOR / IMAGE
                    </Text>
                    <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }} truncate>
                      {flare.banner?.url ? 'Custom Banner Image' : 'Banner Color Active'}
                    </Text>
                  </Box>
                </Box>
                <Chip size="200" variant={activeSection === 'banner' ? 'Primary' : 'Surface'} style={{ flexShrink: 0 }}>
                  <Text size="L100" style={{ whiteSpace: 'nowrap' }}>{activeSection === 'banner' ? 'Close' : 'Edit'}</Text>
                </Chip>
              </Box>

              {activeSection === 'banner' && (
                <Box
                  direction="Column"
                  gap="300"
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Text size="L100" style={{ color: '#dbdee1' }}>
                    Banner Color Picker & Presets:
                  </Text>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Custom Banner Color Picker */}
                    <label
                      style={{
                        position: 'relative',
                        width: 44,
                        height: 32,
                        borderRadius: '6px',
                        background: flare.banner?.themeColor || '#76c800',
                        border: '2px solid #fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      }}
                      title="Pick Custom Banner Color"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="m14 7 3 3m-9 9-4 1 1-4 10-10a2.828 2.828 0 1 1 4 4L6 17Z" />
                      </svg>
                      <input
                        type="color"
                        value={flare.banner?.themeColor || '#76c800'}
                        onChange={(e) =>
                          setFlare((p) => ({
                            ...p,
                            banner: {
                              type: 'solid',
                              themeColor: e.target.value,
                              gradient: `linear-gradient(135deg, ${e.target.value} 0%, rgba(0,0,0,0.6) 100%)`,
                              url: '',
                            },
                          }))
                        }
                        style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }}
                      />
                    </label>
                    {[
                      { name: 'Neon Lime (Discord)', color: '#76c800', grad: 'linear-gradient(135deg, #76c800 0%, #4d8800 100%)' },
                      { name: 'Entity Crimson', color: '#dc2626', grad: 'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)' },
                      { name: 'Cyber Cyan', color: '#06b6d4', grad: 'linear-gradient(135deg, #083344 0%, #06b6d4 100%)' },
                      { name: 'Void Violet', color: '#a855f7', grad: 'linear-gradient(135deg, #2e1065 0%, #a855f7 100%)' },
                      { name: 'Imperial Gold', color: '#eab308', grad: 'linear-gradient(135deg, #422006 0%, #eab308 100%)' },
                    ].map((b) => (
                      <div
                        key={b.name}
                        onClick={() =>
                          setFlare((p) => ({
                            ...p,
                            banner: { type: 'gradient', gradient: b.grad, themeColor: b.color, url: '' },
                          }))
                        }
                        style={{
                          width: 44,
                          height: 32,
                          borderRadius: '6px',
                          background: b.grad,
                          cursor: 'pointer',
                          border:
                            flare.banner?.themeColor === b.color
                              ? '2px solid #ffffff'
                              : '1px solid rgba(0,0,0,0.4)',
                        }}
                        title={b.name}
                      />
                    ))}
                  </div>
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    <Text size="B200">Upload Banner Image / Video</Text>
                  </Button>
                </Box>
              )}
            </div>

            {/* 5. PROFILE THEME & GRADIENT (VESKTOP PLUGIN STYLE) */}
            <div
              style={{
                background:
                  activeSection === 'theme' ? 'rgba(234, 88, 12, 0.12)' : '#2b2d31',
                border:
                  activeSection === 'theme'
                    ? '1.5px solid #ea580c'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
              }}
              onClick={() => setActiveSection(activeSection === 'theme' ? null : 'theme')}
            >
              <Box justifyContent="SpaceBetween" alignItems="Center" gap="200">
                <Box alignItems="Center" gap="200" style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 44,
                      height: 28,
                      borderRadius: '6px',
                      background:
                        flare.cardTheme?.gradient ||
                        'linear-gradient(180deg, #420914 0%, #1a0206 100%)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      flexShrink: 0,
                    }}
                  />
                  <Box direction="Column" gap="50" style={{ minWidth: 0, flex: 1 }}>
                    <Text size="L100" style={{ color: '#949ba4', fontWeight: config.fontWeight.W700 }}>
                      CARD THEME (GRADIENT)
                    </Text>
                    <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }} truncate>
                      {flare.cardTheme?.primaryColor
                        ? `${flare.cardTheme.primaryColor} → ${flare.cardTheme.accentColor}`
                        : 'Custom Gradient'}
                    </Text>
                  </Box>
                </Box>
                <Chip size="200" variant={activeSection === 'theme' ? 'Primary' : 'Surface'} style={{ flexShrink: 0 }}>
                  <Text size="L100" style={{ whiteSpace: 'nowrap' }}>{activeSection === 'theme' ? 'Close' : 'Edit'}</Text>
                </Chip>
              </Box>

              {activeSection === 'theme' && (
                <Box
                  direction="Column"
                  gap="300"
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardGradientPicker
                    theme={flare.cardTheme}
                    onChange={(updated) =>
                      setFlare((p) => ({
                        ...p,
                        cardTheme: updated,
                      }))
                    }
                  />
                </Box>
              )}
            </div>

            {/* 6. PROFILE EFFECT & FRAME */}
            <div
              style={{
                background:
                  activeSection === 'effectFrame' ? 'rgba(234, 88, 12, 0.12)' : '#2b2d31',
                border:
                  activeSection === 'effectFrame'
                    ? '1.5px solid #ea580c'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
              }}
              onClick={() => setActiveSection(activeSection === 'effectFrame' ? null : 'effectFrame')}
            >
              <Box justifyContent="SpaceBetween" alignItems="Center" gap="200">
                <Box direction="Column" gap="50" style={{ minWidth: 0, flex: 1 }}>
                  <Text size="L100" style={{ color: '#949ba4', fontWeight: config.fontWeight.W700 }}>
                    PROFILE EFFECT & FRAME
                  </Text>
                  <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }} truncate>
                    {activeEffectPreset ? activeEffectPreset.name : flare.profileEffect?.url ? 'Custom Effect' : 'No Effect'} •{' '}
                    {activeFramePreset ? activeFramePreset.name : 'No Frame'}
                  </Text>
                </Box>
                <Chip size="200" variant={activeSection === 'effectFrame' ? 'Primary' : 'Surface'} style={{ flexShrink: 0 }}>
                  <Text size="L100" style={{ whiteSpace: 'nowrap' }}>{activeSection === 'effectFrame' ? 'Close' : 'Edit'}</Text>
                </Chip>
              </Box>

              {activeSection === 'effectFrame' && (
                <Box
                  direction="Column"
                  gap="300"
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Text size="L100" style={{ color: '#dbdee1' }}>
                    Profile Effect (Card Overlay):
                  </Text>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    <div
                      onClick={() => {
                        setFlare((p) => ({ ...p, profileEffect: { preset: '', url: '' } }));
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border:
                          !flare.profileEffect?.preset && !flare.profileEffect?.url
                            ? '2px solid #ea580c'
                            : '1px solid rgba(255,255,255,0.08)',
                        background: '#1e1f22',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Text size="L100">None</Text>
                    </div>
                    {PRESET_EFFECTS.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          setFlare((p) => ({ ...p, profileEffect: { preset: e.id } }));
                          setReplayEffectKey((k) => k + 1);
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border:
                            flare.profileEffect?.preset === e.id
                              ? '2px solid #ea580c'
                              : '1px solid rgba(255,255,255,0.08)',
                          background:
                            flare.profileEffect?.preset === e.id
                              ? 'rgba(234,88,12,0.2)'
                              : '#1e1f22',
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Text size="L100">{e.name}</Text>
                      </div>
                    ))}
                  </div>

                  <Text size="L100" style={{ color: '#dbdee1', marginTop: 6 }}>
                    Profile Outer Frame:
                  </Text>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    <div
                      onClick={() => setFlare((p) => ({ ...p, profileFrame: { preset: '', url: '' } }))}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border:
                          !flare.profileFrame?.preset && !flare.profileFrame?.url
                            ? '2px solid #ea580c'
                            : '1px solid rgba(255,255,255,0.08)',
                        background: '#1e1f22',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Text size="L100">None</Text>
                    </div>
                    {PRESET_FRAMES.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => setFlare((p) => ({ ...p, profileFrame: { preset: f.id } }))}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border:
                            flare.profileFrame?.preset === f.id
                              ? '2px solid #ea580c'
                              : '1px solid rgba(255,255,255,0.08)',
                          background:
                            flare.profileFrame?.preset === f.id
                              ? 'rgba(234,88,12,0.2)'
                              : '#1e1f22',
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Text size="L100">{f.name}</Text>
                      </div>
                    ))}
                  </div>
                  <Box gap="200">
                    <Button
                      size="300"
                      variant="Secondary"
                      fill="Outline"
                      radii="Pill"
                      onClick={() => effectInputRef.current?.click()}
                    >
                      <Text size="B200">Upload Effect (SVG/Video)</Text>
                    </Button>
                    <Button
                      size="300"
                      variant="Secondary"
                      fill="Outline"
                      radii="Pill"
                      onClick={() => frameInputRef.current?.click()}
                    >
                      <Text size="B200">Upload Frame</Text>
                    </Button>
                  </Box>
                </Box>
              )}
            </div>

            {/* 7. BIO & SHOWCASE BOARDS */}
            <div
              style={{
                background:
                  activeSection === 'bioBoards' ? 'rgba(234, 88, 12, 0.12)' : '#2b2d31',
                border:
                  activeSection === 'bioBoards'
                    ? '1.5px solid #ea580c'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
              }}
              onClick={() => setActiveSection(activeSection === 'bioBoards' ? null : 'bioBoards')}
            >
              <Box justifyContent="SpaceBetween" alignItems="Center" gap="200">
                <Box direction="Column" gap="50" style={{ minWidth: 0, flex: 1 }}>
                  <Text size="L100" style={{ color: '#949ba4', fontWeight: config.fontWeight.W700 }}>
                    BIO & SHOWCASE WIDGETS
                  </Text>
                  <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }} truncate>
                    {flare.boards?.length || 0} Widgets Active
                  </Text>
                </Box>
                <Chip size="200" variant={activeSection === 'bioBoards' ? 'Primary' : 'Surface'} style={{ flexShrink: 0 }}>
                  <Text size="L100" style={{ whiteSpace: 'nowrap' }}>{activeSection === 'bioBoards' ? 'Close' : 'Edit'}</Text>
                </Chip>
              </Box>

              {activeSection === 'bioBoards' && (
                <Box
                  direction="Column"
                  gap="300"
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Text size="L100" style={{ color: '#dbdee1' }}>
                    Pronouns:
                  </Text>
                  <Input
                    size="300"
                    value={flare.pronouns || ''}
                    onChange={(e) => setFlare((p) => ({ ...p, pronouns: e.target.value }))}
                    placeholder="e.g. Cheese/Burger • he/him"
                  />
                  <Text size="L100" style={{ color: '#dbdee1' }}>
                    About Me (Bio):
                  </Text>
                  <textarea
                    rows={3}
                    value={flare.bio || ''}
                    onChange={(e) => setFlare((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="I think hamburgers and cheeseburgers work well with fries..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#1e1f22',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      resize: 'vertical',
                    }}
                  />
                  <Box justifyContent="SpaceBetween" alignItems="Center">
                    <Text size="L100" style={{ color: '#dbdee1' }}>
                      Showcase Widgets:
                    </Text>
                    <Button
                      size="200"
                      variant="Secondary"
                      fill="Outline"
                      radii="Pill"
                      onClick={handleAddSampleBoard}
                    >
                      <Text size="B100">+ Add Sample Widget</Text>
                    </Button>
                  </Box>
                </Box>
              )}
            </div>
          </Box>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: THE LIVE DISCORD PROFILE CARD                */}
          {/* ========================================================= */}
          <Box
            direction="Column"
            gap="200"
            style={{
              flex: '1 1 440px',
              minWidth: 360,
              maxWidth: 480,
              position: 'sticky',
              top: 0,
            }}
          >
            <Box justifyContent="SpaceBetween" alignItems="Center">
              <Text
                size="L200"
                style={{
                  fontWeight: config.fontWeight.W700,
                  color: '#949ba4',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                LIVE PROFILE PREVIEW
              </Text>
              <Button
                size="200"
                variant="Secondary"
                fill="None"
                radii="Pill"
                onClick={() => setReplayEffectKey((k) => k + 1)}
              >
                <Text size="B100">↻ Replay Effect</Text>
              </Button>
            </Box>

            {/* Profile Frame Outer Wrapper */}
            <ProfileCardFrameWrapper frame={flare.profileFrame}>
              <div style={{ position: 'relative' }}>
                {/* Temporary Profile Effect Overlay */}
                <ProfileEffectOverlay
                  key={replayEffectKey}
                  effect={flare.profileEffect}
                  forcePlay
                />
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background:
                      flare.cardTheme?.gradient ||
                      'linear-gradient(180deg, #420914 0%, #1a0206 100%)',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >

                {/* Banner Section */}
                <div
                  style={{
                    height: 130,
                    width: '100%',
                    background: flare.banner?.url
                      ? `url(${mxcUrlToHttp(mx, flare.banner.url, useAuth)}) center/cover no-repeat`
                      : flare.banner?.gradient || flare.banner?.themeColor || 'linear-gradient(135deg, #76c800 0%, #4d8800 100%)',
                    position: 'relative',
                  }}
                />

                {/* Avatar and Identity Section */}
                <div style={{ padding: '0 20px 24px', marginTop: -46, position: 'relative', zIndex: 11 }}>
                  {/* Circular Avatar Container - Clean fallback, no broken alt text */}
                  <div
                    style={{
                      position: 'relative',
                      width: 86,
                      height: 86,
                      borderRadius: '50%',
                      background: '#1a0206',
                      padding: 4,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#2b2d31',
                      }}
                    >
                      <UserAvatar
                        userId={myUserId}
                        src={avatarUrl}
                        alt=""
                        renderFallback={() => (
                          <Text size="H2" style={{ fontWeight: 700, color: '#ffffff' }}>
                            {nameInitials(displayName)}
                          </Text>
                        )}
                      />
                    </div>
                    {/* Circular Avatar Decoration */}
                    {activeDecoration && (
                      <AvatarDecorationOverlay decoration={flare.avatarDecoration} />
                    )}
                    {/* Status Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#23a55a',
                        border: '3px solid #1a0206',
                        zIndex: 12,
                      }}
                    />
                  </div>

                  {/* Name styled with font + effect + color */}
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{ cursor: 'pointer', display: 'inline-flex' }}
                      onClick={() => setShowDisplayNameModal(true)}
                      title="Click to customize display name style"
                    >
                      <UserDisplayName style={flare.displayNameStyle || flare.font}>
                        <Text
                          size="H400"
                          style={{
                            fontWeight: config.fontWeight.W700,
                          }}
                        >
                          {displayName}
                        </Text>
                      </UserDisplayName>
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Text size="L200" style={{ color: '#dbdee1', opacity: 0.8 }}>
                        {displayName}
                      </Text>
                      {flare.pronouns && (
                        <Text size="L200" style={{ color: '#949ba4' }}>
                          • {flare.pronouns}
                        </Text>
                      )}
                    </div>
                    <Text size="L100" style={{ color: '#949ba4', opacity: 0.7 }}>
                      {myUserId}
                    </Text>
                  </div>

                  {/* Bio / About Me */}
                  <div
                    style={{
                      marginTop: 14,
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Text
                      size="L100"
                      style={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: '#949ba4',
                        marginBottom: 4,
                      }}
                    >
                      About Me
                    </Text>
                    <Text size="T200" style={{ color: '#dbdee1', lineHeight: '1.4' }}>
                      {flare.bio ||
                        'I think hamburgers and cheeseburgers work well with fries...'}
                    </Text>
                  </div>

                  {/* Showcase Boards / Widgets (Marvel Rivals, Games in Rotation, etc.) */}
                  <div style={{ marginTop: 16 }}>
                    <FlareProfileBoard flare={flare} />
                  </div>
                </div>
              </div>
              </div>
            </ProfileCardFrameWrapper>
          </Box>
        </div>
      </Scroll>

      {/* Discord Change Display Name Style Modal */}
      {showDisplayNameModal && (
        <DisplayNameStyleModal
          currentStyle={flare.displayNameStyle}
          flare={flare}
          displayName={displayName}
          myUserId={myUserId}
          avatarUrl={avatarUrl}
          onSave={(newStyle) => {
            setFlare((prev) => ({
              ...prev,
              displayNameStyle: newStyle,
              font: {
                ...prev.font,
                textColor: newStyle.color,
                preset: newStyle.fontId,
              },
            }));
          }}
          onClose={() => setShowDisplayNameModal(false)}
        />
      )}
    </Box>
  );
}
