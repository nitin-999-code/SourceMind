/* ═══════════════ GLOBAL DESIGN TOKENS ═══════════════ */
/* Single source of truth for all theme colors across the app */

export const theme = {
  bg:      '#0A0A0A',
  bgDark:  '#050505',
  bgSec:   '#0C0C0C',
  card:    '#141414',
  surface: '#1A1A1A',
  accent:  '#FAFAFA',
  accentH: '#E5E5E5',
  text:    '#FFFFFF',
  muted:   'rgba(255,255,255,0.6)',
  border:  'rgba(255,255,255,0.06)',
  shadow:  'rgba(0,0,0,0.5)',
  glass:   'rgba(255,255,255,0.03)',
  glassB:  'rgba(255,255,255,0.06)',
} as const;

export type Theme = typeof theme;
