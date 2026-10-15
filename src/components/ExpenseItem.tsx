import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense, CATEGORY_ICONS } from '@/types/expense';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface ExpenseItemProps {
  expense: Expense;
  index: number; // sirve para que cada fila entre un poquito despues de la anterior
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

// Una fila de la lista de gastos
export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  index,
  onEdit,
  onDelete,
}) => {
  // Queda algo como "15 oct"
  const formattedDate = new Date(expense.date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });

  // Queda algo como "$15.50"
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(expense.amount);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.container}
    >
      <GlassCard>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Text style={styles.icon}>{CATEGORY_ICONS[expense.category]}</Text>
              </LinearGradient>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.category}>{expense.category}</Text>
              {expense.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {expense.description}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.amount}>{formattedAmount}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          {expense.receiptUri && (
            <Image
              source={{ uri: expense.receiptUri }}
              style={styles.receiptThumbnail}
              accessibilityLabel="Comprobante adjunto"
            />
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(expense)}
            accessibilityRole="button"
            accessibilityLabel={`Editar gasto de ${formattedAmount}`}
          >
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(expense)}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar gasto de ${formattedAmount}`}
          >
            <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.two,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: Spacing.two,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: LiquidGlassColors.glassTextSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: Spacing.two,
  },
  receiptThumbnail: {
    width: 40,
    height: 40,
    borderRadius: Spacing.one,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    marginLeft: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(196, 69, 105, 0.1)',
  },
  actionText: {
    color: LiquidGlassColors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteText: {
    color: LiquidGlassColors.secondary,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
  },
});
