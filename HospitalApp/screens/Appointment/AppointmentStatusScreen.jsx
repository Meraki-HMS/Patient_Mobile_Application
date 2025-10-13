// src/screens/Appointments/AppointmentStatusScreen.js
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Card from '../../components/Card';
import { COLORS } from '../../utils/colors';

export default function AppointmentStatusScreen({ route }) {
  const items = [
    {
      id: 1,
      title: 'Confirmed',
      time: 'Today, 10:30 AM',
      place: 'CityCare Hospital • OPD-2',
    },
    {
      id: 2,
      title: 'Pending Lab Results',
      time: 'Expected in 24 hrs',
      place: 'Central Lab',
    },
  ];

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Appointment Status</Text>
      {route?.params?.doctor ? (
        <Card>
          <Text style={styles.kv}>
            Doctor: <Text style={styles.v}>{route.params.doctor}</Text>
          </Text>
          <Text style={styles.kv}>
            Date:{' '}
            <Text style={styles.v}>
              {route.params.date} at {route.params.time}
            </Text>
          </Text>
        </Card>
      ) : null}

      {items.map(i => (
        <Card key={i.id}>
          <Text style={styles.status}>{i.title}</Text>
          <Text style={styles.meta}>🕒 {i.time}</Text>
          <Text style={styles.meta}>📍 {i.place}</Text>
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
  kv: { color: COLORS.subtext, marginBottom: 6 },
  v: { color: COLORS.text, fontWeight: '800' },
  status: { fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  meta: { color: COLORS.subtext },
});
