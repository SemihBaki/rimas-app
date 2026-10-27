import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Layout } from '@/constants/theme';

import { Label } from './typography';

type ToastContextValue = {
  show: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          entering={FadeInDown.duration(260)}
          exiting={FadeOut.duration(180)}
          style={{
            position: 'absolute',
            left: Layout.gutter,
            right: Layout.gutter,
            bottom: insets.bottom + Layout.tabBarHeight + 14,
            backgroundColor: Colors.ink,
            paddingVertical: 13,
            paddingHorizontal: 18,
            alignItems: 'center',
          }}>
          <Label style={{ color: Colors.paper, letterSpacing: 1.4, fontSize: 9.5 }}>
            {message}
          </Label>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function ToastSpacer() {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.bottom + Layout.tabBarHeight + 24 }} />;
}
