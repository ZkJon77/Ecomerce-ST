/**
 * Utility functions for professional color harmonies and HSL/HEX manipulations.
 * This module allows the application to suggest matching colors based on color theory
 * (Complementary, Analogous, and Triadic harmonies).
 */

/**
 * Defines a complete color palette including the base color and its harmonies.
 */
export interface ColorPalette {
  base: string;          // The original base color in HEX
  complementary: string; // The color exactly opposite on the color wheel
  analogous: string[];    // Colors adjacent to the base color
  triadic: string[];      // Colors equally spaced around the color wheel
}

/**
 * Converts a HEX color string to HSL (Hue, Saturation, Lightness).
 * HSL is used because color harmonies are calculated by rotating the Hue (H).
 *
 * @param hex - Color in HEX format (e.g., "#FFFFFF" or "#FFF")
 * @returns An object containing H (0-360), S (0-100), and L (0-100)
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove '#' if present and expand shorthand HEX (e.g., #F00 -> #FF0000)
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Convert RGB components from 0-255 to 0-1
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // Achromatic color (gray)
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    // Calculate Hue based on which RGB component is the maximum
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL (Hue, Saturation, Lightness) back to a HEX color string.
 * Used to display calculated harmony colors to the user.
 *
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns A HEX color string (e.g., "#FFFFFF")
 */
export function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // Achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Generates a full color harmony palette based on a base HEX color.
 * Uses mathematical rotation of the Hue (H) on the 360° color wheel.
 *
 * @param baseHex - The source color in HEX format
 * @returns A ColorPalette object containing complementary, analogous, and triadic colors
 */
export function getHarmonies(baseHex: string): ColorPalette {
  const { h, s, l } = hexToHsl(baseHex);

  return {
    base: baseHex.toUpperCase(),
    // Complementary: Rotate 180° (exact opposite)
    complementary: hslToHex((h + 180) % 360, s, l),
    // Analogous: Rotate ±30° (colors next to each other)
    analogous: [
      hslToHex((h + 30) % 360, s, l),
      hslToHex((h - 30 + 360) % 360, s, l),
    ],
    // Triadic: Rotate 120° and 240° (equidistant triangle)
    triadic: [
      hslToHex((h + 120) % 360, s, l),
      hslToHex((h + 240) % 360, s, l),
    ],
  };
}
