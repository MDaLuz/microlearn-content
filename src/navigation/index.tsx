import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';

import LearnScreen from '../screens/LearnScreen';
import ModuleScreen from '../screens/ModuleScreen';
import LessonScreen from '../screens/LessonScreen';
import Icon from '../components/Icon';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

export type RootStackParamList = {
  Tabs: undefined;
  Module: { moduleId: string };
  Lesson: { moduleId: string; lessonId: string; lessonIndex: number };
};

export type TabParamList = {
  Learn: undefined;
  Progress: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={placeholder.root}>
      <Text style={placeholder.text}>{title}</Text>
    </View>
  );
}

const placeholder = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  text: { fontFamily: Fonts.display700, fontSize: 22, color: Colors.textSecondary },
});

function TabNav() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(7,8,15,0.85)',
          borderTopColor: 'rgba(255,255,255,0.07)',
          borderTopWidth: 1,
          elevation: 0,
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: Colors.tealLight,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: {
          fontFamily: Fonts.sans600,
          fontSize: 10,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Learn: 'book',
            Progress: 'activity-nav',
            Settings: 'layers',
          };
          return <Icon name={icons[route.name] ?? 'book'} size={19} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Learn" component={LearnScreen} options={{ title: 'Learn' }} />
      <Tab.Screen
        name="Progress"
        component={() => <PlaceholderScreen title="Progress" />}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen
        name="Settings"
        component={() => <PlaceholderScreen title="Settings" />}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Tabs" component={TabNav} />
        <Stack.Screen name="Module" component={ModuleScreen} />
        <Stack.Screen name="Lesson" component={LessonScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
