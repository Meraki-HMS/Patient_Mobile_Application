import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import NurseDashboard from './Dashboard/NurseDashboard';
import TreatmentPlanScreen from './TreatmentPlan/TreatmentPlanScreen';
import NurseProfileScreen from './Profile/NurseProfileScreen';

// Icons (reuse patient icon style)
import HomeIcon from '../../Icons/HomeIcon';
import MedicalRecordsIcon from '../../Icons/MedicalRecordsIcon';
import ProfileIcon from '../../Icons/ProfileIcon';

const Tab = createBottomTabNavigator();

const NurseTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#fff',
        },
      }}
    >
      <Tab.Screen
        name="NurseHome"
        component={NurseDashboard}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />

      <Tab.Screen
        name="TreatmentPlan"
        component={TreatmentPlanScreen}
        options={{
          tabBarLabel: 'Treatment',
          tabBarIcon: ({ focused }) => <MedicalRecordsIcon focused={focused} />,
        }}
      />

      <Tab.Screen
        name="NurseProfile"
        component={NurseProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default NurseTabs;
