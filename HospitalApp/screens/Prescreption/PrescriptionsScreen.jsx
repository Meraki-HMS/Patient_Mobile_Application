// src/screens/Prescriptions/PrescriptionsScreen.js
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Card from '../../components/Card';
import { COLORS } from '../../utils/colors';
import CustomButton from '../../components/CustomButton';

export default function PrescriptionsScreen() {
  const items = [
    {
      id: 1,
      doctor: 'Dr. Anjali Verma',
      date: 'Aug 21, 2025',
      meds: 'Amoxicillin 500mg • 5 days',
    },
    {
      id: 2,
      doctor: 'Dr. Rohit Mehta',
      date: 'Jul 12, 2025',
      meds: 'Cetirizine 10mg • 3 days',
    },
  ];

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Prescriptions & Bills</Text>
      {items.map(p => (
        <Card key={p.id}>
          <Text style={styles.item}>{p.meds}</Text>
          <Text style={styles.meta}>👨‍⚕️ {p.doctor}</Text>
          <Text style={styles.meta}>📅 {p.date}</Text>
          <CustomButton
            title="Download PDF"
            style={{ marginTop: 10 }}
            onPress={() => {}}
          />
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
