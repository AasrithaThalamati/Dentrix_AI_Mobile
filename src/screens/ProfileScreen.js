import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';

export default function ProfileScreen() {
  const { user, logout, updateUser, scanCount } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [clinic, setClinic] = useState(user?.clinic || '');
  const [specialty, setSpecialty] = useState(user?.specialty || 'General Endodontics');
  const [updating, setUpdating] = useState(false);

  // Preference Toggles
  const [darkMode, setDarkMode] = useState(false);
  const [highSensitivity, setHighSensitivity] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  // Change Password Modal
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await profileService.update({ name, email, clinic, specialty });
      updateUser({ name, email, clinic, specialty });
      Alert.alert('Profile Updated', 'Your doctor details have been saved.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Validation Error', 'Please enter your current and new password.');
      return;
    }

    setChangingPass(true);
    try {
      await profileService.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully.');
      setPassModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to change password.');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Doctor Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Banner */}
        <View style={styles.profileBanner}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {name ? name.replace('Dr.', '').trim().charAt(0) : 'D'}
            </Text>
          </View>
          <Text style={styles.bannerName}>{name || 'Dr. Sarah Jenkins'}</Text>
          <Text style={styles.bannerEmail}>{email || 'dr.jenkins@dentrix.ai'}</Text>
          <Text style={styles.bannerClinic}>{clinic || 'Apex Dental Specialist Center'}</Text>
        </View>

        {/* Live Doctor Scan Telemetry Card */}
        <View style={styles.statsCardGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxNumber}>{scanCount}</Text>
            <Text style={styles.statBoxLabel}>Total Scans</Text>
          </View>
          <View style={styles.statBoxDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statBoxNumber}>91.4%</Text>
            <Text style={styles.statBoxLabel}>Avg Quality</Text>
          </View>
          <View style={styles.statBoxDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statBoxNumber, { color: '#059669' }]}>Active</Text>
            <Text style={styles.statBoxLabel}>AI Telemetry</Text>
          </View>
        </View>

        {/* Doctor Details Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Doctor Profile & Practice</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Doctor Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Dr. Full Name"
              placeholderTextColor="#a8a49d"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="doctor@dentrix.ai"
              placeholderTextColor="#a8a49d"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Clinic / Center Name</Text>
            <TextInput
              style={styles.input}
              value={clinic}
              onChangeText={setClinic}
              placeholder="Practice Name"
              placeholderTextColor="#a8a49d"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Specialty</Text>
            <TextInput
              style={styles.input}
              value={specialty}
              onChangeText={setSpecialty}
              placeholder="Specialty"
              placeholderTextColor="#a8a49d"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleUpdateProfile}
            disabled={updating}
            style={styles.darkBtn}
          >
            {updating ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.darkBtnText}>Save Profile Updates</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Model & App Preferences</Text>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Clinical Light Theme</Text>
              <Text style={styles.switchSub}>Medical precision color palette</Text>
            </View>
            <Switch
              value={!darkMode}
              onValueChange={(val) => setDarkMode(!val)}
              trackColor={{ true: '#2563eb', false: '#e8e6e1' }}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>High Sensitivity AI Scan</Text>
              <Text style={styles.switchSub}>Detect micro sealer voids (&lt;0.5mm)</Text>
            </View>
            <Switch
              value={highSensitivity}
              onValueChange={setHighSensitivity}
              trackColor={{ true: '#2563eb', false: '#e8e6e1' }}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Auto Cloud Sync</Text>
              <Text style={styles.switchSub}>Sync patient scans to clinical database</Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ true: '#2563eb', false: '#e8e6e1' }}
            />
          </View>
        </View>

        {/* Security & Password */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security & Credentials</Text>
          <TouchableOpacity onPress={() => setPassModalVisible(true)} style={styles.passBtn}>
            <Text style={styles.passBtnText}>🔒 Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Sign Out of Practice</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Password Modal */}
      <Modal visible={passModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Account Password</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Current Password"
              placeholderTextColor="#a8a49d"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              placeholderTextColor="#a8a49d"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setPassModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={changingPass}
                style={styles.modalConfirmBtn}
              >
                {changingPass ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Update Password</Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  profileBanner: {
    backgroundColor: '#fafaf9',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginBottom: 14,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTextLarge: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
  },
  bannerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1916',
    marginBottom: 2,
  },
  bannerEmail: {
    fontSize: 13,
    color: '#6b6760',
    marginBottom: 2,
  },
  bannerClinic: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
  },
  statsCardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e8e6e1',
  },
  statBoxNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563eb',
  },
  statBoxLabel: {
    fontSize: 10,
    color: '#6b6760',
    marginTop: 2,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1916',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1916',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#e8e6e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1916',
  },
  darkBtn: {
    backgroundColor: '#1a1916',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  darkBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1916',
  },
  switchSub: {
    fontSize: 11,
    color: '#6b6760',
    marginTop: 1,
  },
  passBtn: {
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#e8e6e1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  passBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1916',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '800',
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
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1916',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#e8e6e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1916',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  modalCancelText: {
    color: '#6b6760',
    fontWeight: '700',
  },
  modalConfirmBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalConfirmText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
