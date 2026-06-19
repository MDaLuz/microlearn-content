import React, { useState } from 'react';
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
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList as StackParams } from '../navigation';

import AuroraMesh from '../components/AuroraMesh';
import Icon from '../components/Icon';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { getModule } from '../data/store';
import type { RootStackParamList } from '../navigation';
import type { Block, TextBlock, FlashcardBlock, QuizBlock, CompareBlock, ScenarioBlock, IllustrationBlock } from '../data/types';
import BlockText from './blocks/BlockText';
import BlockFlashcard from './blocks/BlockFlashcard';
import BlockQuiz from './blocks/BlockQuiz';
import BlockCompare from './blocks/BlockCompare';
import BlockScenario from './blocks/BlockScenario';
import BlockIllustration from './blocks/BlockIllustration';

type Route = RouteProp<RootStackParamList, 'Lesson'>;

const DISCIPLINE_LABEL: Record<string, string> = {
  'indoor-gardening': 'Jardinage',
  'public-speaking': 'Prise de parole',
};

const DISC_COLOR: Record<string, string> = {
  Gardening: '#7DEBA0',
  Legal: '#9CC4FF',
  Cardiometabolic: '#D6AEFF',
  Communication: '#FFB347',
};

function renderBlock(block: Block, disciplineColor: string) {
  switch (block.type) {
    case 'text':
      return <BlockText block={block as TextBlock} />;
    case 'flashcard':
      return <BlockFlashcard block={block as FlashcardBlock} accentColor={disciplineColor} />;
    case 'quiz':
      return <BlockQuiz block={block as QuizBlock} accentColor={disciplineColor} />;
    case 'compare':
      return <BlockCompare block={block as CompareBlock} accentColor={disciplineColor} />;
    case 'scenario':
      return <BlockScenario block={block as ScenarioBlock} accentColor={disciplineColor} />;
    case 'illustration':
      return <BlockIllustration block={block as IllustrationBlock} />;
    default:
      return null;
  }
}

export default function LessonScreen() {
  const nav = useNavigation<NativeStackNavigationProp<StackParams>>();
  const route = useRoute<Route>();
  const { moduleId, lessonId, lessonIndex } = route.params;

  const mod = getModule(moduleId);
  if (!mod) return null;

  const lesson = mod.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  const [blockIndex, setBlockIndex] = useState(0);

  const totalLessons = mod.lessons.length;
  const totalBlocks = lesson.blocks.length;
  const discColor = DISC_COLOR[mod.discipline] ?? Colors.teal;
  const discLabel = DISCIPLINE_LABEL[moduleId] ?? mod.discipline;

  // Progress = lessons done + fraction of current lesson's blocks
  const lessonProgress = (lessonIndex + (blockIndex + 1) / totalBlocks) / totalLessons;

  const isLastBlock = blockIndex === totalBlocks - 1;
  const isLastLesson = lessonIndex === totalLessons - 1;
  const ctaLabel = isLastBlock && isLastLesson ? 'Terminer' : 'Continuer';

  function advance() {
    if (!isLastBlock) {
      setBlockIndex((i) => i + 1);
    } else {
      const nextIndex = lessonIndex + 1;
      if (nextIndex < mod!.lessons.length) {
        nav.push('Lesson', {
          moduleId,
          lessonId: mod!.lessons[nextIndex].id,
          lessonIndex: nextIndex,
        });
      } else {
        nav.goBack();
      }
    }
  }

  return (
    <View style={styles.root}>
      <AuroraMesh />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top bar */}
        <View style={styles.ptop}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
            <Icon name="x" size={18} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.segTrack}>
            <LinearGradient
              colors={[Colors.teal, Colors.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.segFill, { width: `${lessonProgress * 100}%` }]}
            />
          </View>
          <Text style={styles.counter}>{lessonIndex + 1} / {totalLessons}</Text>
        </View>

        {/* Block content */}
        <ScrollView
          key={`${lessonId}-${blockIndex}`}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {blockIndex === 0 && (
            <>
              <Text style={[styles.eyebrow, { color: discColor }]}>{discLabel.toUpperCase()}</Text>
              <Text style={styles.concept}>{lesson.title}</Text>
            </>
          )}
          <View style={styles.blockWrap}>
            {renderBlock(lesson.blocks[blockIndex], discColor)}
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Step dots */}
        {totalBlocks > 1 && (
          <View style={styles.dots}>
            {lesson.blocks.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === blockIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity activeOpacity={0.88} onPress={advance}>
            <LinearGradient
              colors={['#7FF0E6', '#7CC0FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>{ctaLabel}</Text>
              <Icon name="arrow-right" size={18} color="#06231F" strokeWidth={2.4} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },

  ptop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
    paddingTop: 8,
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
    flexShrink: 0,
  },
  segTrack: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  segFill: {
    height: '100%',
    borderRadius: 999,
  },
  counter: {
    fontFamily: Fonts.sans600,
    fontSize: 12.5,
    color: Colors.textMuted,
    flexShrink: 0,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 22 },

  eyebrow: {
    fontFamily: Fonts.sans700,
    fontSize: 12,
    letterSpacing: 2,
  },
  concept: {
    fontFamily: Fonts.display800,
    fontSize: 28,
    letterSpacing: -0.9,
    lineHeight: 32,
    color: Colors.text,
    marginTop: 10,
    marginBottom: 16,
  },
  blockWrap: { marginTop: 4 },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: Colors.teal,
    width: 18,
  },

  ctaWrap: { paddingHorizontal: 22, paddingBottom: 8, paddingTop: 4 },
  cta: {
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    fontFamily: Fonts.sans600,
    fontSize: 16,
    color: '#06231F',
  },
});
