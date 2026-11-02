// Cache of registered fonts to prevent duplicate injections
const registeredFonts = new Set<string>();

/**
 * Dynamically load a custom uploaded font (.woff2, .woff, .ttf, .otf) into the document
 */
export async function loadCustomFont(fontFamily: string, fontUrl: string): Promise<void> {
  const cacheKey = `${fontFamily}:${fontUrl}`;
  if (registeredFonts.has(cacheKey)) return;
  registeredFonts.add(cacheKey);

  // Clean family name for CSS identifier
  const safeFamily = fontFamily.trim().replace(/['"]/g, '');

  if (typeof FontFace !== 'undefined') {
    try {
      const fontFace = new FontFace(safeFamily, `url("${fontUrl}")`);
      const loaded = await fontFace.load();
      document.fonts.add(loaded);
      return;
    } catch (err) {
      console.warn(`[Cinny Flare] FontFace API failed for "${safeFamily}", falling back to style injection:`, err);
    }
  }

  // Fallback: inject a <style> tag into <head>
  const styleId = `font-style-${safeFamily.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: "${safeFamily}";
        src: url("${fontUrl}");
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Dynamically load a Google Font by family name
 */
export function loadGoogleFont(family: string): void {
  const cleanFamily = family.trim().replace(/['"]/g, '');
  const urlParam = cleanFamily.replace(/\s+/g, '+');
  const linkId = `gfont-${urlParam}`;

  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${urlParam}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
  document.head.appendChild(link);
}
