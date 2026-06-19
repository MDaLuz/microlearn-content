import React from 'react';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { FontAssets } from './src/theme/typography';
import { Colors } from './src/theme/colors';
import Navigation from './src/navigation';

export default function App() {
  const [fontsLoaded] = useFonts(FontAssets);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.teal} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Navigation />
    </SafeAreaProvider>
  );
}
