// AppointmentsMainScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RecentMeetingsScreen from './RecentMeetingsScreen';
import { COLORS } from '../../utils/colors';
import ScheduleScreen from './ScheduleScreen';

export default function AppointmentsMainScreen({ navigation }) {
  const [tab, setTab] = useState('Meetings');
  const [code, setCode] = useState('');

  const renderTab = () => {
    switch (tab) {
      case 'Recent':
        return <RecentMeetingsScreen />;
      case 'Schedule':
        return <ScheduleScreen navigation={navigation} />;
      case 'Meetings':
      default:
        return (
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Join Meetings Section */}
            <Text style={styles.sectionTitle}>Virtual Visit</Text>
            <Text style={styles.sectionSubText}>
              Join a virtual consultant with doctor using a code or link
              provided by the host for quick access.
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="keyboard-outline"
                size={20}
                color={COLORS.subtext}
                style={{ marginHorizontal: 8 }}
              />
              <TextInput
                placeholder="Enter a code or link"
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Virtual Consultation</Text>
            </TouchableOpacity>

            {/* Upcoming Meetings Section */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Upcoming Meetings
            </Text>
            {[
              {
                id: 1,
                title: 'Team Sync',
                time: 'Today • 2:00 PM',
                host: 'John Doe',
              },
              {
                id: 2,
                title: 'Client Presentation',
                time: 'Tomorrow • 11:00 AM',
                host: 'Jane Smith',
              },
            ].map(meeting => (
              <View key={meeting.id} style={styles.meetingCard}>
                <Text style={styles.meetingTitle}>{meeting.title}</Text>
                <Text style={styles.meetingInfo}>{meeting.time}</Text>
                <Text style={styles.meetingInfo}>Host: {meeting.host}</Text>
              </View>
            ))}
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Tabs */}
      <View style={styles.tabRow}>
        {['Meetings', 'Recent', 'Schedule'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.activeTab]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.activeText]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>{renderTab()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // 🔹 Top Tabs
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#F3F6FA',
    borderRadius: 30,
    margin: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#2D9CDB', // same blue as Add Appointment
  },
  tabText: {
    color: COLORS.subtext,
    fontWeight: '600',
    fontSize: 14,
  },
  activeText: {
    color: '#fff', // white text on blue
  },

  // Join Meetings Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#000',
  },
  sectionSubText: { fontSize: 13, color: COLORS.subtext, marginBottom: 12 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  input: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#000' },

  // 🔹 Join Meeting button
  joinButton: {
    backgroundColor: '#2D9CDB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  joinButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // Meeting Cards
  meetingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  meetingTitle: { fontSize: 16, fontWeight: '700', color: '#2D9CDB' },
  meetingInfo: { fontSize: 13, color: COLORS.subtext, marginTop: 4 },
});
