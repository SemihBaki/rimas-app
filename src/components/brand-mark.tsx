import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';

/**
 * Official RİMAS lockup (emblem + wordmark).
 *
 * The artwork is a transparent PNG generated from the brand asset, so it can be
 * tinted for paper and ink surfaces without loading a second font. Keep the
 * width derived from the 97:64 ratio — stretching the logo breaks the wordmark.
 */

const LOCKUP_INK = require('../../assets/images/brand/rimas-lockup-ink.png');
const LOCKUP_PAPER = require('../../assets/images/brand/rimas-lockup-paper.png');

export const BRAND_MARK_ASPECT = 97 / 64;

type BrandMarkProps = {
  /** Rendered height in points; width follows the logo ratio. */
  height: number;
  tone?: 'ink' | 'paper';
  style?: StyleProp<ImageStyle>;
};

export function BrandMark({ height, tone = 'ink', style }: BrandMarkProps) {
  return (
    <Image
      source={tone === 'paper' ? LOCKUP_PAPER : LOCKUP_INK}
      style={[{ height, width: height * BRAND_MARK_ASPECT }, style]}
      contentFit="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="RİMAS"
    />
  );
}
