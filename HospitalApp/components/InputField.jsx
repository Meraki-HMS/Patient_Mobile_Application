// src/components/InputField.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  style,
  multiline,
}) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.subtext}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multi]}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { color: COLORS.subtext, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  multi: { minHeight: 100, textAlignVertical: 'top' },
});
