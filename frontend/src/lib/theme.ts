/* ═══════════════ GLOBAL DESIGN TOKENS ═══════════════ */
/* Single source of truth for all theme colors across the app */

export const theme = {
  bg:      '#0A1A2F',
  bgDark:  '#071525',
  bgSec:   '#0F243D',
  card:    '#162B4A',
  surface: '#1F2937',
  accent:  '#2563EB',
  accentH: '#1D4ED8',
  text:    '#F1F5F9',
  muted:   '#94A3B8',
  border:  'rgba(255,255,255,0.08)',
  shadow:  'rgba(0,0,0,0.45)',
  glass:   'rgba(255,255,255,0.04)',
  glassB:  'rgba(255,255,255,0.08)',
} as const;

export type Theme = typeof theme;
