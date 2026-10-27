import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { Rule } from './screen';
import { Label } from './typography';

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={{
          paddingVertical: Spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Label style={{ letterSpacing: 1.5 }}>{title}</Label>
        <Ionicons name={open ? 'remove' : 'add'} size={16} color={Colors.ink} />
      </Pressable>
      {open ? (
        <View style={{ paddingBottom: Spacing.base }}>{children}</View>
      ) : null}
      <Rule />
    </View>
  );
}
