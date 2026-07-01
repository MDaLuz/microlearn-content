import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AuroraMesh from '../components/AuroraMesh';
import GlassCard from '../components/GlassCard';
import Icon from '../components/Icon';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

function SRow({
  icon,
  iconColor,
  label,
  labelColor,
  right,
  first = false,
}: {
  icon: string;
  iconColor: string;
  label: string;
  labelColor?: string;
  right?: React.ReactNode;
  first?: boolean;
}) {
  return (
    <View style={[styles.srow, !first && styles.srowBorder]}>
      <View style={styles.sic}>
        <Icon name={icon} size={18} color={iconColor} strokeWidth={2} />
      </View>
      <Text style={[styles.slabel, labelColor ? { color: labelColor } : undefined]}>{label}</Text>
      {right}
    </View>
  );
}

function SVal({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sval}>{children}</Text>;
}

function SChevron() {
  return <Icon name="chevron-right" size={16} color="#6B7088" />;
}

function SToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: Colors.teal, false: 'rgba(255,255,255,0.16)' }}
      thumbColor="#fff"
    />
  );
}

export default function SettingsScreen() {
  const [spacedReview, setSpacedReview] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [sound, setSound] = useState(false);

  return (
    <View style={styles.root}>
      <AuroraMesh />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Réglages</Text>

          {/* Profile */}
          <GlassCard style={styles.profile}>
            <LinearGradient
              colors={['#5BE0D8', '#6FA8FF', '#B7A0FF']}
              start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarLetter}>M</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.pname}>Mathieu</Text>
              <Text style={styles.pmeta}>Niveau 14 · 3 240 XP · depuis 2025</Text>
            </View>
            <View style={styles.goBtn}>
              <Icon name="chevron-right" size={16} color="#A9AEC2" />
            </View>
          </GlassCard>

          {/* Learning */}
          <Text style={styles.seclabel}>APPRENTISSAGE</Text>
          <GlassCard style={styles.group}>
            <SRow first icon="target" iconColor={Colors.teal}
              label="Objectif quotidien"
              right={<><SVal>30 XP </SVal><SChevron /></>}
            />
            <SRow icon="clock" iconColor="#9CC4FF"
              label="Heure de rappel"
              right={<><SVal>19:00 </SVal><SChevron /></>}
            />
            <SRow icon="refresh" iconColor="#D6AEFF"
              label="Révision espacée"
              right={<SToggle value={spacedReview} onChange={setSpacedReview} />}
            />
          </GlassCard>

          {/* App */}
          <Text style={styles.seclabel}>APPLICATION</Text>
          <GlassCard style={styles.group}>
            <SRow first icon="flame" iconColor="#FFC56B"
              label="Rappels de série"
              right={<SToggle value={streakReminders} onChange={setStreakReminders} />}
            />
            <SRow icon="download" iconColor={Colors.teal}
              label="Télécharger en Wi-Fi seulement"
              right={<SToggle value={wifiOnly} onChange={setWifiOnly} />}
            />
            <SRow icon="volume-2" iconColor="#B7A0FF"
              label="Son et haptique"
              right={<SToggle value={sound} onChange={setSound} />}
            />
          </GlassCard>

          {/* Account */}
          <Text style={styles.seclabel}>COMPTE</Text>
          <GlassCard style={styles.group}>
            <SRow first icon="award" iconColor="#FFD79A"
              label="Abonnement"
              right={<><SVal>Pro </SVal><SChevron /></>}
            />
            <SRow icon="log-out" iconColor="#FF8FA0"
              label="Se déconnecter"
              labelColor="#FF9FAD"
            />
          </GlassCard>

          {/* About */}
          <Text style={styles.seclabel}>À PROPOS</Text>
          <GlassCard style={styles.group}>
            <SRow first icon="info" iconColor={Colors.textMuted}
              label="Version"
              right={<SVal>1.0.0</SVal>}
            />
            <SRow icon="layers" iconColor={Colors.textMuted}
              label="Schéma de contenu"
              right={<SVal>v4</SVal>}
            />
          </GlassCard>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 16 },

  title: {
    fontFamily: Fonts.display800,
    fontSize: 30,
    color: Colors.text,
    letterSpacing: -0.9,
    marginBottom: 12,
  },

  // Profile
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 13,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: {
    fontFamily: Fonts.display800,
    fontSize: 24,
    color: '#0B0C16',
  },
  pname: {
    fontFamily: Fonts.display700,
    fontSize: 20,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  pmeta: {
    fontFamily: Fonts.sans400,
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  goBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  seclabel: {
    fontFamily: Fonts.sans600,
    fontSize: 12,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginTop: 20,
    marginBottom: 8,
  },

  // Group card
  group: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  // Row
  srow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  srowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderRadius: 0,
  },
  sic: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  slabel: {
    fontFamily: Fonts.sans600,
    fontSize: 14.5,
    color: Colors.text,
    flex: 1,
  },
  sval: {
    fontFamily: Fonts.sans600,
    fontSize: 13,
    color: Colors.textSecondary,
    flexShrink: 0,
  },
});
