// src/screens/Appointments/BookAppointmentScreen.js
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput } from 'react-native';
import Card from '../../components/Card';
import CustomButton from '../../components/CustomButton';
import Section from '../../components/Section';
import { COLORS } from '../../utils/colors';

export default function BookAppointmentScreen({ navigation, route }) {
  const [doctor, setDoctor] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const hospitalName = route?.params?.hospital?.name;

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Book Appointment</Text>
      {hospitalName ? (
        <Text style={styles.sub}>Hospital: {hospitalName}</Text>
      ) : null}

      <Card>
        <TextInput
          placeholder="Doctor (e.g., Dr. Anjali Verma)"
          style={styles.input}
          value={doctor}
          onChangeText={setDoctor}
        />
        <TextInput
          placeholder="Date (YYYY-MM-DD)"
          style={styles.input}
          value={date}
          onChangeText={setDate}
        />
        <TextInput
          placeholder="Time (e.g., 10:30 AM)"
          style={styles.input}
          value={time}
          onChangeText={setTime}
        />
        <TextInput
          placeholder="Symptoms / Reason"
          style={[styles.input, styles.multi]}
          multiline
          value={reason}
          onChangeText={setReason}
        />
        <CustomButton
          title="Confirm Appointment"
          onPress={() =>
            navigation.navigate('AppointmentStatus', { doctor, date, time })
          }
        />
      </Card>

      <Section title="Suggested Doctors">
        {[
          'Dr. Anjali Verma • Cardiology',
          'Dr. Rohit Mehta • Dermatology',
          'Dr. K. Saxena • Pediatrics',
        ].map(d => (
          <Card key={d}>
            <Text style={styles.suggest}>{d}</Text>
          </Card>
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    color: COLORS.text,
  },
  sub: { color: COLORS.subtext, marginBottom: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  multi: { minHeight: 100, textAlignVertical: 'top' },
  suggest: { fontWeight: '700', color: COLORS.text },
});
