// src/screens/Billing/BillingScreen.js
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Card from '../../components/Card';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/colors';

export default function BillingScreen() {
  const bills = [
    {
      id: 1,
      title: 'Consultation - Dr. Verma',
      status: 'Paid',
      amount: '₹500',
      date: 'Aug 21, 2025',
    },
    {
      id: 2,
      title: 'Lab Test - CBC',
      status: 'Unpaid',
      amount: '₹700',
      date: 'Aug 22, 2025',
    },
  ];
  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Bills & Payments</Text>
      {bills.map(b => (
        <Card key={b.id}>
          <Text style={styles.item}>{b.title}</Text>
          <Text style={styles.meta}>📅 {b.date}</Text>
          <Text style={styles.meta}>
            💰 {b.amount} • {b.status}
          </Text>
          <CustomButton
            title="View Receipt"
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
