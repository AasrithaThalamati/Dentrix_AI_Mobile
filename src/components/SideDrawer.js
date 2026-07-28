import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from '../context/DrawerContext';
import DentrixLogo from './DentrixLogo';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.82, 320);

export default function SideDrawer() {
  const navigation = useNavigation();
  const { isOpen, closeDrawer } = useDrawer();
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigateTo = (screenName, params = {}) => {
    closeDrawer();
    setTimeout(() => {
      try {
        if (['DashboardTab', 'AnalyzeTab', 'ProfileTab'].includes(screenName)) {
          navigation.navigate('MainTabs', { screen: screenName, params });
        } else {
          navigation.navigate(screenName, params);
        }
      } catch (e) {
        console.warn('Navigation error:', e);
      }
    }, 150);
  };

  const menuItems = [
    {
      id: 'DashboardTab',
      label: 'Home',
      subtitle: 'Main Dashboard & Overview',
      icon: 'home',
      screen: 'DashboardTab',
    },
    {
      id: 'AnalyzeTab',
      label: 'Analyse',
      subtitle: 'X-Ray & DSD AI Scoring',
      icon: 'sparkles',
      screen: 'AnalyzeTab',
    },
    {
      id: 'Patients',
      label: 'Patients',
      subtitle: 'Patient Directory & Scans',
      icon: 'people',
      screen: 'Patients',
    },
    {
      id: 'Analytics',
      label: 'Analytics',
      subtitle: 'Clinical Metrics & Reports',
      icon: 'stats-chart',
      screen: 'Analytics',
    },
    {
      id: 'History',
      label: 'Scan History',
      subtitle: 'Audit Log & Previous Scans',
      icon: 'time',
      screen: 'History',
    },
    {
      id: 'Research',
      label: 'Research Guidelines',
      subtitle: 'ESE Standards & Literature',
      icon: 'book',
      screen: 'Research',
    },
    {
      id: 'ProfileTab',
      label: 'My Profile & Settings',
      subtitle: 'Practice Details & Server',
      icon: 'person-circle',
      screen: 'ProfileTab',
    },
  ];

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={closeDrawer}>
      <View style={styles.container}>
        {/* Backdrop Overlay */}
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Drawer Content */}
        <Animated.View
          style={[
            styles.drawerContent,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Top Brand Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <DentrixLogo size={30} showText={true} />
                <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color="#1a1916" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Doctor Profile Banner */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigateTo('ProfileTab')}
              style={styles.profileBanner}
            >
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarInitial}>
                  {user?.name ? user.name.replace('Dr.', '').trim().charAt(0) : 'D'}
                </Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {user?.name || 'Dr. Sarah Jenkins'}
                </Text>
                <Text style={styles.profileClinic} numberOfLines={1}>
                  {user?.clinic || 'Dentrix AI Practice'}
                </Text>
                <View style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText} numberOfLines={1}>
                    {user?.specialty || 'Endodontics & DSD'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Navigation Section */}
            <View style={styles.menuSectionHeader}>
              <Text style={styles.menuSectionTitle}>CLINICAL NAVIGATION</Text>
            </View>

            <View style={styles.menuList}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => navigateTo(item.screen)}
                  style={styles.menuItem}
                >
                  <View style={styles.menuIconBox}>
                    <Ionicons name={item.icon} size={20} color="#2563eb" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#a8a49d" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer & Server Status */}
            <View style={styles.drawerFooter}>
              <View style={styles.serverStatusRow}>
                <View style={styles.statusIndicatorDot} />
                <Text style={styles.serverStatusText}>Connected • MongoDB Active</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  closeDrawer();
                  logout();
                }}
                style={styles.logoutBtn}
              >
                <Ionicons name="log-out-outline" size={18} color="#dc2626" />
                <Text style={styles.logoutBtnText}>Sign Out</Text>
              </TouchableOpacity>

              <Text style={styles.versionText}>Dentrix AI v2.4.0 • Expo Sync</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  drawerContent: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  safeArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f3f0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f7f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: '#fafaf9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  avatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1916',
  },
  profileClinic: {
    fontSize: 11,
    color: '#6b6760',
    marginTop: 1,
  },
  specialtyBadge: {
    marginTop: 3,
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563eb',
  },
  menuSectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  menuSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a8a49d',
    letterSpacing: 0.8,
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1916',
  },
  menuSubtitle: {
    fontSize: 10,
    color: '#6b6760',
    marginTop: 1,
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 14,
    borderTopWidth: 1,
    borderTopColor: '#f4f3f0',
    backgroundColor: '#ffffff',
  },
  serverStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginRight: 6,
  },
  serverStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    marginBottom: 8,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
    marginLeft: 6,
  },
  versionText: {
    fontSize: 10,
    color: '#a8a49d',
    textAlign: 'center',
  },
});
