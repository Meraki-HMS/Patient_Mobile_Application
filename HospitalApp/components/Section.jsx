// src/components/Section.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';

export default function Section({ title, right, children, style }) {
  return (
    <View style={[styles.box, style]}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginBottom: 18 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
});
