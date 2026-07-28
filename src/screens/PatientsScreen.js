import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DentrixLogo from '../components/DentrixLogo';
import { patientsService } from '../services/api';

export default function PatientsScreen() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('');
  const [toothNumber, setToothNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPatients = async () => {
    try {
      const data = await patientsService.getAll();
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load patients:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleAddPatient = async () => {
    if (!name) {
      Alert.alert('Validation Error', 'Patient name is required.');
      return;
    }

    setSaving(true);
    try {
      const created = await patientsService.create({
        name,
        age: parseInt(age) || 30,
        gender,
        phone,
        toothNumber,
        notes,
      });

      setPatients([created, ...patients]);
      setModalVisible(false);
      setName('');
      setAge('');
      setPhone('');
      setToothNumber('');
      setNotes('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create patient.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatient = (id) => {
    Alert.alert('Delete Patient', 'Are you sure you want to delete this patient record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await patientsService.delete(id);
          setPatients(patients.filter((p) => p._id !== id));
        },
      },
    ]);
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search);
    const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <DentrixLogo size={32} showText={true} />
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Patient</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Patients Management</Text>
        <Text style={styles.headerSubtitle}>
          Central directory of clinical records & X-ray case files
        </Text>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients by name or phone..."
          placeholderTextColor="#a8a49d"
          value={search}
          onChangeText={setSearch}
        />

        {/* Status Chips */}
        <View style={styles.chipRow}>
          {['All', 'Active', 'High Risk', 'Completed'].map((st) => (
            <TouchableOpacity
              key={st}
              onPress={() => setFilterStatus(st)}
              style={[styles.chip, filterStatus === st && styles.activeChip]}
            >
              <Text style={[styles.chipText, filterStatus === st && styles.activeChipText]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Patients Feed */}
        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} />
        ) : filteredPatients.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No patient records found</Text>
          </View>
        ) : (
          filteredPatients.map((p) => (
            <View key={p._id} style={styles.patientCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.patientName}>{p.name}</Text>
                  <Text style={styles.patientSub}>
                    {p.age} yrs • {p.gender} • {p.phone || 'No phone'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        p.status === 'High Risk' ? '#fee2e2' : p.status === 'Completed' ? '#d1fae5' : '#eff6ff',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          p.status === 'High Risk' ? '#dc2626' : p.status === 'Completed' ? '#059669' : '#2563eb',
                      },
                    ]}
                  >
                    {p.status || 'Active'}
                  </Text>
                </View>
              </View>

              {p.toothNumber ? <Text style={styles.toothText}>🦷 {p.toothNumber}</Text> : null}
              {p.notes ? <Text style={styles.notesText}>{p.notes}</Text> : null}

              <View style={styles.cardFooter}>
                <Text style={styles.casesCount}>
                  Scans: {p.casesCount || 1} • Last: {p.lastScanDate || 'Recent'}
                </Text>
                <TouchableOpacity onPress={() => handleDeletePatient(p._id)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Patient Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register New Patient</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Patient Full Name"
              placeholderTextColor="#a8a49d"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                placeholder="Age"
                placeholderTextColor="#a8a49d"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
              <TextInput
                style={[styles.modalInput, { flex: 1.5 }]}
                placeholder="Phone Number"
                placeholderTextColor="#a8a49d"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Tooth Number (e.g. #14, #19)"
              placeholderTextColor="#a8a49d"
              value={toothNumber}
              onChangeText={setToothNumber}
            />

            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Clinical Notes / Pre-op Sensitivity"
              placeholderTextColor="#a8a49d"
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleAddPatient} disabled={saving} style={styles.modalSaveBtn}>
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Patient</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    backgroundColor: '#1a1916',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
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
    marginBottom: 14,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
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
  patientCard: {
    backgroundColor: '#fafaf9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1916',
  },
  patientSub: {
    fontSize: 12,
    color: '#6b6760',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  toothText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#6b6760',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e8e6e1',
  },
  casesCount: {
    fontSize: 11,
    color: '#a8a49d',
  },
  deleteBtnText: {
    color: '#dc2626',
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1916',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#fafaf9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1a1916',
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  modalRow: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelBtn: {
    marginRight: 16,
  },
  modalCancelText: {
    color: '#6b6760',
    fontSize: 14,
  },
  modalSaveBtn: {
    backgroundColor: '#1a1916',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalSaveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
