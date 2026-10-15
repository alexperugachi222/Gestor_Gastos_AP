import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number; // que tan borroso se ve el fondo, por defecto 20
  tint?: 'light' | 'dark' | 'default';
  animated?: boolean;
  animatedValue?: SharedValue<number>; // de 0 a 1, solo se usa si animated es true
}

// Tarjeta base del efecto "glass": fondo borroso, borde claro y sombra.
// La usan casi todos los demas componentes.
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
  animated = false,
  animatedValue,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!animated || !animatedValue) return {};

    // Va de 0.95 a 1 segun el valor animado
    const scale = interpolate(animatedValue.value, [0, 1], [0.95, 1]);

    return {
      transform: [{ scale: withSpring(scale) }],
    };
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blurContainer}>
        {children}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: LiquidGlassColors.glassBackground,
    shadowColor: LiquidGlassColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  blurContainer: {
    padding: Spacing.three,
    overflow: 'hidden',
  },
});
