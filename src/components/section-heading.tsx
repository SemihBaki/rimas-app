import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { TextButton } from './button';
import { Display, Label } from './typography';

export function SectionHeading({
  kicker,
  title,
  actionLabel,
  onAction,
  style,
}: {
  kicker?: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: Spacing.md,
        },
        style,
      ]}>
      <View style={{ flexShrink: 1 }}>
        {kicker ? (
          <Label style={{ color: Colors.inkMuted, marginBottom: 7 }}>{kicker}</Label>
        ) : null}
        <Display level="m">{title}</Display>
      </View>
      {actionLabel && onAction ? <TextButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
