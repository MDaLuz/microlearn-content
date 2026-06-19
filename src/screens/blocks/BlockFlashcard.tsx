import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import type { FlashcardBlock } from '../../data/types';

interface Props {
  block: FlashcardBlock;
  accentColor: string;
}

export default function BlockFlashcard({ block, accentColor }: Props) {
  const [activeCard, setActiveCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = block.cards[activeCard];

  const go = (dir: 1 | -1) => {
    setActiveCard((c) => Math.max(0, Math.min(block.cards.length - 1, c + dir)));
    setFlipped(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{block.title}</Text>

      <TouchableOpacity activeOpacity={0.9} onPress={() => setFlipped((f) => !f)}>
        <View style={[styles.card, flipped && styles.cardFlipped]}>
          <LinearGradient
            colors={['rgba(91,224,216,0.08)', 'rgba(111,168,255,0.05)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardBorder} />

          {!flipped ? (
            <>
              <Text style={styles.cardLabel}>QUESTION</Text>
              <Text style={styles.cardFront}>{card.front}</Text>
              <Text style={styles.tap}>Appuyer pour voir la réponse</Text>
            </>
          ) : (
            <>
              <Text style={[styles.cardLabel, { color: accentColor }]}>RÉPONSE</Text>
              <Text style={styles.cardBack}>{card.back}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          onPress={() => go(-1)}
          disabled={activeCard === 0}
          style={[styles.navBtn, activeCard === 0 && { opacity: 0.3 }]}
        >
          <Text style={styles.navBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navCounter}>{activeCard + 1} / {block.cards.length}</Text>
        <TouchableOpacity
          onPress={() => go(1)}
          disabled={activeCard === block.cards.length - 1}
          style={[styles.navBtn, activeCard === block.cards.length - 1 && { opacity: 0.3 }]}
        >
          <Text style={styles.navBtnText}>→</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cardFlipped: { minHeight: 160 },
  cardBorder: {
    ...StyleSheet.absoluteFill as object,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(91,224,216,0.25)',
  },
  cardLabel: {
    fontFamily: Fonts.sans700,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  cardFront: {
    fontFamily: Fonts.sans500,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  cardBack: {
    fontFamily: Fonts.sans400,
    fontSize: 15,
    color: '#C3C7D6',
    lineHeight: 23,
  },
  tap: {
    fontFamily: Fonts.sans400,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 14,
    textAlign: 'center',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 14,
  },
  navBtn: {
    padding: 8,
  },
  navBtnText: {
    fontFamily: Fonts.sans600,
    fontSize: 18,
    color: Colors.textSecondary,
  },
  navCounter: {
    fontFamily: Fonts.sans600,
    fontSize: 13,
    color: Colors.textMuted,
  },
});
