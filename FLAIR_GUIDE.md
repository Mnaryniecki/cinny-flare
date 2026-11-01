# Cinny Flare: Custom Profile Flair & Multiplatform Guide

This fork extends Cinny with Discord-style profile flairs, avatar decorations, and showcase boards, storing everything natively via Matrix.

---

## 🎨 What Was Added

1. **Avatar Decorations & Glows (`src/app/features/flare/components/AvatarDecorationOverlay.tsx`)**:
   - Presets included: *Cosmic Orb*, *Cyberpunk Ring*, *Golden Radiance*, *Matrix Pulse*, and *Abyssal Void*.
   - Upload support: Users can upload any custom animated APNG, WebP, GIF, or SVG directly to their homeserver media repository (`mxc://`).
   - Animation styles: `spin-slow`, `pulse`, `float`, and `glow`.
   - Displays on user profiles, room member sidebars, and right beside chat messages.

2. **Custom Banners & Theme Gradients (`src/app/features/flare/components/FlareSettings.tsx`)**:
   - Upload custom banner images or looping video files.
   - Built-in theme gradients (*Cosmic Purple*, *Cyberpunk Sunset*, *Neon Aura*, *Matrix Dark Emerald*).

3. **Showcase Boards & Badges (`src/app/features/flare/components/FlareProfileBoard.tsx`)**:
   - Modular widgets ("Games I Like", "Games in Rotation", Wishlist, Gear).
   - Custom tags per item (e.g., "Obsessed", "Casual", "Warmup").
   - Translucent glassmorphism styling.

4. **Matrix Protocol Integration (`src/app/features/flare/api.ts`)**:
   - Stores master configuration in user Matrix Account Data (`app.cinny.flare`).
   - Publishes public profile fields via Matrix v1.16 / MSC4133 extended profile endpoints (`/_matrix/client/v3/profile/{userId}/app.cinny.flare`).
   - Uploads media directly to homeserver via `/_matrix/media/v3/upload`.

---

## 🚀 How to Run & Build

### 1. Local Development (Web)
```bash
npm start
```
Opens the live app at `http://localhost:5173`.
Navigate to **Settings ⚙️ -> Profile Flair ⭐** to open the Flair Studio!

### 2. Build Web App (Deploy to Cloudflare Pages / Vercel / Nginx)
```bash
npm run build:web
```
Outputs static production files to `dist/`.

### 3. Build Android APK
Ensure you have the Android SDK or Android Studio installed:
```bash
# First time setup:
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android

# Build debug APK:
npm run build:apk
```
Outputs `app-debug.apk` to `android/app/build/outputs/apk/debug/app-debug.apk`.

### 4. Build Desktop PC App (.exe / Linux binary)
Cinny Desktop uses Tauri:
```bash
# Uses native Rust toolchain (already installed on this machine):
npm run build:desktop
```
Outputs standalone desktop executables in `src-tauri/target/release/`.
