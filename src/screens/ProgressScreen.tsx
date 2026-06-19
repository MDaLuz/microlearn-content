import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AuroraMesh from '../components/AuroraMesh';
import Icon from '../components/Icon';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { getCatalog, getModule, getModuleProgress } from '../data/store';

const STREAK = 12;
const TOTAL_XP = 1580;

export default function ProgressScreen() {
  const catalog = getCatalog();

  return (
    <View style={styles.root}>
      <AuroraMesh />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Progression</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <LinearGradient colors={['rgba(91,224,216,0.15)', 'rgba(91,224,216,0.05)']} style={StyleSheet.absoluteFill} />
              <View style={styles.statBorder} />
              <Icon name="flame" size={22} color="#FFB23E" />
              <Text style={styles.statValue}>{STREAK}</Text>
              <Text style={styles.statLabel}>Jours de suite</Text>
            </View>
            <View style={styles.statCard}>
              <LinearGradient colors={['rgba(183,160,255,0.15)', 'rgba(183,160,255,0.05)']} style={StyleSheet.absoluteFill} />
              <View style={styles.statBorder} />
              <Icon name="award" size={22} color={Colors.purple} />
              <Text style={styles.statValue}>{TOTAL_XP}</Text>
              <Text style={styles.statLabel}>XP total</Text>
            </View>
          </View>

          {/* Per-module progress */}
          <Text style={styles.seclabel}>VOS MODULES</Text>
          {catalog.modules.map((entry) => {
            const mod = getModule(entry.id);
            const disc = Colors.disciplines[entry.discipline] ?? Colors.disciplines.Gardening;
            const progress = getModuleProgress(entry.id);
            const completedLessons = mod ? Math.round(progress * mod.lessons.length) : 0;
            const totalLessons = mod?.lessons.length ?? entry.lessonCount;
            const xp = mod ? mod.lessons.slice(0, completedLessons).reduce((s, l) => s + l.xpReward, 0) : 0;

            return (
              <View key={entry.id} style={styles.modRow}>
                <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']} style={StyleSheet.absoluteFill} />
                <View style={styles.modBorder} />
                <View style={styles.modHeader}>
                  <Text style={styles.modTitle}>{entry.title}</Text>
                  <Text style={[styles.modXp, { color: disc.color }]}>{xp} XP</Text>
                </View>
                <View style={styles.track}>
                  <LinearGradient
                    colors={disc.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.fill, { width: `${progress * 100}%` }]}
                  />
                </View>
                <Text style={styles.modSub}>{completedLessons} / {totalLessons} leçons</Text>
              </View>
            );
          })}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 16 },

  title: {
    fontFamily: Fonts.display800,
    fontSize: 32,
    color: Colors.text,
    letterSpacing: -1,
    marginBottom: 20,
  },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  statBorder: {
    ...StyleSheet.absoluteFill as object,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: Fonts.display800,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: Fonts.sans400,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  seclabel: {
    fontFamily: Fonts.sans600,
    fontSize: 12,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 13,
  },

  modRow: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  modBorder: {
    ...StyleSheet.absoluteFill as object,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modTitle: {
    fontFamily: Fonts.display700,
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  modXp: {
    fontFamily: Fonts.sans600,
    fontSize: 13,
  },
  track: {
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  modSub: {
    fontFamily: Fonts.sans400,
    fontSize: 12,
    color: Colors.textMuted,
  },
});
