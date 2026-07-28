import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import DentrixLogo from '../components/DentrixLogo';
import { analyticsService } from '../services/api';

export default function AnalyticsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30D');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await analyticsService.getMetrics();
      setData(res);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <DentrixLogo size={32} showText={true} />
        <Text style={styles.pageBadge}>Analytics & Reports</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Practice Analytics</Text>
        <Text style={styles.headerSubtitle}>
          AI diagnostic accuracy & obturation quality trends
        </Text>

        {/* Time Filters */}
        <View style={styles.timeRow}>
          {['7D', '30D', '90D', 'All'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTimeRange(t)}
              style={[styles.timeChip, timeRange === t && styles.activeTimeChip]}
            >
              <Text style={[styles.timeChipText, timeRange === t && styles.activeTimeChipText]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewValue}>{data?.totalAnalyses || 148}</Text>
                <Text style={styles.overviewLabel}>Total AI Scans</Text>
              </View>

              <View style={styles.overviewCard}>
                <Text style={[styles.overviewValue, { color: '#2563eb' }]}>
                  {data?.avgScore || 91.4}%
                </Text>
                <Text style={styles.overviewLabel}>Overall Accuracy</Text>
              </View>
            </View>

            {/* Quality Distribution */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Obturation Quality Distribution</Text>
              <Text style={styles.cardSub}>
                Based on European Society of Endodontology (ESE) criteria
              </Text>

              {data?.qualityDistribution?.map((item) => (
                <View key={item.label} style={styles.distRow}>
                  <View style={styles.distMeta}>
                    <Text style={styles.distLabel}>{item.label}</Text>
                    <Text style={styles.distCount}>{item.count} scans</Text>
                  </View>

                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${(item.count / (data.totalAnalyses || 148)) * 100}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Anatomical Regions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Anatomical Region Breakdown</Text>
              <Text style={styles.cardSub}>Average obturation score by tooth quadrant</Text>

              {data?.regionBreakdown?.map((reg) => (
                <View key={reg.region} style={styles.regionRow}>
                  <Text style={styles.regionName}>{reg.region}</Text>
                  <View style={styles.regionScorePill}>
                    <Text style={styles.regionScoreText}>{reg.avgScore}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e6e1',
  },
  pageBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1916',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b6760',
    marginTop: 4,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#fafaf9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  activeTimeChip: {
    backgroundColor: '#1a1916',
    borderColor: '#1a1916',
  },
  timeChipText: {
    fontSize: 12,
    color: '#6b6760',
    fontWeight: '600',
  },
  activeTimeChipText: {
    color: '#ffffff',
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  overviewCard: {
    width: '48%',
    backgroundColor: '#fafaf9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  overviewValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1916',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6b6760',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fafaf9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1916',
  },
  cardSub: {
    fontSize: 12,
    color: '#6b6760',
    marginTop: 2,
    marginBottom: 16,
  },
  distRow: {
    marginBottom: 14,
  },
  distMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  distLabel: {
    fontSize: 13,
    color: '#1a1916',
    fontWeight: '600',
  },
  distCount: {
    fontSize: 12,
    color: '#6b6760',
  },
  barBackground: {
    height: 10,
    backgroundColor: '#e8e6e1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e6e1',
  },
  regionName: {
    fontSize: 14,
    color: '#1a1916',
    fontWeight: '600',
  },
  regionScorePill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  regionScoreText: {
    color: '#2563eb',
    fontWeight: '800',
    fontSize: 13,
  },
});
