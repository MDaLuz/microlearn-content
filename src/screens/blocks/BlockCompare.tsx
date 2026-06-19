import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import type { CompareBlock } from '../../data/types';

interface Props {
  block: CompareBlock;
  accentColor: string;
}

export default function BlockCompare({ block, accentColor }: Props) {
  const [selected, setSelected] = useState(0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{block.title}</Text>

      {/* Tab strip */}
      <View style={styles.tabs}>
        {block.items.map((item, i) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelected(i)}
            style={[styles.tab, selected === i && { borderBottomColor: accentColor }]}
          >
            <Text style={[styles.tabText, selected === i && { color: accentColor }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Attributes for selected item */}
      {block.attributes.map((attr) => (
        <View key={attr.id} style={styles.attrRow}>
          <Text style={styles.attrLabel}>{attr.label}</Text>
          <Text style={styles.attrValue}>{attr.values[selected]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 28 },
  title: {
    fontFamily: Fonts.display700,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 14,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  tab: {
    paddingBottom: 10,
    paddingHorizontal: 4,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontFamily: Fonts.sans600,
    fontSize: 13,
    color: Colors.textMuted,
  },
  attrRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  attrLabel: {
    fontFamily: Fonts.sans600,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  attrValue: {
    fontFamily: Fonts.sans400,
    fontSize: 14.5,
    color: '#C3C7D6',
    lineHeight: 21,
  },
});
