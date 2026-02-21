import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DeclineReason = ({ route, navigation }) => {
  const { patient } = route.params;

  const [selectedReason, setSelectedReason] = useState('');

  const reasons = [
    'Overload of visits',
    'Location not found',
    'Location is out of service area',
    'Not convenient',
    'Other',
  ];

  const handleDecline = () => {
    if (!selectedReason) {
      alert('Please select a reason');
      return;
    }

    alert(`Visit declined for: ${selectedReason}`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>{patient.date}</Text>
          <Text style={styles.timeText}>{patient.time}</Text>
        </View>

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.patientName}>
            {patient.name}, {patient.age} {patient.gender}
          </Text>
          <Text style={styles.address}>{patient.address}</Text>
          <Text style={styles.type}>{patient.type}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Select a reason for declining visit</Text>
      <Text style={styles.subText}>Notification will be sent to the admin</Text>

      {/* Radio Options */}
      {reasons.map((reason, index) => (
        <TouchableOpacity
          key={index}
          style={styles.radioRow}
          onPress={() => setSelectedReason(reason)}
        >
          <View style={styles.radioOuter}>
            {selectedReason === reason && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.radioText}>{reason}</Text>
        </TouchableOpacity>
      ))}

      {/* Decline Button */}
      <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
        <Text style={styles.declineBtnText}>Decline Visit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    padding: 20,
  },

  backArrow: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },

  dateBox: {
    width: 70,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },

  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D4AE0',
  },

  timeText: {
    color: '#555',
    marginTop: 4,
  },

  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  address: {
    color: '#777',
    fontSize: 13,
    marginVertical: 3,
  },

  type: {
    color: '#3D4AE0',
    fontWeight: '600',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    color: '#333',
  },

  subText: {
    color: '#666',
    marginBottom: 20,
    fontSize: 13,
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3D4AE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  radioInner: {
    width: 12,
    height: 12,
    backgroundColor: '#3D4AE0',
    borderRadius: 6,
  },

  radioText: {
    fontSize: 15,
    color: '#333',
  },

  declineBtn: {
    backgroundColor: '#182BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  declineBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DeclineReason;
