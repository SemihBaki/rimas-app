import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Layout } from '@/constants/theme';

export function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[{ flex: 1, backgroundColor: Colors.paper }, style]}>{children}</View>;
}

export function Gutter({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ paddingHorizontal: Layout.gutter }, style]}>{children}</View>
  );
}

export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[{ height: 1, backgroundColor: Colors.line }, style]}
    />
  );
}
