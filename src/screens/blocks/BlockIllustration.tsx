import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import type { ImageLoadEventData } from 'expo-image';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import type { IllustrationBlock } from '../../data/types';

interface Props {
  block: IllustrationBlock;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CONTENT_W = SCREEN_W - 44;
const MAX_H = SCREEN_H * 0.6;
const DEFAULT_RATIO = 2 / 3;

export default function BlockIllustration({ block }: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imageH, setImageH] = useState(CONTENT_W * DEFAULT_RATIO);
  const loadedRef = useRef(false);

  const onLoad = (e: ImageLoadEventData) => {
    loadedRef.current = true;
    const { width, height } = e.source;
    if (width && height) {
      setImageH(Math.min(CONTENT_W * (height / width), MAX_H));
    }
    setReady(true);
  };

  // Only mark as failed if the image never successfully loaded
  const onError = () => {
    if (!loadedRef.current) setFailed(true);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.container, { height: imageH }]}>
        {!ready && !failed && (
          <View style={[StyleSheet.absoluteFill as object, styles.placeholder]}>
            <ActivityIndicator color={Colors.teal} size="small" />
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
            style={styles.image}
            contentFit="contain"
            cachePolicy="none"
            accessible
            accessibilityLabel={block.alt}
            onLoad={onLoad}
            onError={onError}
          />
        )}
      </View>
      <Text style={styles.caption}>{block.caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  container: {
    width: CONTENT_W,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: CONTENT_W,
    height: '100%',
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
    paddingHorizontal: 8,
  },
});
