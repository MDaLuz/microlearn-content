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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import AuroraMesh from '../components/AuroraMesh';
import CompoundGlyph from '../components/CompoundGlyph';
import Icon from '../components/Icon';
import ProgressBar from '../components/ProgressBar';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { getModule, getModuleProgress, getLessonState } from '../data/store';
import type { RootStackParamList } from '../navigation';
import type { LessonState } from '../data/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Module'>;

const DISCIPLINE_ICON: Record<string, string> = {
  Gardening: 'leaf',
  Legal: 'scale',
  Cardiometabolic: 'activity',
  Communication: 'mic',
};

export default function ModuleScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { moduleId } = route.params;
  const mod = getModule(moduleId);

  if (!mod) return null;

  const disc = Colors.disciplines[mod.discipline] ?? Colors.disciplines.Gardening;
  const progress = getModuleProgress(moduleId);
  const icon = DISCIPLINE_ICON[mod.discipline] ?? 'book';
  const totalXP = mod.lessons.reduce((s, l) => s + l.xpReward, 0);

  return (
    <View style={styles.root}>
      <AuroraMesh />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Topbar */}
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
            <Icon name="arrow-left" size={18} color={Colors.text} />
          </TouchableOpacity>
          <View style={{ marginLeft: 'auto' }}>
            <CompoundGlyph size={22} colors={['#163031', '#2D6266', '#5BE0D8', '#A8F0F4']} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Module hero card */}
          <View style={styles.heroCard}>
            {/* Header gradient */}
            <LinearGradient
              colors={disc.gradient}
              style={styles.heroHeader}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
            >
              <View style={styles.heroShine} />
              <Icon
                name={icon}
                size={88}
                color="rgba(255,255,255,0.35)"
                strokeWidth={1.3}
              />
              <View style={styles.heroTextWrap}>
                <Text style={[styles.heroEyebrow, { color: `${disc.darkText}cc` }]}>
                  {mod.discipline}
                </Text>
                <Text style={[styles.heroTitle, { color: disc.darkText }]}>{mod.title}</Text>
              </View>
            </LinearGradient>

            {/* Progress row */}
            <View style={styles.heroProgress}>
              <ProgressBar progress={progress} gradient={disc.gradient} />
              <View style={[styles.tag, { backgroundColor: disc.soft }]}>
                <Text style={[styles.tagText, { color: disc.color }]}>Niv. 3</Text>
              </View>
              <Text style={styles.xpText}>{totalXP} XP</Text>
            </View>
          </View>

          {/* Section label */}
          <Text style={styles.seclabel}>LEÇONS</Text>

          {/* Lesson rows */}
          {mod.lessons.map((lesson, index) => {
            const state: LessonState = getLessonState(moduleId, index);
            const done = state === 'completed';
            const current = state === 'current';
            const locked = state === 'locked';

            return (
              <TouchableOpacity
                key={lesson.id}
                activeOpacity={locked ? 1 : 0.85}
                onPress={() => {
                  if (!locked) {
                    nav.push('Lesson', {
                      moduleId,
                      lessonId: lesson.id,
                      lessonIndex: index,
                    });
                  }
                }}
              >
                <View style={[styles.lrow, current && styles.lrowCurrent]}>
                  {/* State chip */}
                  <View style={[
                    styles.chip,
                    done && { backgroundColor: disc.soft },
                    current && { overflow: 'hidden' },
                    locked && styles.chipLocked,
                  ]}>
                    {current && (
                      <LinearGradient
                        colors={disc.gradient}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    )}
                    {done && <Icon name="check" size={15} color={disc.color} strokeWidth={2.6} />}
                    {current && <Icon name="play" size={13} color={disc.darkText} />}
                    {locked && <Icon name="lock" size={13} color={Colors.textDim} />}
                  </View>

                  <Text style={[
                    styles.ltitle,
                    (done || locked) && { color: Colors.textMuted },
                  ]}>
                    {lesson.title}
                  </Text>

                  <Text style={styles.lxp}>+{lesson.xpReward}</Text>
                </View>
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
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22 },

  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  heroHeader: {
    height: 138,
    padding: 18,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  heroShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 9999,
    width: '130%',
    height: '200%',
  },
  heroTextWrap: { position: 'relative' },
  heroEyebrow: {
    fontFamily: Fonts.sans700,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: Fonts.display800,
    fontSize: 26,
    letterSpacing: -0.8,
    marginTop: 4,
    lineHeight: 30,
  },
  heroProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
  },

  seclabel: {
    fontFamily: Fonts.sans600,
    fontSize: 12,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 13,
  },

  lrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 15,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lrowCurrent: {
    borderColor: 'rgba(91,224,216,0.4)',
    backgroundColor: 'rgba(91,224,216,0.08)',
  },
  chip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  chipLocked: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ltitle: {
    fontFamily: Fonts.sans500,
    fontSize: 14.5,
    color: Colors.text,
    flex: 1,
  },
  lxp: {
    fontFamily: Fonts.sans600,
    fontSize: 12,
    color: Colors.textMuted,
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
  xpText: {
    fontFamily: Fonts.sans600,
    fontSize: 12.5,
    color: Colors.textSecondary,
    flexShrink: 0,
  },
});
