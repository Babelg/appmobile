import { Platform } from 'react-native';

/** Paleta "asfalto à noite": fundo escuro, amarelo de sinalização como destaque. */
export const colors = {
  bg: '#0E1115',
  surface: '#171B21',
  surfaceAlt: '#1F252D',
  border: '#2B323C',
  road: '#262C34',
  text: '#F3F4F6',
  textDim: '#9AA3AF',
  textFaint: '#6B7480',
  accent: '#FFC53D',
  accentDim: '#5C4A1A',
  onAccent: '#1A1405',
  success: '#34D399',
  successBg: '#0F2E23',
  danger: '#F87171',
  dangerBg: '#3A1618',
  fire: '#FF8A3D',
} as const;

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;

export const space = (n: number) => n * 4;

export const fonts = {
  // Fonte do sistema com pesos fortes; troque por uma fonte própria quando houver identidade visual.
  display: Platform.select({ ios: 'System', default: undefined }),
};

export const MAX_CONTENT_WIDTH = 560;
