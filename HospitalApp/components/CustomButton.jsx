// src/components/CustomButton.js
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../utils/colors';

export default function CustomButton({
  title,
  onPress,
  style,
  loading,
  disabled,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={[styles.btn, disabled ? styles.disabled : null, style]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.txt}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#2D9CDB', // Same blue as Add Appointment
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6, // same rounded corners
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
});
