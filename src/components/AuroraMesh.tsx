import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MeshColors, Colors } from '../theme/colors';

export default function AuroraMesh() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base dark background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.bg }]} />
      {/* Teal blob — top right */}
      <View style={[styles.blob, { width: 280, height: 280, top: -80, right: -60 }]}>
        <LinearGradient
          colors={[MeshColors.blob1, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      {/* Indigo blob — mid left */}
      <View style={[styles.blob, { width: 240, height: 240, top: 200, left: -80 }]}>
        <LinearGradient
          colors={[MeshColors.blob2, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      {/* Pink blob — bottom right */}
      <View style={[styles.blob, { width: 260, height: 260, bottom: -50, right: -30, opacity: 0.45 }]}>
        <LinearGradient
          colors={[MeshColors.blob3, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      {/* Blue blob — lower left */}
      <View style={[styles.blob, { width: 180, height: 180, bottom: 140, left: 60, opacity: 0.4 }]}>
        <LinearGradient
          colors={[MeshColors.blob4, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      {/* Global soft blur layer over all blobs */}
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.65,
    overflow: 'hidden',
  },
});
