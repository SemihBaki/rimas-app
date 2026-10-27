import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Type } from '@/constants/theme';

import { Label } from './typography';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function tap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  style,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        {
          height: 52,
          backgroundColor: disabled ? Colors.lineStrong : Colors.ink,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 10,
          borderRadius: Radius.none,
          opacity: pressed ? 0.82 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={Colors.paper} size="small" />
      ) : (
        <>
          {icon}
          <Label style={{ color: Colors.paper, letterSpacing: 2, fontSize: 10.5 }}>
            {label}
          </Label>
        </>
      )}
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, disabled, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        {
          height: 50,
          borderWidth: 1,
          borderColor: Colors.ink,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
        },
        style,
      ]}>
      <Label style={{ color: Colors.ink, letterSpacing: 2, fontSize: 10.5 }}>{label}</Label>
    </Pressable>
  );
}

export function TextButton({
  label,
  onPress,
  underline = true,
  style,
}: {
  label: string;
  onPress: () => void;
  underline?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, style]}>
      <View
        style={{
          borderBottomWidth: underline ? 1 : 0,
          borderBottomColor: Colors.ink,
          paddingBottom: 3,
        }}>
        <Label style={{ color: Colors.ink, letterSpacing: 1.8 }}>{label}</Label>
      </View>
    </Pressable>
  );
}

export const buttonText = Type.label;
