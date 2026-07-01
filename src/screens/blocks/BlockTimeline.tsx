import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import type { TimelineBlock } from '../../data/types';

interface Props {
  block: TimelineBlock;
  accentColor: string;
}

export default function BlockTimeline({ block, accentColor }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: accentColor }]}>{block.title}</Text>
      {block.events.map((ev, i) => {
        const isLast = i === block.events.length - 1;
        return (
          <View key={ev.id} style={styles.row}>
            {/* Left rail: dot + line */}
            <View style={styles.rail}>
              <LinearGradient
                colors={[Colors.teal, Colors.blue]}
                style={styles.dot}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={[styles.content, !isLast && styles.contentSpaced]}>
              <Text style={[styles.marker, { color: accentColor }]}>{ev.marker}</Text>
              <Text style={styles.evTitle}>{ev.title}</Text>
              <Text style={styles.description}>{ev.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.display700,
    fontSize: 17,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  rail: {
    alignItems: 'center',
    width: 14,
    flexShrink: 0,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 3,
    flexShrink: 0,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 6,
    marginBottom: 0,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  contentSpaced: {
    paddingBottom: 24,
  },
  marker: {
    fontFamily: Fonts.sans700,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  evTitle: {
    fontFamily: Fonts.display700,
    fontSize: 15,
    color: Colors.text,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  description: {
    fontFamily: Fonts.sans400,
    fontSize: 14.5,
    lineHeight: 22,
    color: '#C3C7D6',
  },
});
