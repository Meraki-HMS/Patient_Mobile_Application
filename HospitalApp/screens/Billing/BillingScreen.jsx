// src/screens/Billing/BillingScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Card from '../../components/Card';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';

export default function BillingScreen() {
  const navigation = useNavigation();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch bills directly from backend
  const getBillsByPatient = async id => {
    const res = await axios.get(`${API_BASE_URL}/api/billing/patient/${id}`);
    return res.data.receipts;
  };

  useEffect(() => {
    const fetchBills = async () => {
      try {
        // ✅ Get patientId from AsyncStorage
        const storedId = await AsyncStorage.getItem('patientId');
        console.log('📦 Stored patientId:', storedId);

        if (!storedId) {
          console.warn('⚠️ No patientId found in AsyncStorage');
          setLoading(false);
          return;
        }

        const data = await getBillsByPatient(storedId);
        setBills(data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          console.log('No receipts found for this patient');
          setBills([]);
        } else {
          console.error(
            'Error fetching bills:',
            err?.response?.data || err.message,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={{ marginTop: 40 }}
      />
    );

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Bills & Payments</Text>

      {bills.length === 0 ? (
        <Text style={styles.meta}>No receipts available.</Text>
      ) : (
        bills.map(b => (
          <Card key={b._id}>
            <Text style={styles.item}>
              {b.patientName || b.patient_id?.name}
            </Text>
            <Text style={styles.meta}>🧑‍⚕️ {b.doctor_id?.name}</Text>
            <Text style={styles.meta}>
              💰 ₹{b.totalAmount} • {b.paymentStatus}
            </Text>
            <Text style={styles.meta}>
              📅 {new Date(b.date).toDateString()}
            </Text>

            <CustomButton
              title="View Receipt"
              style={{ marginTop: 10 }}
              onPress={() =>
                navigation.navigate('ReceiptDetail', { billingId: b._id })
              }
            />
          </Card>
        ))
      )}
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
