import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AssignedDoctors() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assigned Doctors</Text>
      <Text>No doctors assigned yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
