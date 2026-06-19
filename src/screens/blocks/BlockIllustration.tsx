import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import type { IllustrationBlock } from '../../data/types';

interface Props {
  block: IllustrationBlock;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CONTENT_W = SCREEN_W - 44; // 22px padding each side
const MAX_H = SCREEN_H * 0.6;
const DEFAULT_RATIO = 2 / 3; // 3:2 default aspect ratio

type LoadState = 'loading' | 'loaded' | 'error';

export default function BlockIllustration({ block }: Props) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [imageH, setImageH] = useState(CONTENT_W * DEFAULT_RATIO);

  const onLoad = (e: { nativeEvent: { source: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.source;
    const ratio = height / width;
    setImageH(Math.min(CONTENT_W * ratio, MAX_H));
    setLoadState('loaded');
  };

  const onError = () => setLoadState('error');

  return (
    <View style={styles.wrap}>
      {loadState === 'error' ? (
        <View style={[styles.errorBox, { height: CONTENT_W * DEFAULT_RATIO }]}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorText}>Image non disponible</Text>
        </View>
      ) : (
        <View style={{ width: CONTENT_W, height: imageH }}>
          {loadState === 'loading' && (
            <View style={[styles.placeholder, { height: imageH }]}>
              <ActivityIndicator color={Colors.teal} size="small" />
            </View>
          )}
          <Image
            source={{ uri: block.imageUrl, cache: 'force-cache' }}
            style={[
              styles.image,
              { height: imageH },
              loadState === 'loading' && { opacity: 0, position: 'absolute' },
            ]}
            accessibilityLabel={block.alt}
            onLoad={onLoad}
            onError={onError}
            resizeMode="contain"
          />
        </View>
      )}
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
  placeholder: {
    width: CONTENT_W,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: CONTENT_W,
    borderRadius: 12,
  },
  errorBox: {
    width: CONTENT_W,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
