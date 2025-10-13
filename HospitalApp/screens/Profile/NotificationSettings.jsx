import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>
      <View style={styles.row}>
        <Text>Enable Notifications</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
});
