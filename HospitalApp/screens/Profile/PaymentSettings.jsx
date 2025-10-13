import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PaymentSettings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Settings</Text>
      <Text>No payment method linked.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
