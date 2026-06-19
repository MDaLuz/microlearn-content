import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export default function GlassCard({ children, style, intensity = 20 }: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overlay: {
    ...StyleSheet.absoluteFill as object,
    backgroundColor: Colors.surface,
  },
  content: {
    position: 'relative',
  },
});
