// src/screens/Diet/DietPlanScreen.js
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Card from '../../components/Card';
import { COLORS } from '../../utils/colors';

export default function DietPlanScreen() {
  const plan = [
    { id: 1, meal: 'Breakfast', items: 'Oats + Banana + Milk' },
    { id: 2, meal: 'Lunch', items: 'Dal + Brown Rice + Veggies + Curd' },
    { id: 3, meal: 'Snack', items: 'Peanuts + Fruit' },
    { id: 4, meal: 'Dinner', items: 'Roti + Paneer + Salad' },
  ];

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Diet & Daily Plan</Text>
      {plan.map(m => (
        <Card key={m.id}>
          <Text style={styles.item}>{m.meal}</Text>
          <Text style={styles.meta}>{m.items}</Text>
        </Card>
      ))}
      <Text style={styles.note}>
        Tip: Stay hydrated and walk 30 mins daily.
      </Text>
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
  note: { marginTop: 10, color: COLORS.muted, fontStyle: 'italic' },
});
