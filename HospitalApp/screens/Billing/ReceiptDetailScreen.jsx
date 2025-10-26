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
import CustomButton from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import BillIcon from '../../Icons/BillIcon'; // ✅ Added import

export default function ReceiptDetailScreen({ route }) {
  const { billingId } = route.params;
  const navigation = useNavigation();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* 💳 Title with Icon */}
      <View style={styles.header}>
        <BillIcon focused={true} size={40} />
        <Text style={styles.title}>Receipt Details</Text>
      </View>

      {/* 🧾 Table Container */}
      <View style={styles.tableContainer}>
        {/* 👤 Patient Info */}
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Patient Name</Text>
          <Text style={styles.cellValue}>{patient_id?.name || '-'}</Text>
        </View>
        <View style={styles.rowAlt}>
          <Text style={styles.cellLabel}>Patient Contact</Text>
          <Text style={styles.cellValue}>{patient_id?.contact || '-'}</Text>
        </View>

        {/* 🩺 Doctor Info */}
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Doctor Name</Text>
          <Text style={styles.cellValue}>{doctor_id?.name || '-'}</Text>
        </View>
        <View style={styles.rowAlt}>
          <Text style={styles.cellLabel}>Specialization</Text>
          <Text style={styles.cellValue}>
            {doctor_id?.specialization || '-'}
          </Text>
        </View>

        {/* 🏥 Hospital Info */}
        {hospital && (
          <>
            <View style={styles.row}>
              <Text style={styles.cellLabel}>Hospital</Text>
              <Text style={styles.cellValue}>{hospital.name}</Text>
            </View>
            <View style={styles.rowAlt}>
              <Text style={styles.cellLabel}>Address</Text>
              <Text style={styles.cellValue}>{hospital.address}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellLabel}>Contact</Text>
              <Text style={styles.cellValue}>{hospital.contact}</Text>
            </View>
          </>
        )}

        {/* 💰 Billing Info */}
        <View style={styles.rowAlt}>
          <Text style={styles.cellLabel}>Total Amount</Text>
          <Text style={[styles.cellValue, styles.amountValue]}>
            ₹{totalAmount}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Payment Status</Text>
          <Text style={styles.cellValue}>
            {paymentStatus} ({paymentMode})
          </Text>
        </View>
        <View style={styles.rowAlt}>
          <Text style={styles.cellLabel}>Date</Text>
          <Text style={styles.cellValue}>{new Date(date).toDateString()}</Text>
        </View>

        {/* 🧩 Services */}
        <View
          style={[
            styles.row,
            { flexDirection: 'column', alignItems: 'flex-start' },
          ]}
        >
          <Text style={[styles.cellLabel, { marginBottom: 6 }]}>Services</Text>
          {services?.length > 0 ? (
            services.map((s, i) => (
              <Text key={i} style={styles.serviceItem}>
                • {s.name} - ₹{s.price}
              </Text>
            ))
          ) : (
            <Text style={styles.serviceItem}>No services listed.</Text>
          )}
        </View>
      </View>

      <CustomButton
        title="Close"
        style={{ marginTop: 30 }}
        onPress={() => navigation.goBack()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg || '#F3F8FF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text || '#002B5B',
    marginLeft: 10,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.6,
    borderColor: '#EAEAEA',
  },
  rowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FBFF',
    borderBottomWidth: 0.6,
    borderColor: '#EAEAEA',
  },
  cellLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: '#374151',
    flex: 1.3,
  },
  cellValue: {
    fontSize: 14,
    color: '#111827',
    flex: 2,
    textAlign: 'right',
  },
  amountValue: {
    color: '#047857',
    fontWeight: '800',
  },
  serviceItem: {
    color: '#333',
    fontSize: 13,
    marginVertical: 2,
    paddingLeft: 4,
  },
  error: {
    textAlign: 'center',
    marginTop: 40,
    color: 'red',
  },
});
