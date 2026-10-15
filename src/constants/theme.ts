import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

/**
 * Colores del tema Liquid Glass - Paleta única no genérica
 */
export const LiquidGlassColors = {
  // Gradientes principales - Coral vibrante a lavanda
  primary: '#FF6B9D',      // Coral rosado intenso
  secondary: '#C44569',    // Vino/burgundy profundo
  accent: '#A8E6CF',       // Verde menta suave (contraste)

  // Fondos con transparencia para efecto glass
  glassBackground: 'rgba(255, 107, 157, 0.08)',     // Muy sutil
  glassBackgroundDark: 'rgba(196, 69, 105, 0.12)',  // Un poco más intenso

  // Bordes glass
  glassBorder: 'rgba(255, 107, 157, 0.25)',

  // Textos
  glassText: '#2C1B47',           // Púrpura oscuro profundo
  glassTextLight: '#FFFBF5',      // Blanco cálido (no puro)
  glassTextSecondary: '#8B6B8F',  // Malva grisáceo

  // Sombras
  shadowLight: 'rgba(255, 107, 157, 0.15)',
  shadowDark: 'rgba(196, 69, 105, 0.25)',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
