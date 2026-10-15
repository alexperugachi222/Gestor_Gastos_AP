import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

// Muestra el mes y el total gastado
export const MonthlyHeader: React.FC = () => {
  const { getMonthlyTotal } = useExpenses();
  const total = getMonthlyTotal();

  const scale = useSharedValue(1);

  // Cada vez que cambia el total, el numero "late" un poco
  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
  }, [total]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Sale en minuscula ("octubre de 2026"); la mayuscula la pone el estilo
  const currentMonth = new Date().toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(total);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <LinearGradient
          // Con algo de transparencia para que se vea el blur de la tarjeta
          colors={['rgba(255, 107, 157, 0.7)', 'rgba(196, 69, 105, 0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.monthText}>{currentMonth}</Text>
            <Animated.View style={animatedStyle}>
              <Text style={styles.totalLabel}>Total gastado</Text>
              <Text style={styles.totalAmount}>{formattedTotal}</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.four,
  },
  card: {
    overflow: 'hidden',
  },
  gradient: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  content: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
    color: LiquidGlassColors.glassTextLight,
    textTransform: 'capitalize',
    marginBottom: Spacing.two,
    opacity: 0.9,
  },
  totalLabel: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextLight,
    marginBottom: Spacing.one,
    textAlign: 'center',
    opacity: 0.8,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
    textAlign: 'center',
    letterSpacing: -1,
  },
});
