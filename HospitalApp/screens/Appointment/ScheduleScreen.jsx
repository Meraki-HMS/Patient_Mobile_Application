import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/colors';

export default function ScheduleScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollView style={styles.container}>
      <Calendar
        minDate={today}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: COLORS.primary },
        }}
      />

      {/* Add some padding here */}
      <View style={styles.buttonWrapper}>
        <CustomButton
          title="Add Appointment"
          onPress={() =>
            navigation.navigate('NewAppointment', {
              date: selectedDate,
            })
          }
          disabled={!selectedDate}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  buttonWrapper: {
    marginTop: 24, // Add sufficient space between calendar and button
  },
});
