import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuroraMesh from '../components/AuroraMesh';
import CompoundGlyph from '../components/CompoundGlyph';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

function SettingRow({ label, sublabel, right }: { label: string; sublabel?: string; right: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel && <Text style={styles.rowSub}>{sublabel}</Text>}
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen() {
  const [notifs, setNotifs] = useState(true);
  const [sound, setSound] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(true);

  return (
    <View style={styles.root}>
      <AuroraMesh />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Réglages</Text>

          {/* Account */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CompoundGlyph size={32} colors={['#163031', '#2D6266', '#5BE0D8', '#A8F0F4']} />
              <View style={{ flex: 1 }}>
                <Text style={styles.accountName}>Mathieu</Text>
                <Text style={styles.accountEmail}>mathieu@mistralpharmaconsulting.ch</Text>
              </View>
            </View>
          </View>

          <Text style={styles.seclabel}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            <SettingRow
              label="Notifications"
              sublabel="Activer les notifications push"
              right={<Switch value={notifs} onValueChange={setNotifs} trackColor={{ true: Colors.teal }} thumbColor="#fff" />}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Rappel quotidien"
              sublabel="Chaque jour à 19h00"
              right={<Switch value={dailyReminder} onValueChange={setDailyReminder} trackColor={{ true: Colors.teal }} thumbColor="#fff" />}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Sons"
              right={<Switch value={sound} onValueChange={setSound} trackColor={{ true: Colors.teal }} thumbColor="#fff" />}
            />
          </View>

          <Text style={styles.seclabel}>APPRENTISSAGE</Text>
          <View style={styles.card}>
            <SettingRow
              label="Objectif quotidien"
              sublabel="3 leçons par jour"
              right={<Text style={styles.rowValue}>3</Text>}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Langue de l'interface"
              right={<Text style={styles.rowValue}>Français</Text>}
            />
          </View>

          <Text style={styles.seclabel}>À PROPOS</Text>
          <View style={styles.card}>
            <SettingRow label="Version" right={<Text style={styles.rowValue}>1.0.0</Text>} />
            <View style={styles.divider} />
            <SettingRow label="Schéma de contenu" right={<Text style={styles.rowValue}>v4</Text>} />
          </View>

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
    fontSize: 32,
    color: Colors.text,
    letterSpacing: -1,
    marginBottom: 20,
  },

  seclabel: {
    fontFamily: Fonts.sans600,
    fontSize: 12,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 10,
  },

  card: {
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  accountName: {
    fontFamily: Fonts.display700,
    fontSize: 17,
    color: Colors.text,
  },
  accountEmail: {
    fontFamily: Fonts.sans400,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowLeft: { flex: 1 },
  rowLabel: {
    fontFamily: Fonts.sans500,
    fontSize: 15,
    color: Colors.text,
  },
  rowSub: {
    fontFamily: Fonts.sans400,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowValue: {
    fontFamily: Fonts.sans500,
    fontSize: 14,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
});
