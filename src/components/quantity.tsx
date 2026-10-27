import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Colors } from '@/constants/theme';

import { BodyStrong } from './typography';

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.line,
        height: 34,
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Azalt"
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
        style={({ pressed }) => ({
          width: 34,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: value <= min ? 0.3 : pressed ? 0.5 : 1,
        })}>
        <Ionicons name="remove" size={13} color={Colors.ink} />
      </Pressable>
      <View style={{ width: 26, alignItems: 'center' }}>
        <BodyStrong style={{ fontSize: 12.5 }}>{value}</BodyStrong>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Arttır"
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        style={({ pressed }) => ({
          width: 34,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: value >= max ? 0.3 : pressed ? 0.5 : 1,
        })}>
        <Ionicons name="add" size={13} color={Colors.ink} />
      </Pressable>
    </View>
  );
}
