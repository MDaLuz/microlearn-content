import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AuroraMesh from '../components/AuroraMesh';
import CompoundGlyph from '../components/CompoundGlyph';
import GlassCard from '../components/GlassCard';
import Icon from '../components/Icon';
import ProgressBar from '../components/ProgressBar';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { getCatalog, getModuleProgress } from '../data/store';
import type { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DISCIPLINE_ICON: Record<string, string> = {
  Gardening: 'leaf',
  Legal: 'scale',
  Cardiometabolic: 'activity',
  Communication: 'mic',
};

export default function LearnScreen() {
  const nav = useNavigation<Nav>();
  const catalog = getCatalog();

  return (
    <View style={styles.root}>
      <AuroraMesh />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Topbar */}
        <View style={styles.topbar}>
          <CompoundGlyph size={26} colors={['#163031', '#2D6266', '#5BE0D8', '#A8F0F4']} />
          <Text style={styles.wordmark}>compound</Text>
          <View style={styles.streak}>
            <Icon name="flame" size={15} color="#FFB23E" />
            <Text style={styles.streakText}>12</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero headline */}
          <Text style={styles.headline}>{'Keep\nlearning.'}</Text>
          <Text style={styles.sub}>Continuez là où vous vous êtes arrêté.</Text>

          {/* Daily review card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => nav.navigate('Lesson', {
              moduleId: catalog.modules[0].id,
              lessonId: 'ind-l01-pourquoi-meurent',
              lessonIndex: 0,
            })}
          >
          <View style={styles.reviewCard}>
            <LinearGradient
              colors={['rgba(91,224,216,0.16)', 'rgba(183,160,255,0.12)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.reviewBorder} />
            <View style={styles.ring}>
              <View style={styles.ringInner}>
                <Icon name="refresh" size={20} color="#8FE9E2" strokeWidth={2.2} />
              </View>
            </View>
            <View style={styles.reviewMid}>
              <Text style={styles.reviewTitle}>Révision du jour</Text>
              <Text style={styles.reviewSub}>8 cartes · 3 modules</Text>
            </View>
            <View style={styles.reviewGo}>
              <Icon name="arrow-right" size={16} color="#fff" />
            </View>
          </View>
          </TouchableOpacity>

          {/* Section label */}
          <Text style={styles.seclabel}>VOS MODULES</Text>

          {/* Module cards */}
          {catalog.modules.map((entry) => {
            const disc = Colors.disciplines[entry.discipline] ?? Colors.disciplines.Gardening;
            const progress = getModuleProgress(entry.id);
            const icon = DISCIPLINE_ICON[entry.discipline] ?? 'book';

            return (
              <TouchableOpacity
                key={entry.id}
                activeOpacity={0.85}
                onPress={() => nav.navigate('Module', { moduleId: entry.id })}
              >
                <GlassCard style={styles.modCard}>
                  {/* Tile icon */}
                  <LinearGradient
                    colors={disc.gradient}
                    style={styles.modTile}
                    start={{ x: 0.1, y: 0.1 }}
                    end={{ x: 0.9, y: 0.9 }}
                  >
                    <View style={styles.tileShine} />
                    <Icon name={icon} size={28} color="#0A1A14" strokeWidth={2.1} />
                  </LinearGradient>

                  <View style={styles.modMid}>
                    <Text style={styles.modTitle} numberOfLines={2}>{entry.title}</Text>
                    <Text style={styles.modMeta}>{entry.lessonCount} leçons · {entry.estimatedMinutes} min</Text>
                    <View style={styles.prow}>
                      <ProgressBar progress={progress} gradient={disc.gradient} />
                      <View style={[styles.tag, { backgroundColor: disc.soft }]}>
                        <Text style={[styles.tagText, { color: disc.color }]}>
                          {Math.round(progress * 100)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
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

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },
  wordmark: {
    fontFamily: Fonts.display700,
    fontSize: 16,
    color: Colors.text,
    letterSpacing: -0.1,
  },
  streak: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  streakText: {
    fontFamily: Fonts.sans600,
    fontSize: 14,
    color: '#FFD79A',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22 },

  headline: {
    fontFamily: Fonts.display800,
    fontSize: 38,
    letterSpacing: -1.2,
    lineHeight: 40,
    marginTop: 20,
    marginBottom: 6,
    color: Colors.text,
    // Gradient text workaround: just use white for now; native gradient text requires MaskedView
  },
  sub: {
    fontFamily: Fonts.sans400,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },

  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 8,
  },
  reviewBorder: {
    ...StyleSheet.absoluteFill as object,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  ring: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#5BE0D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0B0C16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewMid: { flex: 1 },
  reviewTitle: {
    fontFamily: Fonts.display700,
    fontSize: 16,
    color: Colors.text,
  },
  reviewSub: {
    fontFamily: Fonts.sans400,
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewGo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  seclabel: {
    fontFamily: Fonts.sans600,
    fontSize: 12,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 13,
  },

  modCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 14,
    gap: 15,
    alignItems: 'center',
  },
  modTile: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  tileShine: {
    ...StyleSheet.absoluteFill as object,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    top: -20,
    left: -20,
    width: 80,
    height: 80,
  },
  modMid: { flex: 1, minWidth: 0 },
  modTitle: {
    fontFamily: Fonts.display700,
    fontSize: 17,
    color: Colors.text,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  modMeta: {
    fontFamily: Fonts.sans400,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  prow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 11,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    flexShrink: 0,
  },
  tagText: {
    fontFamily: Fonts.sans600,
    fontSize: 11,
  },
});
