import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DentrixLogo from '../components/DentrixLogo';
import { historyService } from '../services/api';

export default function HistoryScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scanTypeFilter, setScanTypeFilter] = useState('All');

  const loadHistory = async () => {
    try {
      const data = await historyService.getAll();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Entry', 'Remove this audit record from scan history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await historyService.delete(id);
          setLogs(logs.filter((item) => item._id !== id));
        },
      },
    ]);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      log.caseId?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      scanTypeFilter === 'All' || log.scanType?.includes(scanTypeFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <DentrixLogo size={32} showText={true} />
        <Text style={styles.pageBadge}>Scan Audit Log</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Scan History Audit Log</Text>
        <Text style={styles.headerSubtitle}>
          Complete repository of past X-ray & Smile analyses
        </Text>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search by patient name or case ID..."
          placeholderTextColor="#a8a49d"
          value={search}
          onChangeText={setSearch}
        />

        {/* Filters */}
        <View style={styles.chipRow}>
          {['All', 'Obturation', 'Smile'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setScanTypeFilter(type)}
              style={[styles.chip, scanTypeFilter === type && styles.activeChip]}
            >
              <Text style={[styles.chipText, scanTypeFilter === type && styles.activeChipText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Log List */}
        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} />
        ) : filteredLogs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No matching history logs</Text>
          </View>
        ) : (
          filteredLogs.map((item) => (
            <View key={item._id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View>
                  <Text style={styles.patientName}>{item.patientName}</Text>
                  <Text style={styles.logMeta}>
                    {item.caseId || 'CASE-9842'} • {item.scanType}
                  </Text>
                </View>

                <View
                  style={[
                    styles.scoreBadge,
                    {
                      backgroundColor: item.score >= 90 ? '#d1fae5' : '#fef3c7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.scoreBadgeText,
                      { color: item.score >= 90 ? '#059669' : '#d97706' },
                    ]}
                  >
                    {item.score}%
                  </Text>
                </View>
              </View>

              <View style={styles.logFooter}>
                <Text style={styles.logDate}>📅 Scan Date: {item.date}</Text>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                  <Text style={styles.deleteText}>Delete Record</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  searchInput: {
    backgroundColor: '#fafaf9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1a1916',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fafaf9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  activeChip: {
    backgroundColor: '#1a1916',
    borderColor: '#1a1916',
  },
  chipText: {
    fontSize: 12,
    color: '#6b6760',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#ffffff',
  },
  logCard: {
    backgroundColor: '#fafaf9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1916',
  },
  logMeta: {
    fontSize: 12,
    color: '#6b6760',
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e8e6e1',
  },
  logDate: {
    fontSize: 11,
    color: '#a8a49d',
  },
  deleteText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b6760',
    fontSize: 14,
  },
});
