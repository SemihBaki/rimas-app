import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { OutlineButton } from './button';
import { Body, Display, Label } from './typography';

export function EmptyState({
  icon = 'bag-outline',
  kicker,
  title,
  copy,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  kicker?: string;
  title: string;
  copy: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.huge,
        alignItems: 'center',
      }}>
      <Ionicons name={icon} size={26} color={Colors.inkMuted} />
      {kicker ? (
        <Label style={{ marginTop: Spacing.lg, letterSpacing: 2.2 }}>{kicker}</Label>
      ) : null}
      <Display level="m" align="center" style={{ marginTop: Spacing.md }}>
        {title}
      </Display>
      <Body align="center" style={{ marginTop: Spacing.sm, maxWidth: 280 }}>
        {copy}
      </Body>
      {actionLabel && onAction ? (
        <OutlineButton
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: Spacing.xl, alignSelf: 'stretch' }}
        />
      ) : null}
    </View>
  );
}
