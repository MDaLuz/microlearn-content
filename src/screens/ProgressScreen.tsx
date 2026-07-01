import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AuroraMesh from '../components/AuroraMesh';
import GlassCard from '../components/GlassCard';
import Icon from '../components/Icon';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { getCatalog, getModule, getModuleProgress } from '../data/store';

const SCREEN_W = Dimensions.get('window').width;
const CONTENT_W = SCREEN_W - 44;

const STREAK = 12;
const BEST_STREAK = 21;
const TOTAL_XP = 3240;
const CARDS_REVIEWED = 418;
const RECALL_RATE = 87;

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const WEEK_DONE = [true, true, true, true, true, false, false];
const TODAY_IDX = 4;

const HEAT_ROWS = [
  [0, 1, 2, 1, 3, 2, 0],
  [2, 3, 1, 2, 3, 1, 1],
  [1, 2, 3, 3, 2, 0, 2],
  [3, 1, 2, 3, 3, 2, 1],
  [2, 3, 3, 2, 4, 3, 0],
];
const HEAT_COLORS = [
  'rgba(255,255,255,0.06)',
  'rgba(91,224,216,0.28)',
  'rgba(91,224,216,0.50)',
  'rgba(111,168,255,0.70)',
  'rgba(183,160,255,0.92)',
];

const DISCIPLINE_ICON: Record<string, string> = {
  Gardening: 'leaf',
  Legal: 'scale',
  Cardiometabolic: 'activity',
  Communication: 'mic',
};

export default function ProgressScreen() {
  const catalog = getCatalog();

  return (
    <View style={styles.root}>
      <AuroraMesh />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Progression</Text>

          {/* ── Streak hero ── */}
          <View style={styles.hero}>
            <LinearGradient
              colors={['rgba(255,179,62,0.20)', 'rgba(245,140,200,0.12)', 'rgba(183,160,255,0.12)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroBorder} />
            <View style={styles.heroTop}>
              <View style={styles.flameBadge}>
                <LinearGradient colors={['#FFC56B', '#F58C5A']} style={StyleSheet.absoluteFill} start={{ x: 0.1, y: 0.1 }} end={{ x: 0.9, y: 0.9 }} />
                <Icon name="flame" size={24} color="#3A1C06" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.streakRow}>
                  <Text style={styles.streakNum}>{STREAK}</Text>
                  <Text style={styles.streakUnit}>jours de suite</Text>
                </View>
                <Text style={styles.streakSub}>Record : {BEST_STREAK} jours · continue !</Text>
              </View>
            </View>
            <View style={styles.weekRow}>
              {WEEK_DAYS.map((d, i) => (
                <View key={i} style={styles.weekDay}>
                  <View style={[
                    styles.weekDot,
                    WEEK_DONE[i] && styles.weekDotDone,
                    i === TODAY_IDX && styles.weekDotToday,
                  ]}>
                    {WEEK_DONE[i] && <Icon name="check" size={13} color="#3A1C06" strokeWidth={3} />}
                  </View>
                  <Text style={styles.weekLabel}>{d}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── 3-stat row ── */}
          <View style={styles.statRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statV}>{TOTAL_XP.toLocaleString('fr')}</Text>
              <Text style={styles.statL}>XP total</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statV}>{CARDS_REVIEWED}</Text>
              <Text style={styles.statL}>Cartes revues</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={[styles.statV, { color: Colors.teal }]}>{RECALL_RATE}%</Text>
              <Text style={styles.statL}>Mémorisation</Text>
            </GlassCard>
          </View>

          {/* ── Heatmap ── */}
          <Text style={styles.seclabel}>5 DERNIÈRES SEMAINES</Text>
          <GlassCard style={styles.heatCard}>
            {HEAT_ROWS.map((row, ri) => (
              <View key={ri} style={styles.heatRow}>
                {row.map((v, ci) => (
                  <View key={ci} style={[styles.heatCell, { backgroundColor: HEAT_COLORS[v] }]} />
                ))}
              </View>
            ))}
          </GlassCard>

          {/* ── Mastery by topic ── */}
          <Text style={styles.seclabel}>MAÎTRISE PAR MODULE</Text>
          <GlassCard style={styles.masteryCard}>
            {catalog.modules.map((entry, idx) => {
              const mod = getModule(entry.id);
              const disc = Colors.disciplines[entry.discipline] ?? Colors.disciplines.Gardening;
              const progress = getModuleProgress(entry.id);
              const pct = Math.round(progress * 100);
              const icon = DISCIPLINE_ICON[entry.discipline] ?? 'book';

              return (
                <View key={entry.id} style={[styles.masteryRow, idx < catalog.modules.length - 1 && styles.masteryDivider]}>
                  <LinearGradient colors={disc.gradient} style={styles.mdot} start={{ x: 0.1, y: 0.1 }} end={{ x: 0.9, y: 0.9 }}>
                    <Icon name={icon} size={17} color="#0A1A14" strokeWidth={2.1} />
                  </LinearGradient>
                  <Text style={styles.mname} numberOfLines={1}>{entry.title}</Text>
                  <View style={styles.miniTrack}>
                    <LinearGradient
                      colors={disc.gradient}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.miniFill, { width: `${pct}%` }]}
                    />
                  </View>
                  <Text style={[styles.mpct, { color: disc.color }]}>{pct}%</Text>
                </View>
              );
            })}
          </GlassCard>

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
    fontSize: 30,
    color: Colors.text,
    letterSpacing: -0.9,
    marginBottom: 12,
  },

  // Streak hero
  hero: {
    borderRadius: 26,
    padding: 15,
    overflow: 'hidden',
    marginBottom: 0,
  },
  heroBorder: {
    ...StyleSheet.absoluteFill as object,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flameBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  streakNum: {
    fontFamily: Fonts.display800,
    fontSize: 42,
    color: Colors.text,
    letterSpacing: -1.2,
    lineHeight: 46,
  },
  streakUnit: {
    fontFamily: Fonts.sans700,
    fontSize: 15,
    color: '#FFD79A',
    paddingBottom: 6,
  },
  streakSub: {
    fontFamily: Fonts.sans400,
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  weekDay: {
    alignItems: 'center',
    gap: 6,
  },
  weekDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  weekDotDone: {
    backgroundColor: '#F58C5A',
    borderColor: '#FFC56B',
  },
  weekDotToday: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  weekLabel: {
    fontFamily: Fonts.sans700,
    fontSize: 10,
    color: '#9AA0B4',
  },

  // Stats
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 11,
  },
  statCard: {
    flex: 1,
    padding: 13,
    alignItems: 'flex-start',
    gap: 0,
  },
  statV: {
    fontFamily: Fonts.display800,
    fontSize: 25,
    color: Colors.text,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statL: {
    fontFamily: Fonts.sans600,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 5,
  },

  // Heatmap
  seclabel: {
    fontFamily: Fonts.sans600,
    fontSize: 12,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginTop: 20,
    marginBottom: 10,
  },
  heatCard: {
    padding: 16,
    gap: 6,
  },
  heatRow: {
    flexDirection: 'row',
    gap: 6,
  },
  heatCell: {
    flex: 1,
    height: 28,
    borderRadius: 6,
  },

  // Mastery
  masteryCard: {
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  masteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  masteryDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  mdot: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mname: {
    fontFamily: Fonts.sans600,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  miniTrack: {
    width: 80,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  miniFill: {
    height: '100%',
    borderRadius: 999,
  },
  mpct: {
    fontFamily: Fonts.sans700,
    fontSize: 13,
    flexShrink: 0,
    width: 38,
    textAlign: 'right',
  },
});
