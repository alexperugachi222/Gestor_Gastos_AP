import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { Category, CATEGORIES, CATEGORY_ICONS, Expense } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

const sanitizeAmount = (value: string): string => {
  const normalized = value.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const separatorIndex = normalized.indexOf('.');
  if (separatorIndex === -1) return normalized;

  const integerPart = normalized.slice(0, separatorIndex);
  const decimalPart = normalized
    .slice(separatorIndex + 1)
    .replace(/\./g, '')
    .slice(0, 2);

  return `${integerPart}.${decimalPart}`;
};

const DESCRIPTION_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]*$/;

const sanitizeDescription = (value: string): string =>
  value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]/g, '').slice(0, 400);

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expense?: Expense;
}

// Modal que sube desde abajo para registrar un gasto.
// Para poder agregarlo hacen falta el monto y la categoria; la descripcion es opcional.
export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  expense,
}) => {
  const { addExpense, updateExpense } = useExpenses();
  // El monto es string porque asi trabaja el TextInput; se pasa a numero al guardar
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState<Date | null>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    setAmount(expense ? String(expense.amount) : '');
    setCategory(expense?.category ?? null);
    setDescription(expense?.description ?? '');
    setExpenseDate(expense ? new Date(expense.date) : new Date());
    setDatePickerVisible(false);
    setReceiptUri(expense?.receiptUri ?? null);
  }, [visible, expense]);

  const resetForm = () => {
    setAmount('');
    setCategory(null);
    setDescription('');
    setExpenseDate(new Date());
    setDatePickerVisible(false);
    setReceiptUri(null);
  };

  const handleDatePress = () => {
    const currentDate = expenseDate ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        mode: 'date',
        display: 'default',
        onValueChange: (_event, selectedDate) => setExpenseDate(selectedDate),
      });
      return;
    }
    setDatePickerVisible((visible) => !visible);
  };

  const handleReceiptSelection = async (source: 'camera' | 'library') => {
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso requerido',
          source === 'camera'
            ? 'Permite el acceso a la cámara para fotografiar el comprobante.'
            : 'Permite el acceso a tus fotos para adjuntar el comprobante.'
        );
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const extension =
        asset.mimeType?.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'jpg';
      const receiptDirectory = new Directory(Paths.document, 'expense-receipts');
      receiptDirectory.create({ idempotent: true, intermediates: true });

      const receiptFile = new File(
        receiptDirectory,
        `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
      );
      await new File(asset.uri).copy(receiptFile);
      setReceiptUri(receiptFile.uri);
    } catch (error) {
      console.error('Error al adjuntar el comprobante', error);
      Alert.alert(
        'Error',
        'No se pudo adjuntar el comprobante. Intenta de nuevo.'
      );
    }
  };

  const handleChooseReceipt = () => {
    Alert.alert('Adjuntar comprobante', 'Selecciona cómo quieres agregarlo', [
      {
        text: 'Tomar foto',
        onPress: () => {
          void handleReceiptSelection('camera');
        },
      },
      {
        text: 'Elegir de galería',
        onPress: () => {
          void handleReceiptSelection('library');
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // async porque ahora hay que esperar a que el gasto se guarde en el telefono
  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Categoría requerida', 'Selecciona una categoría para el gasto.');
      return;
    }
    if (!amount.trim()) {
      Alert.alert('Monto requerido', 'Ingresa el monto del gasto.');
      return;
    }
    if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(amount)) {
      Alert.alert(
        'Monto inválido',
        'Ingresa un número con un máximo de dos decimales.'
      );
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Monto inválido', 'El monto debe ser mayor que cero.');
      return;
    }
    if (description.length > 400 || !DESCRIPTION_PATTERN.test(description)) {
      Alert.alert(
        'Descripción inválida',
        'Usa solo letras, números y espacios, con un máximo de 400 caracteres.'
      );
      return;
    }
    if (!expenseDate) {
      Alert.alert('Fecha requerida', 'Selecciona la fecha del gasto.');
      return;
    }
 
    try {
      const expenseData = {
        amount: numericAmount,
        category,
        date: expenseDate,
        description: description.trim() || undefined,
        receiptUri: receiptUri ?? undefined,
      };

      if (expense) {
        await updateExpense({ ...expenseData, id: expense.id });
      } else {
        await addExpense(expenseData);
      }
    } catch (error) {
      // Si no se pudo guardar, se avisa y el modal queda abierto con los datos
      console.error('Error al guardar el gasto', error);
      Alert.alert(
        'Error',
        `No se pudo ${expense ? 'actualizar' : 'guardar'} el gasto. Intenta de nuevo.`
      );
      return;
    }
 
    // Reset form
    resetForm();
    onClose();
  };



  // Igual que al guardar, se limpia el formulario para que no quede texto viejo
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
        keyboardVerticalOffset={0}
      >
        {/* Tocar el fondo tambien cierra el modal */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          entering={SlideInDown.springify()}
          style={styles.modalContent}
        >
          <View style={styles.modalBackground}>
            <BlurView intensity={100} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.title}>
                  {expense ? 'Editar Gasto' : 'Agregar Gasto'}
                </Text>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Monto (USD) *</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={(value) => setAmount(sanitizeAmount(value))}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                      accessibilityLabel="Monto obligatorio, máximo dos decimales"
                    />
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Fecha del gasto *</Text>
                  <TouchableOpacity
                    style={styles.formAction}
                    onPress={handleDatePress}
                    accessibilityRole="button"
                    accessibilityLabel="Seleccionar fecha del gasto"
                  >
                    <Text style={styles.formActionText}>
                      {expenseDate
                        ? expenseDate.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Seleccionar fecha'}
                    </Text>
                    <Text style={styles.formActionIcon}>📅</Text>
                  </TouchableOpacity>
                  {Platform.OS === 'ios' && datePickerVisible && expenseDate && (
                    <DateTimePicker
                      value={expenseDate}
                      mode="date"
                      display="spinner"
                      locale="es-ES"
                      accentColor={LiquidGlassColors.primary}
                      onValueChange={(_event, selectedDate) =>
                        setExpenseDate(selectedDate)
                      }
                    />
                  )}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Categoría *</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categoriesContent}
                  >
                    {/* La elegida se pinta con el gradiente */}
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.categoryButton,
                          category === cat && styles.categoryButtonActive,
                        ]}
                      >
                        {category === cat ? (
                          <LinearGradient
                            colors={[
                              LiquidGlassColors.primary,
                              LiquidGlassColors.secondary,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.categoryGradient}
                          >
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryTextActive}>{cat}</Text>
                          </LinearGradient>
                        ) : (
                          <>
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    value={description}
                    onChangeText={(value) =>
                      setDescription(sanitizeDescription(value))
                    }
                    placeholder="Ej: Almuerzo, transporte a la universidad..."
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    maxLength={400}
                    multiline
                  />
                  <Text style={styles.descriptionCounter}>
                    {description.length}/400
                  </Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Factura o comprobante (opcional)</Text>
                  <TouchableOpacity
                    style={styles.formAction}
                    onPress={handleChooseReceipt}
                    accessibilityRole="button"
                    accessibilityLabel="Adjuntar comprobante desde cámara o galería"
                  >
                    <Text style={styles.formActionText}>
                      {receiptUri ? 'Cambiar comprobante' : 'Tomar foto o elegir imagen'}
                    </Text>
                    <Text style={styles.formActionIcon}>📎</Text>
                  </TouchableOpacity>
                  {receiptUri && (
                    <View style={styles.receiptPreview}>
                      <Image
                        source={{ uri: receiptUri }}
                        style={styles.receiptImage}
                        accessibilityLabel="Vista previa del comprobante adjunto"
                      />
                      <TouchableOpacity
                        onPress={() => setReceiptUri(null)}
                        accessibilityRole="button"
                        accessibilityLabel="Quitar comprobante"
                      >
                        <Text style={styles.removeReceiptText}>Quitar imagen</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                    ]}
                    onPress={handleSubmit}
                  >
                    <LinearGradient
                      colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>
                        {expense ? 'Guardar cambios' : 'Agregar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalBackground: {
    // Bajito a proposito: si es casi opaco no se ve el blur del fondo
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  modalBlur: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: LiquidGlassColors.glassTextSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    opacity: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.four,
  },
  inputSection: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: LiquidGlassColors.glassText,
    paddingVertical: Spacing.three,
  },
  formAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  formActionText: {
    flex: 1,
    fontSize: 16,
    color: LiquidGlassColors.glassText,
  },
  formActionIcon: {
    fontSize: 20,
    marginLeft: Spacing.two,
  },
  receiptPreview: {
    alignItems: 'flex-start',
    marginTop: Spacing.two,
  },
  receiptImage: {
    width: 112,
    height: 112,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  removeReceiptText: {
    color: LiquidGlassColors.secondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.one,
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  descriptionCounter: {
    alignSelf: 'flex-end',
    marginTop: Spacing.one,
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.two,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    padding: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: 'transparent',
  },
  categoryGradient: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    width: '100%',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  categoryText: {
    fontSize: 12,
    color: LiquidGlassColors.glassText,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  submitButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
  },
});
