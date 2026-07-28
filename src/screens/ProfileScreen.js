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
import DentrixLogo from '../components/DentrixLogo';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();

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
      Alert.alert('Profile Updated', 'Your doctor details have been saved to MongoDB.');
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
      {/* Navbar */}
      <View style={styles.navbar}>
        <DentrixLogo size={32} showText={true} />
        <Text style={styles.pageBadge}>Doctor Profile</Text>
      </View>

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
              <TouchableOpacity onPress={() => setPassModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleChangePassword} disabled={changingPass} style={styles.darkBtn}>
                {changingPass ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.darkBtnText}>Update Password</Text>
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
  profileBanner: {
    backgroundColor: '#fafaf9',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTextLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  bannerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1916',
  },
  bannerEmail: {
    fontSize: 13,
    color: '#6b6760',
    marginTop: 2,
  },
  bannerClinic: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
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
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1916',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1a1916',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  darkBtn: {
    backgroundColor: '#1a1916',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  darkBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e6e1',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1916',
  },
  switchSub: {
    fontSize: 11,
    color: '#a8a49d',
    marginTop: 2,
  },
  passBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  passBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1916',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
    marginTop: 10,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 15,
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
});
