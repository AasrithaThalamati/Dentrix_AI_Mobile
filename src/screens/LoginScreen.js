import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import DentrixLogo from '../components/DentrixLogo';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('doctor@dentrix.ai');
    setPassword('Dentrix2026!');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Brand */}
          <View style={styles.headerContainer}>
            <DentrixLogo size={48} showText={true} />
            <Text style={styles.brandSubtitle}>
              Clinical Endodontic & Aesthetic AI Suite
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In to Practice</Text>
            <Text style={styles.cardDesc}>Enter your clinical account credentials</Text>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="dr.jenkins@dentrix.ai"
                placeholderTextColor="#a8a49d"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#a8a49d"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={loading}
              style={styles.darkButton}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.darkButtonText}>Sign In to Dashboard →</Text>
              )}
            </TouchableOpacity>

            {/* Demo Fill */}
            <TouchableOpacity onPress={handleDemoFill} style={styles.demoButton}>
              <Text style={styles.demoButtonText}>⚡ Quick Auto-Fill Demo Credentials</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Signup Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have a practice account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupText}>Register Clinic</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 80,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#6b6760',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fafaf9',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1916',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6b6760',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#1a1916',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  darkButton: {
    backgroundColor: '#1a1916',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  darkButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoButton: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  demoButtonText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: '#6b6760',
    fontSize: 14,
  },
  signupText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
});
