// src/screens/Notifications/NotificationsScreen.js
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Card from '../../components/Card';
import { COLORS } from '../../utils/colors';

export default function NotificationsScreen() {
  const data = [
    {
      id: 1,
      title: 'Appointment Reminder',
      body: 'Your visit with Dr. Verma is tomorrow at 10:30 AM.',
    },
    {
      id: 2,
      title: 'Medicine Reminder',
      body: 'Take Cetirizine 10mg at 9 PM.',
    },
  ];
  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Notifications & Reminders</Text>
      {data.map(n => (
        <Card key={n.id}>
          <Text style={styles.item}>{n.title}</Text>
          <Text style={styles.meta}>{n.body}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    color: COLORS.text,
  },
  item: { fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  meta: { color: COLORS.subtext },
});
