import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { TextInput, View } from 'react-native';

import { Colors } from '@/constants/theme';

import { Small } from './typography';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  multiline?: boolean;
  maxLength?: number;
  secureTextEntry?: boolean;
  autoCorrect?: boolean;
  error?: boolean;
  helper?: string;
};

/** Bordered input used by checkout and the account screens. */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  multiline,
  maxLength,
  secureTextEntry,
  autoCorrect,
  error,
  helper,
}: TextFieldProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Small style={{ fontSize: 10.5, marginBottom: 5 }}>{label}</Small>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.inkMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        multiline={multiline}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        autoCorrect={autoCorrect}
        style={{
          minHeight: multiline ? 66 : 44,
          borderWidth: 1,
          borderColor: error ? Colors.danger : Colors.lineStrong,
          backgroundColor: Colors.surface,
          paddingHorizontal: 12,
          paddingTop: multiline ? 11 : 0,
          paddingBottom: multiline ? 11 : 0,
          fontFamily: 'Inter',
          fontSize: 13,
          color: Colors.ink,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {helper ? (
        <Small style={{ fontSize: 10, marginTop: 5, lineHeight: 15 }}>{helper}</Small>
      ) : null}
    </View>
  );
}
