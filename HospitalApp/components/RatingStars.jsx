// src/components/RatingStars.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/colors';

export default function RatingStars({ value, onChange }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity
          key={i}
          onPress={() => onChange?.(i)}
          style={styles.starWrap}
        >
          <Text style={[styles.star, i <= value ? styles.filled : null]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  starWrap: { marginRight: 6 },
  star: { fontSize: 24, color: COLORS.border },
  filled: { color: COLORS.warning },
});
