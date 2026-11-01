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
import { DEFAULT_FLARE, PRESET_DECORATIONS, ProfileFlare, ShowcaseBoard } from '../types';
import { getUserFlare, saveUserFlare, uploadFlareMedia } from '../api';
import { AvatarDecorationOverlay } from './AvatarDecorationOverlay';
import { FlareProfileBoard } from './FlareProfileBoard';

type FlareSettingsProps = {
  requestClose: () => void;
};

export function FlareSettings({ requestClose }: FlareSettingsProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();
  const myUserId = mx.getSafeUserId();
  const profile = useUserProfile(myUserId);

  const [flare, setFlare] = useState<ProfileFlare>(DEFAULT_FLARE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'avatar' | 'banner' | 'bio' | 'boards'>('avatar');

  const avatarInputRef = useRef<HTMLInputElement>(null);
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

  const handleCustomAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaveStatus('Uploading decoration...');
      const mxc = await uploadFlareMedia(mx, file);
      setFlare((prev) => ({
        ...prev,
        avatarDecoration: {
          url: mxc,
          animation: prev.avatarDecoration?.animation || 'none',
          glowColor: prev.avatarDecoration?.glowColor || '#a855f7',
          scale: 1.18,
        },
      }));
      setSaveStatus('Uploaded! Remember to click Save.');
    } catch (err: any) {
      setSaveStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleCustomBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaveStatus('Uploading banner...');
      const mxc = await uploadFlareMedia(mx, file);
      setFlare((prev) => ({
        ...prev,
        banner: {
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: mxc,
          themeColor: prev.banner?.themeColor || '#7b2cbf',
        },
      }));
      setSaveStatus('Banner uploaded! Remember to click Save.');
    } catch (err: any) {
      setSaveStatus(`Upload failed: ${err.message}`);
    }
  };

  // Add sample board for quick demo
  const handleAddSampleBoard = () => {
    const sampleBoard: ShowcaseBoard = {
      id: `board_${Date.now()}`,
      title: 'Games in Rotation',
      type: 'cards',
      items: [
        {
          id: `item_1`,
          title: 'Rainbow Six Siege',
          subtitle: 'Rank: Platinum',
          tags: ['Obsessed', 'Daily'],
        },
        {
          id: `item_2`,
          title: 'Counter-Strike 2',
          subtitle: 'Casual Matchmaking',
          tags: ['Warmup'],
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
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*,video/webm"
        style={{ display: 'none' }}
        onChange={handleCustomAvatarUpload}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        style={{ display: 'none' }}
        onChange={handleCustomBannerUpload}
      />

      <Header
        size="500"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 20px' }}
      >
        <Box justifyContent="SpaceBetween" alignItems="Center" style={{ width: '100%' }}>
          <Box alignItems="Center" gap="200">
            <Icon size="200" src={Icons.Star} />
            <Text size="H400" style={{ fontWeight: config.fontWeight.W700 }}>
              Profile Flair & Customization
            </Text>
          </Box>
          <Box alignItems="Center" gap="200">
            {saveStatus && (
              <Text size="T200" style={{ color: saveStatus.includes('Failed') ? '#ef4444' : '#10b981' }}>
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
          {/* Left: Customization Controls */}
          <Box direction="Column" gap="400" style={{ flex: '1 1 500px', minWidth: 320 }}>
            {/* Tabs */}
            <Box gap="150" wrap="Wrap">
              <Chip
                size="300"
                variant={activeTab === 'avatar' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('avatar')}
              >
                <Text size="B200">Avatar Decoration</Text>
              </Chip>
              <Chip
                size="300"
                variant={activeTab === 'banner' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('banner')}
              >
                <Text size="B200">Banner & Theme</Text>
              </Chip>
              <Chip
                size="300"
                variant={activeTab === 'bio' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('bio')}
              >
                <Text size="B200">Bio & Badges</Text>
              </Chip>
              <Chip
                size="300"
                variant={activeTab === 'boards' ? 'Primary' : 'Surface'}
                onClick={() => setActiveTab('boards')}
              >
                <Text size="B200">Showcase Boards</Text>
              </Chip>
            </Box>

            {/* Tab 1: Avatar Decoration */}
            {activeTab === 'avatar' && (
              <Box direction="Column" gap="300">
                <Text size="T300" style={{ fontWeight: config.fontWeight.W600 }}>
                  Choose Avatar Frame / Decoration
                </Text>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {/* None Option */}
                  <div
                    onClick={() =>
                      setFlare((p) => ({
                        ...p,
                        avatarDecoration: { ...p.avatarDecoration, url: '' },
                      }))
                    }
                    style={{
                      border: !flare.avatarDecoration?.url
                        ? '2px solid #a855f7'
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

                  {/* Presets */}
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
                            ? '2px solid #a855f7'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '12px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.03)',
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

                {/* Upload Button */}
                <Box gap="200" alignItems="Center" style={{ marginTop: 8 }}>
                  <Button
                    size="300"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    before={<Icon src={Icons.Photo} size="50" />}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Text size="B200">Upload Custom Frame (APNG/WebP/GIF)</Text>
                  </Button>
                </Box>

                {/* Animation Type */}
                <Box direction="Column" gap="150" style={{ marginTop: 8 }}>
                  <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }}>
                    Animation Style
                  </Text>
                  <Box gap="150" wrap="Wrap">
                    {(['none', 'spin-slow', 'pulse', 'float'] as const).map((anim) => (
                      <Chip
                        key={anim}
                        size="200"
                        variant={flare.avatarDecoration?.animation === anim ? 'Primary' : 'Surface'}
                        onClick={() =>
                          setFlare((p) => ({
                            ...p,
                            avatarDecoration: {
                              ...p.avatarDecoration!,
                              animation: anim,
                            },
                          }))
                        }
                      >
                        <Text size="L200">{anim}</Text>
                      </Chip>
                    ))}
                  </Box>
                </Box>

                {/* Glow Color */}
                <Box direction="Column" gap="150" style={{ marginTop: 8 }}>
                  <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }}>
                    Glow Accent Color
                  </Text>
                  <Box gap="150" alignItems="Center">
                    {['#a855f7', '#06b6d4', '#eab308', '#10b981', '#f43f5e', '#ec4899'].map((c) => (
                      <div
                        key={c}
                        onClick={() =>
                          setFlare((p) => ({
                            ...p,
                            avatarDecoration: {
                              ...p.avatarDecoration!,
                              glowColor: c,
                            },
                          }))
                        }
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: c,
                          cursor: 'pointer',
                          border:
                            flare.avatarDecoration?.glowColor === c
                              ? '2px solid white'
                              : '1px solid transparent',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {/* Tab 2: Banner & Theme */}
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

                {/* Preset Gradients */}
                <Text size="T200" style={{ fontWeight: config.fontWeight.W600, marginTop: 8 }}>
                  Preset Theme Gradients
                </Text>
                <Box direction="Column" gap="150">
                  {[
                    { label: 'Cosmic Purple', grad: 'linear-gradient(135deg, #2b1055 0%, #7597de 100%)', color: '#8a2be2' },
                    { label: 'Cyberpunk Sunset', grad: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', color: '#06b6d4' },
                    { label: 'Neon Aura', grad: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)', color: '#ec4899' },
                    { label: 'Matrix Dark Emerald', grad: 'linear-gradient(135deg, #051911 0%, #064e3b 100%)', color: '#10b981' },
                  ].map((preset) => (
                    <div
                      key={preset.label}
                      onClick={() =>
                        setFlare((p) => ({
                          ...p,
                          banner: {
                            type: 'gradient',
                            gradient: preset.grad,
                            themeColor: preset.color,
                          },
                        }))
                      }
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: preset.grad,
                        cursor: 'pointer',
                        border:
                          flare.banner?.gradient === preset.grad
                            ? '2px solid white'
                            : '1px solid rgba(255, 255, 255, 0.1)',
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

            {/* Tab 3: Bio & Badges */}
            {activeTab === 'bio' && (
              <Box direction="Column" gap="300">
                <Box direction="Column" gap="100">
                  <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }}>
                    Pronouns
                  </Text>
                  <Input
                    value={flare.pronouns || ''}
                    placeholder="e.g. they/them, he/him"
                    onChange={(e: any) => setFlare((p) => ({ ...p, pronouns: e.target.value }))}
                  />
                </Box>
                <Box direction="Column" gap="100">
                  <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }}>
                    Headline / Title
                  </Text>
                  <Input
                    value={flare.headline || ''}
                    placeholder="e.g. Game Developer / 3D Artist"
                    onChange={(e: any) => setFlare((p) => ({ ...p, headline: e.target.value }))}
                  />
                </Box>
                <Box direction="Column" gap="100">
                  <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }}>
                    About Me (Bio)
                  </Text>
                  <textarea
                    rows={4}
                    value={flare.bio || ''}
                    placeholder="Tell everyone about yourself, experience, hobbies..."
                    onChange={(e) => setFlare((p) => ({ ...p, bio: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Tab 4: Showcase Boards */}
            {activeTab === 'boards' && (
              <Box direction="Column" gap="300">
                <Box justifyContent="SpaceBetween" alignItems="Center">
                  <Text size="T300" style={{ fontWeight: config.fontWeight.W600 }}>
                    Showcase Boards (Games, Gear, Links)
                  </Text>
                  <Button
                    size="200"
                    variant="Secondary"
                    fill="Outline"
                    radii="Pill"
                    onClick={handleAddSampleBoard}
                  >
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
              LIVE PROFILE PREVIEW
            </Text>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#18181c',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: flare.avatarDecoration?.glowColor
                  ? `0 10px 30px ${flare.avatarDecoration.glowColor}22`
                  : '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              {/* Banner */}
              <div
                style={{
                  height: 120,
                  width: '100%',
                  background: flare.banner?.url
                    ? `url(${mxcUrlToHttp(mx, flare.banner.url, useAuth)}) center/cover no-repeat`
                    : flare.banner?.gradient || 'linear-gradient(135deg, #2b1055 0%, #7597de 100%)',
                  position: 'relative',
                }}
              />

              {/* Avatar + Decoration */}
              <div style={{ padding: '0 20px 20px', marginTop: -45, position: 'relative' }}>
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
                  <AvatarDecorationOverlay decoration={flare.avatarDecoration} />
                </div>

                <div style={{ marginTop: 12 }}>
                  <Text size="H400" style={{ fontWeight: config.fontWeight.W700 }}>
                    {profile.displayName || myUserId}
                  </Text>
                  <Text size="L200" style={{ opacity: 0.5 }}>
                    {myUserId}
                  </Text>
                </div>

                {/* Profile Board Preview */}
                <div style={{ marginTop: 16 }}>
                  <FlareProfileBoard flare={flare} />
                </div>
              </div>
            </div>
          </Box>
        </Box>
      </Scroll>
    </Box>
  );
}
