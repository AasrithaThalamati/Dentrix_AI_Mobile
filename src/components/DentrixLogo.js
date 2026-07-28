import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

export default function DentrixLogo({ size = 36, showText = true }) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <Circle cx="16" cy="16" r="14" stroke="#2563eb" strokeWidth="1.8" />
        <Path
          d="M8 16 Q12 8 16 16 Q20 24 24 16"
          stroke="#2563eb"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx="16" cy="16" r="2" fill="#2563eb" />
      </Svg>

      {showText && (
        <View style={styles.textRow}>
          <Text style={styles.brandName}>Dentrix</Text>
          <Text style={styles.brandSuper}>AI</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1916',
    letterSpacing: -0.5,
  },
  brandSuper: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
    marginTop: -2,
    marginLeft: 1,
  },
});
