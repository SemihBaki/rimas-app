import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

import { Label } from './typography';

/** Infinite editorial ticker. */
export function Marquee({
  text,
  repeat = 4,
  duration = 26000,
}: {
  text: string;
  repeat?: number;
  duration?: number;
}) {
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (!width) return;
    x.value = 0;
    x.value = withRepeat(
      withTiming(-width, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [width, duration, x]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const items = Array.from({ length: repeat }, (_, index) => (
    <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Label style={{ letterSpacing: 2.4, fontSize: 9.5 }}>{text}</Label>
      <View
        style={{
          width: 3,
          height: 3,
          borderRadius: 2,
          backgroundColor: Colors.inkMuted,
          marginHorizontal: 18,
        }}
      />
    </View>
  ));

  return (
    <View
      style={{
        overflow: 'hidden',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.line,
        paddingVertical: 11,
      }}>
      <Animated.View style={[{ flexDirection: 'row' }, style]}>
        <View
          style={{ flexDirection: 'row' }}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
          {items}
        </View>
        <View style={{ flexDirection: 'row' }}>{items}</View>
      </Animated.View>
    </View>
  );
}
