import React, { useState, useEffect } from 'react';
import { Box, Button, config, Input, Text } from 'folds';
import { ProfileCardTheme } from '../types';

type CardGradientPickerProps = {
  theme?: ProfileCardTheme;
  onChange: (updatedTheme: ProfileCardTheme) => void;
};

// HSL <-> Hex math helpers
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return { h: 348, s: 76, l: 15 };
  const r = parseInt(c.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(c.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(c.substring(4, 6), 16) / 255 || 0;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const lNorm = l / 100;
  const a = (s * Math.min(lNorm, 1 - lNorm)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function CardGradientPicker({ theme, onChange }: CardGradientPickerProps) {
  const [primaryColor, setPrimaryColor] = useState(theme?.primaryColor || '#420914');
  const [accentColor, setAccentColor] = useState(theme?.accentColor || '#1a0206');
  const [angle, setAngle] = useState(180);
  const [activeTab, setActiveTab] = useState<'primary' | 'accent'>('primary');

  // Sync state if external theme changes
  useEffect(() => {
    if (theme?.primaryColor) setPrimaryColor(theme.primaryColor);
    if (theme?.accentColor) setAccentColor(theme.accentColor);
  }, [theme?.primaryColor, theme?.accentColor]);

  // Current active color HSL
  const currentColor = activeTab === 'primary' ? primaryColor : accentColor;
  const currentHsl = hexToHsl(currentColor);

  const updateColor = (newHex: string, tab: 'primary' | 'accent' = activeTab) => {
    const updatedPrimary = tab === 'primary' ? newHex : primaryColor;
    const updatedAccent = tab === 'accent' ? newHex : accentColor;
    if (tab === 'primary') setPrimaryColor(newHex);
    else setAccentColor(newHex);

    const newGradient = `linear-gradient(${angle}deg, ${updatedPrimary} 0%, ${updatedAccent} 100%)`;
    onChange({
      primaryColor: updatedPrimary,
      accentColor: updatedAccent,
      gradient: newGradient,
    });
  };

  const updateHsl = (h: number, s: number, l: number) => {
    const hex = hslToHex(h, s, l);
    updateColor(hex);
  };

  const updateAngle = (newAngle: number) => {
    setAngle(newAngle);
    const newGradient = `linear-gradient(${newAngle}deg, ${primaryColor} 0%, ${accentColor} 100%)`;
    onChange({
      primaryColor,
      accentColor,
      gradient: newGradient,
    });
  };

  const handleSwap = () => {
    const tempP = primaryColor;
    const tempA = accentColor;
    setPrimaryColor(tempA);
    setAccentColor(tempP);
    const newGradient = `linear-gradient(${angle}deg, ${tempA} 0%, ${tempP} 100%)`;
    onChange({
      primaryColor: tempA,
      accentColor: tempP,
      gradient: newGradient,
    });
  };

  const handleRandomize = () => {
    const randomHue = Math.floor(Math.random() * 360);
    const p = hslToHex(randomHue, 80, 20);
    const a = hslToHex((randomHue + 25) % 360, 90, 8);
    setPrimaryColor(p);
    setAccentColor(a);
    const newGradient = `linear-gradient(${angle}deg, ${p} 0%, ${a} 100%)`;
    onChange({
      primaryColor: p,
      accentColor: a,
      gradient: newGradient,
    });
  };

  const gradientPreview = `linear-gradient(${angle}deg, ${primaryColor} 0%, ${accentColor} 100%)`;

  return (
    <Box direction="Column" gap="300" style={{ width: '100%' }}>
      {/* Mini Live Gradient Preview Bar */}
      <div
        style={{
          width: '100%',
          height: 38,
          borderRadius: '8px',
          background: gradientPreview,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
        }}
      >
        <Text size="L100" style={{ color: '#ffffff', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {primaryColor} → {accentColor} ({angle}°)
        </Text>
        <Box gap="100">
          <Button size="100" variant="Surface" fill="Soft" radii="Pill" onClick={handleSwap} title="Swap Primary & Accent">
            <Text size="L100" style={{ fontSize: 11 }}>⇄ Swap</Text>
          </Button>
          <Button size="100" variant="Surface" fill="Soft" radii="Pill" onClick={handleRandomize} title="Randomize Colors">
            <Text size="L100" style={{ fontSize: 11 }}>🎲 Random</Text>
          </Button>
        </Box>
      </div>

      {/* Two Color Tabs (Primary & Accent) */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div
          onClick={() => setActiveTab('primary')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            background: activeTab === 'primary' ? '#313338' : '#1e1f22',
            border: activeTab === 'primary' ? '2px solid #5865f2' : '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.15s ease',
          }}
        >
          <label style={{ position: 'relative', width: 24, height: 24, borderRadius: '50%', background: primaryColor, border: '2px solid #fff', cursor: 'pointer', flexShrink: 0 }}>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => updateColor(e.target.value, 'primary')}
              style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }}
            />
          </label>
          <Box direction="Column" gap="0">
            <Text size="L100" style={{ color: '#949ba4', fontWeight: 700 }}>
              PRIMARY COLOR
            </Text>
            <Text size="T200" style={{ color: '#fff', fontWeight: 600 }}>
              {primaryColor.toUpperCase()}
            </Text>
          </Box>
        </div>

        <div
          onClick={() => setActiveTab('accent')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            background: activeTab === 'accent' ? '#313338' : '#1e1f22',
            border: activeTab === 'accent' ? '2px solid #5865f2' : '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.15s ease',
          }}
        >
          <label style={{ position: 'relative', width: 24, height: 24, borderRadius: '50%', background: accentColor, border: '2px solid #fff', cursor: 'pointer', flexShrink: 0 }}>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => updateColor(e.target.value, 'accent')}
              style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }}
            />
          </label>
          <Box direction="Column" gap="0">
            <Text size="L100" style={{ color: '#949ba4', fontWeight: 700 }}>
              ACCENT COLOR
            </Text>
            <Text size="T200" style={{ color: '#fff', fontWeight: 600 }}>
              {accentColor.toUpperCase()}
            </Text>
          </Box>
        </div>
      </div>

      {/* Sliders for the Active Color */}
      <div
        style={{
          background: '#2b2d31',
          borderRadius: '10px',
          padding: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <Box justifyContent="SpaceBetween" alignItems="Center">
          <Text size="L100" style={{ color: '#dbdee1', fontWeight: 700 }}>
            {activeTab === 'primary' ? 'Primary' : 'Accent'} Color Sliders
          </Text>
          {/* Hex Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ position: 'relative', width: 22, height: 22, borderRadius: '4px', background: currentColor, border: '1px solid #fff', cursor: 'pointer' }}>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => updateColor(e.target.value)}
                style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }}
              />
            </label>
            <input
              type="text"
              value={currentColor}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  if (val.length === 7) updateColor(val);
                  else if (activeTab === 'primary') setPrimaryColor(val);
                  else setAccentColor(val);
                }
              }}
              style={{
                width: 80,
                padding: '4px 8px',
                background: '#1e1f22',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                textAlign: 'center',
              }}
            />
          </div>
        </Box>

        {/* 1. Hue Slider (Rainbow Track) */}
        <Box direction="Column" gap="50">
          <Box justifyContent="SpaceBetween">
            <Text size="L100" style={{ color: '#949ba4' }}>Hue</Text>
            <Text size="L100" style={{ color: '#fff', fontWeight: 600 }}>{currentHsl.h}°</Text>
          </Box>
          <input
            type="range"
            min="0"
            max="360"
            value={currentHsl.h}
            onChange={(e) => updateHsl(Number(e.target.value), currentHsl.s, currentHsl.l)}
            style={{
              width: '100%',
              height: 12,
              borderRadius: 6,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
            }}
          />
        </Box>

        {/* 2. Lightness Slider (Dark to Bright) */}
        <Box direction="Column" gap="50">
          <Box justifyContent="SpaceBetween">
            <Text size="L100" style={{ color: '#949ba4' }}>Brightness / Lightness</Text>
            <Text size="L100" style={{ color: '#fff', fontWeight: 600 }}>{currentHsl.l}%</Text>
          </Box>
          <input
            type="range"
            min="2"
            max="98"
            value={currentHsl.l}
            onChange={(e) => updateHsl(currentHsl.h, currentHsl.s, Number(e.target.value))}
            style={{
              width: '100%',
              height: 12,
              borderRadius: 6,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              background: `linear-gradient(to right, #000000 0%, hsl(${currentHsl.h}, ${currentHsl.s}%, 50%) 50%, #ffffff 100%)`,
            }}
          />
        </Box>

        {/* 3. Saturation Slider */}
        <Box direction="Column" gap="50">
          <Box justifyContent="SpaceBetween">
            <Text size="L100" style={{ color: '#949ba4' }}>Saturation</Text>
            <Text size="L100" style={{ color: '#fff', fontWeight: 600 }}>{currentHsl.s}%</Text>
          </Box>
          <input
            type="range"
            min="0"
            max="100"
            value={currentHsl.s}
            onChange={(e) => updateHsl(currentHsl.h, Number(e.target.value), currentHsl.l)}
            style={{
              width: '100%',
              height: 12,
              borderRadius: 6,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              background: `linear-gradient(to right, hsl(${currentHsl.h}, 0%, ${currentHsl.l}%) 0%, hsl(${currentHsl.h}, 100%, ${currentHsl.l}%) 100%)`,
            }}
          />
        </Box>

        {/* 4. Gradient Angle Slider */}
        <Box direction="Column" gap="50" style={{ marginTop: 4, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Box justifyContent="SpaceBetween">
            <Text size="L100" style={{ color: '#949ba4' }}>Gradient Direction</Text>
            <Text size="L100" style={{ color: '#fff', fontWeight: 600 }}>{angle}°</Text>
          </Box>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={angle}
            onChange={(e) => updateAngle(Number(e.target.value))}
            style={{
              width: '100%',
              height: 10,
              borderRadius: 5,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              background: '#1e1f22',
            }}
          />
          {/* Quick Direction Chips */}
          <div style={{ display: 'flex', gap: '6px', marginTop: 4 }}>
            {[
              { label: '↓ Vertical', deg: 180 },
              { label: '↘ Diagonal', deg: 135 },
              { label: '→ Horizontal', deg: 90 },
              { label: '↗ Diagonal', deg: 45 },
            ].map((d) => (
              <div
                key={d.label}
                onClick={() => updateAngle(d.deg)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  borderRadius: '4px',
                  background: angle === d.deg ? '#5865f2' : '#1e1f22',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 600,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {d.label}
              </div>
            ))}
          </div>
        </Box>
      </div>
    </Box>
  );
}
