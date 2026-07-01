import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
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
import { getModule, markLessonCompleted } from '../data/store';
import type { RootStackParamList } from '../navigation';
import type { Block, TextBlock, FlashcardBlock, QuizBlock, CompareBlock, ScenarioBlock, IllustrationBlock, TimelineBlock } from '../data/types';
import BlockText from './blocks/BlockText';
import BlockFlashcard from './blocks/BlockFlashcard';
import BlockQuiz from './blocks/BlockQuiz';
import BlockCompare from './blocks/BlockCompare';
import BlockScenario from './blocks/BlockScenario';
import BlockIllustration from './blocks/BlockIllustration';
import BlockTimeline from './blocks/BlockTimeline';

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
    case 'timeline':
      return <BlockTimeline block={block as TimelineBlock} accentColor={disciplineColor} />;
    default:
      return null;
  }
}

export default function LessonScreen() {
  const nav = useNavigation<NativeStackNavigationProp<StackParams>>();
  const route = useRoute<Route>();
  const { moduleId, lessonId, lessonIndex } = route.params;
  const { width } = useWindowDimensions();

  const mod = getModule(moduleId);
  if (!mod) return null;

  const lesson = mod.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  const [blockIndex, setBlockIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const flatRef = useRef<FlatList<Block>>(null);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const xpScale = useRef(new Animated.Value(0.6)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;

  const totalLessons = mod.lessons.length;
  const totalBlocks = lesson.blocks.length;
  const discColor = DISC_COLOR[mod.discipline] ?? Colors.teal;
  const discLabel = DISCIPLINE_LABEL[moduleId] ?? mod.discipline;

  const lessonProgress = (lessonIndex + (blockIndex + 1) / totalBlocks) / totalLessons;

  const isLastBlock = blockIndex === totalBlocks - 1;
  const isLastLesson = lessonIndex === totalLessons - 1;
  const ctaLabel = isLastBlock && isLastLesson ? 'Terminer' : 'Continuer';

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setBlockIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  function triggerCompletion() {
    markLessonCompleted(moduleId, lessonIndex);
    setShowCompletion(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(xpScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(xpOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }

  function proceedAfterCompletion() {
    const nextIndex = lessonIndex + 1;
    if (nextIndex < mod!.lessons.length) {
      nav.replace('Lesson', {
        moduleId,
        lessonId: mod!.lessons[nextIndex].id,
        lessonIndex: nextIndex,
      });
    } else {
      nav.goBack();
    }
  }

  function advance() {
    if (!isLastBlock) {
      flatRef.current?.scrollToIndex({ index: blockIndex + 1, animated: true });
    } else {
      triggerCompletion();
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

        {/* Horizontally swipeable blocks */}
        <FlatList
          ref={flatRef}
          data={lesson.blocks}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(_, i) => `${lessonId}-${i}`}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          style={styles.flatList}
          renderItem={({ item, index }) => (
            <ScrollView
              style={{ width }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {index === 0 && (
                <>
                  <Text style={[styles.eyebrow, { color: discColor }]}>{discLabel.toUpperCase()}</Text>
                  <Text style={styles.concept}>{lesson.title}</Text>
                </>
              )}
              <View style={styles.blockWrap}>
                {renderBlock(item, discColor)}
              </View>
              <View style={{ height: 24 }} />
            </ScrollView>
          )}
        />

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

        {/* Completion overlay */}
        {showCompletion && (
          <Animated.View style={[styles.completionOverlay, { opacity: overlayOpacity }]}>
            <LinearGradient
              colors={['rgba(10,11,22,0.96)', 'rgba(10,11,22,0.98)']}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[styles.completionCard, { opacity: xpOpacity, transform: [{ scale: xpScale }] }]}>
              <View style={styles.xpRing}>
                <LinearGradient
                  colors={[Colors.teal, Colors.blue]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.xpEmoji}>⚡</Text>
              </View>
              <Text style={styles.completionTitle}>Leçon terminée !</Text>
              <View style={styles.xpBadge}>
                <Text style={styles.xpValue}>+{lesson.xpReward}</Text>
                <Text style={styles.xpLabel}> XP</Text>
              </View>
              <Text style={styles.lessonNameDone}>{lesson.title}</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={proceedAfterCompletion}>
                <LinearGradient
                  colors={['#7FF0E6', '#7CC0FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueBtn}
                >
                  <Text style={styles.continueBtnText}>
                    {lessonIndex + 1 < mod!.lessons.length ? 'Leçon suivante' : 'Terminer'}
                  </Text>
                  <Icon name="arrow-right" size={18} color="#06231F" strokeWidth={2.4} />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => nav.goBack()} style={styles.backToModule}>
                <Text style={styles.backToModuleText}>Retour au module</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
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

  flatList: { flex: 1 },
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

  completionOverlay: {
    ...(StyleSheet.absoluteFill as object),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  completionCard: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  xpRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpEmoji: {
    fontSize: 36,
  },
  completionTitle: {
    fontFamily: Fonts.display800,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.8,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  xpValue: {
    fontFamily: Fonts.display800,
    fontSize: 52,
    color: Colors.teal,
    letterSpacing: -2,
  },
  xpLabel: {
    fontFamily: Fonts.sans600,
    fontSize: 20,
    color: Colors.teal,
    marginLeft: 4,
  },
  lessonNameDone: {
    fontFamily: Fonts.sans400,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  continueBtn: {
    height: 54,
    paddingHorizontal: 32,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnText: {
    fontFamily: Fonts.sans600,
    fontSize: 16,
    color: '#06231F',
  },
  backToModule: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backToModuleText: {
    fontFamily: Fonts.sans500,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
