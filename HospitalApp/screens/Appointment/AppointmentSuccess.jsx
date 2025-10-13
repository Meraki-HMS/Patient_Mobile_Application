import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';
import CustomButton from '../../components/CustomButton';

export default function AppointmentSuccess({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.success}>New Appointment Scheduled!</Text>
      <CustomButton
        title="Back to Schedule"
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  success: {
    fontSize: 18,
    fontWeight: '700',
    color: 'green',
    marginBottom: 20,
  },
});
