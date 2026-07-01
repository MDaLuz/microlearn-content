import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import type { IllustrationBlock } from '../../data/types';

interface Props {
  block: IllustrationBlock;
}

export default function BlockIllustration({ block }: Props) {
  const { width, height } = useWindowDimensions();
  const contentW = width - 44;
  // Use 52% of screen height so both landscape and portrait images fill the card
  // generously without overflowing the lesson chrome (top bar + dots + CTA).
  const containerH = height * 0.52;

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadedRef = useRef(false);

  const onLoad = () => {
    loadedRef.current = true;
    setReady(true);
  };

  const onError = () => {
    if (!loadedRef.current) setFailed(true);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.container, { width: contentW, height: containerH }]}>
        {!ready && !failed && (
          <View style={[StyleSheet.absoluteFill as object, styles.placeholder]}>
            <ActivityIndicator color={Colors.teal} size="large" />
          </View>
        )}
        {failed ? (
          <View style={[StyleSheet.absoluteFill as object, styles.errorInner]}>
            <Text style={styles.errorIcon}>⚠</Text>
            <Text style={styles.errorText}>Image non disponible</Text>
          </View>
        ) : (
          <Image
            source={{ uri: block.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            cachePolicy="none"
            accessible
            accessibilityLabel={block.alt}
            onLoad={onLoad}
            onError={onError}
          />
        )}
      </View>
      <Text style={[styles.caption, { width: contentW }]}>{block.caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorIcon: {
    fontSize: 24,
    color: Colors.textMuted,
  },
  errorText: {
    fontFamily: Fonts.sans400,
    fontSize: 13,
    color: Colors.textMuted,
  },
  caption: {
    fontFamily: Fonts.sans400,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 10,
  },
});
