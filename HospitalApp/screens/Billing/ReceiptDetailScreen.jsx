import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { COLORS } from '../../utils/colors';
import axios from 'axios';
import { API_BASE_URL } from '@env';
export default function ReceiptDetailScreen({ route }) {
  const { billingId } = route.params;
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ API call to fetch receipt by billing ID
  const getReceiptById = async id => {
    const res = await axios.get(`${API_BASE_URL}/api/billing/receipt/${id}`);
    return res.data;
  };

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const data = await getReceiptById(billingId);
        setReceipt(data);
      } catch (error) {
        console.error(
          'Error fetching receipt:',
          error?.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={{ marginTop: 40 }}
      />
    );

  if (!receipt) return <Text style={styles.error}>Receipt not found</Text>;

  const {
    patient_id,
    doctor_id,
    hospital,
    totalAmount,
    paymentStatus,
    paymentMode,
    date,
    services,
  } = receipt;

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Receipt Details</Text>

      {/* 👤 Patient Info */}
      <View style={styles.section}>
        <Text style={styles.label}>Patient:</Text>
        <Text style={styles.value}>{patient_id?.name}</Text>
        <Text style={styles.meta}>📞 {patient_id?.contact}</Text>
      </View>

      {/* 🩺 Doctor Info */}
      <View style={styles.section}>
        <Text style={styles.label}>Doctor:</Text>
        <Text style={styles.value}>{doctor_id?.name}</Text>
        <Text style={styles.meta}>🩺 {doctor_id?.specialization}</Text>
      </View>

      {/* 🏥 Hospital Info */}
      {hospital && (
        <View style={styles.section}>
          <Text style={styles.label}>Hospital:</Text>
          <Text style={styles.value}>{hospital.name}</Text>
          <Text style={styles.meta}>{hospital.address}</Text>
          <Text style={styles.meta}>{hospital.contact}</Text>
        </View>
      )}

      {/* 💰 Billing Info */}
      <View style={styles.section}>
        <Text style={styles.label}>Amount:</Text>
        <Text style={styles.value}>₹{totalAmount}</Text>
        <Text style={styles.meta}>
          Status: {paymentStatus} ({paymentMode})
        </Text>
        <Text style={styles.meta}>Date: {new Date(date).toDateString()}</Text>
      </View>

      {/* 🧾 Services */}
      <View style={styles.section}>
        <Text style={styles.label}>Services:</Text>
        {services?.length > 0 ? (
          services.map((s, i) => (
            <Text key={i} style={styles.meta}>
              • {s.name} - ₹{s.price}
            </Text>
          ))
        ) : (
          <Text style={styles.meta}>No services listed.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    color: COLORS.text,
  },
  section: { marginBottom: 15 },
  label: { fontWeight: '700', fontSize: 16, color: COLORS.text },
  value: { fontSize: 15, color: COLORS.text },
  meta: { color: COLORS.subtext, marginTop: 2 },
  error: { textAlign: 'center', marginTop: 40, color: 'red' },
});
