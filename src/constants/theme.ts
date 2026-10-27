import { Platform } from 'react-native';

/**
 * RİMAS design tokens.
 * A quiet, editorial palette: warm paper, ink black, sand accents.
 */
export const Colors = {
  paper: '#F7F5F1',
  paperDeep: '#EFEBE4',
  surface: '#FFFFFF',
  ink: '#111110',
  inkSoft: '#5A5854',
  inkMuted: '#918D86',
  line: '#E4E0D8',
  lineStrong: '#CFC9BF',
  sand: '#C6B39C',
  clay: '#8A6A50',
  danger: '#9E3B31',
  overlay: 'rgba(17,17,16,0.34)',
  overlaySoft: 'rgba(17,17,16,0.08)',
  scrimTop: 'rgba(17,17,16,0.22)',
  scrimBottom: 'rgba(17,17,16,0.62)',
} as const;

export const Fonts = {
  display: 'Bodoni',
  body: 'Inter',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
  huge: 64,
} as const;

export const Radius = {
  none: 0,
  sm: 2,
  md: 4,
  pill: 999,
} as const;

export const Layout = {
  gutter: 20,
  maxWidth: 620,
  tabBarHeight: 58,
} as const;

export const Shadow = Platform.select({
  web: { boxShadow: '0 24px 80px rgba(17,17,16,0.12)' },
  default: {
    shadowColor: '#111110',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
}) as object;

/** Reusable text presets so screens stay declarative. */
export const Type = {
  displayXL: {
    fontFamily: Fonts.display,
    fontSize: 46,
    lineHeight: 48,
    letterSpacing: -0.6,
    color: Colors.ink,
  },
  displayL: {
    fontFamily: Fonts.display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  displayM: {
    fontFamily: Fonts.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.2,
    color: Colors.ink,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.1,
    color: Colors.inkSoft,
  },
  bodyStrong: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: Colors.ink,
  },
  small: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.1,
    color: Colors.inkMuted,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.7,
    color: Colors.inkSoft,
  },
  nav: {
    fontFamily: Fonts.body,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.1,
  },
} as const;
