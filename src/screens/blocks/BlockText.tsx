import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import type { TextBlock } from '../../data/types';

const CONTENT_W = Dimensions.get('window').width - 44;

interface Props {
  block: TextBlock;
}

// Simple markdown renderer: bold (**text**), headers (## and ###), bullet lists (- item)
function renderMarkdown(md: string) {
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <Text key={key++} style={styles.h2}>{line.slice(3)}</Text>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <Text key={key++} style={styles.h3}>{line.slice(4)}</Text>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <View key={key++} style={styles.bulletRow}>
          <Text style={styles.bullet}>·</Text>
          <Text style={styles.bulletText}>{renderInline(line.slice(2))}</Text>
        </View>
      );
    } else if (line.trim() === '') {
      elements.push(<View key={key++} style={{ height: 10 }} />);
    } else {
      elements.push(
        <Text key={key++} style={styles.body}>{renderInline(line)}</Text>
      );
    }
  }

  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={i} style={styles.bold}>{part.slice(2, -2)}</Text>;
    }
    return <Text key={i}>{part}</Text>;
  });
}

export default function BlockText({ block }: Props) {
  return (
    <View style={styles.wrap}>
      {renderMarkdown(block.markdown)}
      {block.svg && (
        <View style={styles.svgWrap}>
          <SvgXml xml={block.svg} width={CONTENT_W} height={CONTENT_W * (9 / 16)} />
        </View>
      )}
      {block.caption && (
        <Text style={styles.caption}>{block.caption}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  h2: {
    fontFamily: Fonts.display700,
    fontSize: 20,
    color: Colors.text,
    letterSpacing: -0.4,
    marginTop: 10,
    marginBottom: 6,
    lineHeight: 25,
  },
  h3: {
    fontFamily: Fonts.display600,
    fontSize: 17,
    color: Colors.text,
    letterSpacing: -0.2,
    marginTop: 8,
    marginBottom: 4,
  },
  body: {
    fontFamily: Fonts.sans400,
    fontSize: 15.5,
    lineHeight: 25,
    color: '#C3C7D6',
  },
  bold: {
    fontFamily: Fonts.sans700,
    color: Colors.text,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  bullet: {
    fontFamily: Fonts.sans700,
    fontSize: 16,
    color: Colors.teal,
    lineHeight: 25,
  },
  bulletText: {
    fontFamily: Fonts.sans400,
    fontSize: 15.5,
    lineHeight: 25,
    color: '#C3C7D6',
    flex: 1,
  },
  svgWrap: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  caption: {
    fontFamily: Fonts.sans400,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});
