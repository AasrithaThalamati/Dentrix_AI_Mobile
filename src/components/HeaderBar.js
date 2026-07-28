import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from '../context/DrawerContext';
import { useAuth } from '../context/AuthContext';
import DentrixLogo from './DentrixLogo';

export default function HeaderBar({ title, showBack = false, onBack, rightAction }) {
  const navigation = useNavigation();
  const { openDrawer } = useDrawer();
  const { user } = useAuth();

  const handleHomeClick = () => {
    try {
      navigation.navigate('MainTabs', { screen: 'DashboardTab' });
    } catch (e) {
      console.warn('Home navigation error:', e);
    }
  };

  return (
    <View style={styles.headerBar}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#1a1916" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.hamburgerBtn}
            activeOpacity={0.75}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={24} color="#1a1916" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleHomeClick} activeOpacity={0.8} style={styles.logoWrapper}>
          <DentrixLogo size={30} showText={!title} />
        </TouchableOpacity>
      </View>

      {title ? (
        <TouchableOpacity onPress={handleHomeClick} activeOpacity={0.8} style={styles.centerContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.rightContainer}>
        {rightAction ? (
          rightAction
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openDrawer}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarInitial}>
              {user?.name ? user.name.replace('Dr.', '').trim().charAt(0) : 'D'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 52,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e6e1',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fafaf9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginRight: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fafaf9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginRight: 10,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1916',
    letterSpacing: -0.3,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
});
