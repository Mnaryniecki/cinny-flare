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
import { mxcUrlToHttp } from '../../../utils/matrix';
import {
  DEFAULT_FLARE,
  PRESET_DECORATIONS,
  PRESET_NAMEPLATES,
  PRESET_EFFECTS,
  PRESET_FRAMES,
  ProfileFlare,
  ShowcaseBoard,
} from '../types';
import { getUserFlare, saveUserFlare, uploadFlareMedia } from '../api';
import { AvatarDecorationOverlay } from './AvatarDecorationOverlay';
import { UserNameplate } from './UserNameplate';
import { ProfileEffectOverlay } from './ProfileEffectOverlay';
import { ProfileCardFrameWrapper } from './ProfileCardFrameWrapper';
import { FlareProfileBoard } from './FlareProfileBoard';

type FlareSettingsProps = {
  requestClose: () => void;
};

type SettingTab = 'avatar' | 'nameplate' | 'effect' | 'frame' | 'banner' | 'bio' | 'boards';

export function FlareSettings({ requestClose }: FlareSettingsProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();
  const myUserId = mx.getSafeUserId();
  const profile = useUserProfile(myUserId);

  const [flare, setFlare] = useState<ProfileFlare>(DEFAULT_FLARE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SettingTab>('avatar');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const nameplateInputRef = useRef<HTMLInputElement>(null);
  const effectInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Load current flare on mount
  useEffect(() => {
    let isMounted = true;
    getUserFlare(mx, myUserId).then((data) => {
      if (isMounted) {
        if (data) setFlare(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [mx, myUserId]);

  const avatarUrl = profile.avatarUrl
    ? mxcUrlToHttp(mx, profile.avatarUrl, useAuth) ?? undefined
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

  // Upload handlers for each of the 4 customizable layers
  const handleCustomUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    layer: 'avatar' | 'nameplate' | 'effect' | 'frame' | 'banner'
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
      } else if (layer === 'effect') {
        setFlare((prev) => ({
          ...prev,
          profileEffect: {
            ...prev.profileEffect,
            url: mxc,
            preset: '',
          },
        }));
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
            themeColor: prev.banner?.themeColor || '#7b2cbf',
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
      title: 'Games in Rotation',
      type: 'cards',
      items: [
        {
          id: `item_1`,
          title: 'Dead by Daylight',
          subtitle: 'Survivor Main',
          tags: ['Obsessed', 'Looping'],
        },
        {
          id: `item_2`,
          title: 'Rainbow Six Siege',
          subtitle: 'Rank: Platinum',
          tags: ['Competitive'],
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
        <Text size="T300">Loading profile flair...</Text>
      </Box>
    );
  }

  return (
    <Box direction="Column" style={{ width: '100%', height: '100%' }}>
      {/* Hidden file inputs for all 4 customizable layers + banner */}
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

      {/* Header */}
      <Header
        size="500"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 20px' }}
      >
        <Box justifyContent="SpaceBetween" alignItems="Center" style={{ width: '100%' }}>
          <Box alignItems="Center" gap="200">
            <Icon size="200" src={Icons.Star} />
            <Text size="H400" style={{ fontWeight: config.fontWeight.W700 }}>
              Profile Flair & Bundle Studio
            </Text>
          </Box>
          <Box alignItems="Center" gap="200">
            {saveStatus && (
              <Text size="T200" style={{ color: saveStatus.includes('failed') || saveStatus.includes('Failed') ? '#ef4444' : '#10b981' }}>
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
              <Text size="B300">{saving ? 'Saving...' : 'Save Changes'}</Text>
            </Button>
          </Box>
        </Box>
      </Header>

      <Scroll style={{ flex: 1, padding: '20px' }}>
        <Box gap="600" wrap="Wrap" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Left: Customization Tabs and Controls */}
          <Box direction="Column" gap="400" style={{ flex: '1 1 500px', minWidth: 320 }}>
            {/* The 4 Core Flair Tabs + Extras */}
            <Box gap="150" wrap="Wrap">
              <Chip
                size="300"
                variant={activeTab === 'avatar' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('avatar')}
              >
                <Text size="B200">1. Avatar Decoration</Text>
              </Chip>
              <Chip
                size="300"
                variant={activeTab === 'nameplate' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('nameplate')}
              >
                <Text size="B200">2. Nameplate</Text>
              </Chip>
              <Chip
                size="300"
                variant={activeTab === 'effect' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('effect')}
              >
                <Text size="B200">3. Profile Effect</Text>
              </Chip>
              <Chip
                size="300"
                variant={activeTab === 'frame' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('frame')}
              >
                <Text size="B200">4. Profile Frame</Text>
              </Chip>
              <Chip
                size="300"
                variant={activeTab === 'banner' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('banner')}
              >
                <Text size="B200">Banner</Text>
              </Chip>
              <Chip
                size="300"
                variant={activeTab === 'boards' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('boards')}
              >
                <Text size="B200">Showcase Boards</Text>
              </Chip>
            </Box>

            {/* TAB 1: AVATAR DECORATION */}
            {activeTab === 'avatar' && (
              <Box direction="Column" gap="300">
                <Text size="T300" style={{ fontWeight: config.fontWeight.W600 }}>
                  Avatar Circular Decoration
                </Text>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: '12px',
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
                      border: !flare.avatarDecoration?.url
                        ? '2px solid #ea580c'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px dashed #666' }} />
                    <Text size="L100" style={{ marginTop: 8 }}>None</Text>
                  </div>

                  {PRESET_DECORATIONS.map((preset) => {
                    const isSelected = flare.avatarDecoration?.url === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() =>
                          setFlare((p) => ({
                            ...p,
                            avatarDecoration: {
                              url: preset.id,
                              glowColor: preset.glowColor,
                              animation: preset.animation,
                              scale: 1.18,
                            },
                          }))
                        }
                        style={{
                          border: isSelected
                            ? '2px solid #ea580c'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '12px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(234, 88, 12, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        }}
                      >
                        <div
                          style={{ width: 44, height: 44 }}
                          dangerouslySetInnerHTML={{ __html: preset.svg }}
                        />
                        <Text size="L100" style={{ marginTop: 8, textAlign: 'center' }}>
                          {preset.name}
                        </Text>
                      </div>
                    );
                  })}
                </div>

                <Box gap="200" alignItems="Center">
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Text size="B200">Upload Custom Avatar Frame (APNG/WebP/GIF)</Text>
                  </Button>
                </Box>
              </Box>
            )}

            {/* TAB 2: NAMEPLATE */}
            {activeTab === 'nameplate' && (
              <Box direction="Column" gap="300">
                <Text size="T300" style={{ fontWeight: config.fontWeight.W600 }}>
                  Custom Nameplate (Username Banner in Chat & Member List)
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  <div
                    onClick={() => setFlare((p) => ({ ...p, nameplate: { preset: '', url: '' } }))}
                    style={{
                      border: !flare.nameplate?.preset && !flare.nameplate?.url
                        ? '2px solid #ea580c'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <Text size="L200">Default (No Nameplate)</Text>
                  </div>

                  {PRESET_NAMEPLATES.map((preset) => {
                    const isSelected = flare.nameplate?.preset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() =>
                          setFlare((p) => ({
                            ...p,
                            nameplate: { preset: preset.id, gradient: preset.gradient, textColor: preset.textColor },
                          }))
                        }
                        style={{
                          border: isSelected
                            ? '2px solid #ea580c'
                            : preset.border || '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '12px',
                          background: preset.gradient,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text size="L200" style={{ fontWeight: config.fontWeight.W700, color: preset.textColor }}>
                          {preset.name}
                        </Text>
                      </div>
                    );
                  })}
                </div>

                <Box gap="200" alignItems="Center" style={{ marginTop: 8 }}>
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => nameplateInputRef.current?.click()}
                  >
                    <Text size="B200">Upload Custom Nameplate Image/Texture</Text>
                  </Button>
                </Box>
              </Box>
            )}

            {/* TAB 3: PROFILE EFFECT */}
            {activeTab === 'effect' && (
              <Box direction="Column" gap="300">
                <Text size="T300" style={{ fontWeight: config.fontWeight.W600 }}>
                  Profile Effect (Artistic / Animated Card Overlay)
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  <div
                    onClick={() => setFlare((p) => ({ ...p, profileEffect: { preset: '', url: '' } }))}
                    style={{
                      border: !flare.profileEffect?.preset && !flare.profileEffect?.url
                        ? '2px solid #ea580c'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <Text size="L200">None</Text>
                  </div>

                  {PRESET_EFFECTS.map((preset) => {
                    const isSelected = flare.profileEffect?.preset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() =>
                          setFlare((p) => ({
                            ...p,
                            profileEffect: { preset: preset.id },
                          }))
                        }
                        style={{
                          border: isSelected ? '2px solid #ea580c' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(234, 88, 12, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                          textAlign: 'center',
                        }}
                      >
                        <Text size="L200" style={{ fontWeight: config.fontWeight.W700 }}>
                          {preset.name}
                        </Text>
                      </div>
                    );
                  })}
                </div>

                <Box gap="200" alignItems="Center" style={{ marginTop: 8 }}>
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => effectInputRef.current?.click()}
                  >
                    <Text size="B200">Upload Custom Profile Effect (SVG/Video/GIF)</Text>
                  </Button>
                </Box>
              </Box>
            )}

            {/* TAB 4: PROFILE CARD FRAME */}
            {activeTab === 'frame' && (
              <Box direction="Column" gap="300">
                <Text size="T300" style={{ fontWeight: config.fontWeight.W600 }}>
                  Profile Card Frame (Themed Outer Border)
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  <div
                    onClick={() => setFlare((p) => ({ ...p, profileFrame: { preset: '', url: '' } }))}
                    style={{
                      border: !flare.profileFrame?.preset && !flare.profileFrame?.url
                        ? '2px solid #ea580c'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <Text size="L200">Default Card</Text>
                  </div>

                  {PRESET_FRAMES.map((preset) => {
                    const isSelected = flare.profileFrame?.preset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() =>
                          setFlare((p) => ({
                            ...p,
                            profileFrame: { preset: preset.id },
                          }))
                        }
                        style={{
                          border: isSelected ? '2px solid #ea580c' : preset.style.border,
                          borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(234, 88, 12, 0.2)' : 'rgba(0,0,0,0.3)',
                          boxShadow: preset.style.boxShadow,
                          textAlign: 'center',
                        }}
                      >
                        <Text size="L200" style={{ fontWeight: config.fontWeight.W700 }}>
                          {preset.name}
                        </Text>
                      </div>
                    );
                  })}
                </div>

                <Box gap="200" alignItems="Center" style={{ marginTop: 8 }}>
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => frameInputRef.current?.click()}
                  >
                    <Text size="B200">Upload Custom Frame Overlay</Text>
                  </Button>
                </Box>
              </Box>
            )}

            {/* TAB 5: BANNER */}
            {activeTab === 'banner' && (
              <Box direction="Column" gap="300">
                <Text size="T300" style={{ fontWeight: config.fontWeight.W600 }}>
                  Profile Banner
                </Text>
                <Box gap="200" alignItems="Center">
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    <Text size="B200">Upload Banner Image or Video</Text>
                  </Button>
                </Box>

                <Box direction="Column" gap="150" style={{ marginTop: 8 }}>
                  {[
                    { label: 'Dead by Daylight Entity Red', grad: 'linear-gradient(135deg, #450a0a 0%, #7c2d12 50%, #1c1917 100%)', color: '#ea580c' },
                    { label: 'Cosmic Purple', grad: 'linear-gradient(135deg, #2b1055 0%, #7597de 100%)', color: '#8a2be2' },
                    { label: 'Cyberpunk Sunset', grad: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', color: '#06b6d4' },
                    { label: 'Matrix Dark Emerald', grad: 'linear-gradient(135deg, #051911 0%, #064e3b 100%)', color: '#10b981' },
                  ].map((preset) => (
                    <div
                      key={preset.label}
                      onClick={() =>
                        setFlare((p) => ({
                          ...p,
                          banner: { type: 'gradient', gradient: preset.grad, themeColor: preset.color },
                        }))
                      }
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: preset.grad,
                        cursor: 'pointer',
                        border: flare.banner?.gradient === preset.grad ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Text size="T200" style={{ fontWeight: config.fontWeight.W600, color: 'white' }}>
                        {preset.label}
                      </Text>
                    </div>
                  ))}
                </Box>
              </Box>
            )}

            {/* TAB 6: SHOWCASE BOARDS */}
            {activeTab === 'boards' && (
              <Box direction="Column" gap="300">
                <Box justifyContent="SpaceBetween" alignItems="Center">
                  <Text size="T300" style={{ fontWeight: config.fontWeight.W600 }}>
                    Showcase Boards (Games, Gear, Links)
                  </Text>
                  <Button size="200" variant="Secondary" fill="Outline" radii="Pill" onClick={handleAddSampleBoard}>
                    <Text size="B100">+ Add Sample Board</Text>
                  </Button>
                </Box>

                {(!flare.boards || flare.boards.length === 0) ? (
                  <Text size="T200" style={{ opacity: 0.6 }}>
                    No showcase boards yet. Click "+ Add Sample Board" to get started!
                  </Text>
                ) : (
                  <Box direction="Column" gap="200">
                    {flare.boards.map((b, idx) => (
                      <Box
                        key={b.id}
                        alignItems="Center"
                        justifyContent="SpaceBetween"
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Box direction="Column">
                          <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }}>
                            {b.title}
                          </Text>
                          <Text size="L100" style={{ opacity: 0.5 }}>
                            {b.items.length} items ({b.type})
                          </Text>
                        </Box>
                        <Button
                          size="200"
                          variant="Critical"
                          fill="None"
                          onClick={() =>
                            setFlare((p) => ({
                              ...p,
                              boards: p.boards?.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          <Text size="B100">Remove</Text>
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Right: Real-time Live Preview Modal Card */}
          <Box direction="Column" gap="200" style={{ flex: '1 1 380px', maxWidth: 440 }}>
            <Text size="T200" style={{ fontWeight: config.fontWeight.W700, opacity: 0.7 }}>
              LIVE BUNDLE PREVIEW
            </Text>

            {/* Profile Frame Wrapper */}
            <ProfileCardFrameWrapper frame={flare.profileFrame}>
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#18181c',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  position: 'relative',
                }}
              >
                {/* 3. Profile Effect Overlay */}
                <ProfileEffectOverlay effect={flare.profileEffect} />

                {/* Banner */}
                <div
                  style={{
                    height: 120,
                    width: '100%',
                    background: flare.banner?.url
                      ? `url(${mxcUrlToHttp(mx, flare.banner.url, useAuth)}) center/cover no-repeat`
                      : flare.banner?.gradient || 'linear-gradient(135deg, #450a0a 0%, #7c2d12 100%)',
                    position: 'relative',
                  }}
                />

                {/* Avatar + Decoration */}
                <div style={{ padding: '0 20px 20px', marginTop: -45, position: 'relative', zIndex: 11 }}>
                  {/* Circular Avatar Container */}
                  <div style={{ position: 'relative', width: 84, height: 84 }}>
                    <img
                      src={avatarUrl || 'https://matrix.org/img/matrix-logo.svg'}
                      alt="avatar"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '4px solid #18181c',
                      }}
                    />
                    {/* 1. Avatar Decoration */}
                    <AvatarDecorationOverlay decoration={flare.avatarDecoration} />
                  </div>

                  {/* 2. Custom Nameplate */}
                  <div style={{ marginTop: 12 }}>
                    <UserNameplate nameplate={flare.nameplate}>
                      <Text size="H400" style={{ fontWeight: config.fontWeight.W700 }}>
                        {profile.displayName || myUserId}
                      </Text>
                    </UserNameplate>
                    <div style={{ marginTop: 2 }}>
                      <Text size="L200" style={{ opacity: 0.5 }}>
                        {myUserId}
                      </Text>
                    </div>
                  </div>

                  {/* Profile Boards & Bio */}
                  <div style={{ marginTop: 16 }}>
                    <FlareProfileBoard flare={flare} />
                  </div>
                </div>
              </div>
            </ProfileCardFrameWrapper>
          </Box>
        </Box>
      </Scroll>
    </Box>
  );
}
