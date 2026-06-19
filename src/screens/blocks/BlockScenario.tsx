import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/Icon';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import type { ScenarioBlock } from '../../data/types';

interface Props {
  block: ScenarioBlock;
  accentColor: string;
}

export default function BlockScenario({ block, accentColor }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const pick = (qIdx: number, oIdx: number) => {
    if (answers[qIdx] !== undefined) return;
    setAnswers((a) => ({ ...a, [qIdx]: oIdx }));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{block.title}</Text>

      {/* Scenario context callout */}
      <View style={styles.context}>
        <LinearGradient
          colors={['rgba(91,224,216,0.1)', 'rgba(111,168,255,0.06)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.contextBorder} />
        <Text style={styles.contextLabel}>CONTEXTE</Text>
        <Text style={styles.contextText}>{block.context}</Text>
      </View>

      {/* Questions */}
      {block.questions.map((q, qi) => {
        const chosen = answers[qi];
        const answered = chosen !== undefined;

        return (
          <View key={q.id} style={styles.question}>
            <Text style={styles.stem}>{q.stem}</Text>

            {q.options.map((opt, oi) => {
              const isChosen = chosen === oi;
              const isCorrect = oi === q.correctIndex;
              const showState = answered;

              let bg = 'rgba(255,255,255,0.05)';
              let border = 'rgba(255,255,255,0.1)';
              let textColor: string = Colors.textSecondary;

              if (showState && isCorrect) {
                bg = 'rgba(125,235,160,0.12)';
                border = 'rgba(125,235,160,0.4)';
                textColor = '#7DEBA0';
              } else if (showState && isChosen && !isCorrect) {
                bg = 'rgba(226,75,74,0.1)';
                border = 'rgba(226,75,74,0.35)';
                textColor = '#F08080';
              }

              return (
                <TouchableOpacity
                  key={oi}
                  activeOpacity={answered ? 1 : 0.8}
                  onPress={() => pick(qi, oi)}
                  style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                >
                  <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
                  {showState && isCorrect && (
                    <Icon name="check" size={16} color="#7DEBA0" strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            })}

            {answered && (
              <View style={styles.explanation}>
                <LinearGradient
                  colors={['rgba(91,224,216,0.08)', 'rgba(111,168,255,0.05)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.expBorder} />
                <Text style={styles.expLabel}>EXPLICATION</Text>
                <Text style={styles.expText}>{q.explanation}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 28 },
  title: {
    fontFamily: Fonts.display700,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  context: {
    padding: 16,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
  },
  contextBorder: {
    ...StyleSheet.absoluteFill as object,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(91,224,216,0.22)',
  },
  contextLabel: {
    fontFamily: Fonts.sans700,
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#7FE3DB',
    marginBottom: 8,
  },
  contextText: {
    fontFamily: Fonts.sans400,
    fontSize: 14,
    lineHeight: 22,
    color: '#C3C7D6',
  },
  question: { marginBottom: 20 },
  stem: {
    fontFamily: Fonts.sans500,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  optText: {
    fontFamily: Fonts.sans400,
    fontSize: 14.5,
    lineHeight: 20,
    flex: 1,
  },
  explanation: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  expBorder: {
    ...StyleSheet.absoluteFill as object,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(91,224,216,0.25)',
  },
  expLabel: {
    fontFamily: Fonts.sans700,
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#7FE3DB',
    marginBottom: 6,
  },
  expText: {
    fontFamily: Fonts.sans400,
    fontSize: 14,
    lineHeight: 21,
    color: '#E2E5EF',
  },
});
