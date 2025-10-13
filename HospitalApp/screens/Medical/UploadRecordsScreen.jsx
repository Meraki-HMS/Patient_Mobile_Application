// src/screens/Medical/LabRecordsScreen.js
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Card from '../../components/Card';
import CustomButton from '../../components/CustomButton';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../utils/colors';

export default function LabRecordsScreen({ navigation }) {
  const [testName, setTestName] = useState('');
  const [labName, setLabName] = useState('');
  const [date, setDate] = useState('');
  const [fileName, setFileName] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const [records, setRecords] = useState([
    {
      id: 1,
      testName: 'Blood Test',
      labName: 'Apollo Diagnostics',
      file: 'blood_report.pdf',
      date: '2025-08-12',
    },
  ]);

  const addRecord = () => {
    if (!testName || !labName || !date || !fileName) return;

    const newItem = {
      id: Date.now(),
      testName,
      labName,
      date,
      file: fileName,
    };

    setRecords(prev => [newItem, ...prev]);

    // reset form
    setTestName('');
    setLabName('');
    setDate('');
    setFileName('');
  };

  return (
    <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>View / Upload Lab Records</Text>

      {/* Input Card */}
      <Card>
        <TextInput
          placeholder="Test Name (e.g., Blood Test, X-Ray)"
          style={styles.input}
          value={testName}
          onChangeText={setTestName}
          placeholderTextColor="#777"
        />
        <TextInput
          placeholder="Lab Name (e.g., Apollo Diagnostics)"
          style={styles.input}
          value={labName}
          onChangeText={setLabName}
          placeholderTextColor="#777"
        />

        {/* Date Picker */}
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <View pointerEvents="none">
            <TextInput
              placeholder="Select Test Date"
              placeholderTextColor="#777"
              style={styles.input}
              value={date}
              editable={false}
            />
          </View>
        </TouchableOpacity>

        {/* File Name Input */}
        <TextInput
          placeholder="Report File Name (e.g., report.pdf)"
          placeholderTextColor="#777"
          style={styles.input}
          value={fileName}
          onChangeText={setFileName}
        />

        <CustomButton title="Add Record" onPress={addRecord} />
      </Card>

      {/* Records List */}
      {records.length ? (
        records.map(r => (
          <Card key={r.id}>
            <Text style={styles.item}>{r.testName}</Text>
            <Text style={styles.meta}>🏥 {r.labName}</Text>
            <Text style={styles.meta}>📅 {r.date}</Text>
            <Text style={styles.meta}>📎 {r.file}</Text>
          </Card>
        ))
      ) : (
        <EmptyState title="No lab records uploaded yet" />
      )}

      {/* Close Button at bottom */}
      <View style={{ marginTop: 20 }}>
        <CustomButton title="Close" onPress={() => navigation.goBack()} />
      </View>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarWrapper}>
            <Calendar
              onDayPress={day => {
                setDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [date]: { selected: true, selectedColor: COLORS.primary },
              }}
              minDate={'2000-01-01'}
              maxDate={new Date().toISOString().split('T')[0]}
            />
            <CustomButton
              title="Close Calendar"
              style={{ marginTop: 12 }}
              onPress={() => setShowCalendar(false)}
            />
          </View>
        </View>
      </Modal>
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
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  item: { fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  meta: { color: COLORS.subtext, marginBottom: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    elevation: 5,
  },
});
