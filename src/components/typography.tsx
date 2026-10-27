import { Text, type TextProps } from 'react-native';

import { Colors, Type } from '@/constants/theme';

type Tone = 'ink' | 'soft' | 'muted' | 'paper' | 'danger';

const TONES: Record<Tone, string> = {
  ink: Colors.ink,
  soft: Colors.inkSoft,
  muted: Colors.inkMuted,
  paper: Colors.paper,
  danger: Colors.danger,
};

type BaseProps = TextProps & {
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
};

function toneStyle(tone: Tone, align?: 'left' | 'center' | 'right') {
  return [align ? { textAlign: align } : null, { color: TONES[tone] }];
}

/**
 * Turkish-aware uppercase. CSS `text-transform` uppercases `i` as `I`,
 * which is wrong in Turkish; labels need `İ`.
 */
function turkishUpper(value: string) {
  return value.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

export function Display({
  level = 'l',
  tone = 'ink',
  align,
  style,
  ...rest
}: BaseProps & { level?: 'xl' | 'l' | 'm' }) {
  const preset =
    level === 'xl' ? Type.displayXL : level === 'l' ? Type.displayL : Type.displayM;
  return <Text {...rest} style={[preset, toneStyle(tone, align), style]} />;
}

export function Body({ tone = 'soft', align, style, ...rest }: BaseProps) {
  return <Text {...rest} style={[Type.body, toneStyle(tone, align), style]} />;
}

export function BodyStrong({ tone = 'ink', align, style, ...rest }: BaseProps) {
  return <Text {...rest} style={[Type.bodyStrong, toneStyle(tone, align), style]} />;
}

export function Small({ tone = 'muted', align, style, ...rest }: BaseProps) {
  return <Text {...rest} style={[Type.small, toneStyle(tone, align), style]} />;
}

export function Label({ tone = 'soft', align, style, children, ...rest }: BaseProps) {
  const content = typeof children === 'string' ? turkishUpper(children) : children;
  return (
    <Text {...rest} style={[Type.label, toneStyle(tone, align), style]}>
      {content}
    </Text>
  );
}

export function Money({
  value,
  tone = 'ink',
  size = 14,
  style,
  ...rest
}: BaseProps & { value: string; size?: number }) {
  return (
    <Text
      {...rest}
      style={[
        {
          color: TONES[tone],
          fontFamily: Type.bodyStrong.fontFamily,
          fontSize: size,
          letterSpacing: 0.2,
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}>
      {value}
    </Text>
  );
}
