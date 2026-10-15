# Sistema de Diseño - Liquid Glass

Base visual para crear pantallas y modales nuevos con el mismo estilo. Los valores salen de `src/constants/theme.ts`; los ejemplos reales están en `src/components/` y `src/app/index.tsx`.

## Guía funcional de gastos

Usa esta sección al implementar el registro y la gestión de gastos. Mantén la arquitectura existente: tipos en `src/types/expense.ts`, acceso a datos en `src/database/expenseRepository.ts`, estado compartido en `src/context/ExpenseContext.tsx` y UI en `src/components/` y `src/app/index.tsx`.

### Datos del gasto

- Cada gasto debe guardar un monto, una categoría y una fecha obligatorios.
- La fecha representa el día del gasto, no necesariamente el día en que se registra. Muéstrala en el formulario con un selector de fecha; al crear un gasto, selecciona hoy inicialmente. Al editar, conserva la fecha existente hasta que el usuario la cambie.
- La factura o comprobante es opcional. Permite elegir una imagen de la galería o tomar una foto con la cámara. Solicita permisos cuando corresponda y comunica claramente si el permiso se deniega o la selección falla.
- La descripción es opcional.
- Si se añade una propiedad de comprobante al modelo, persístela y recupérala junto con el gasto; no guardes los bytes de la imagen directamente en SQLite. Conserva una referencia local y contempla que el archivo pueda dejar de estar disponible.
- Mantén el mapeo entre `Expense`, SQLite y la UI sincronizado. Si se modifica el esquema, inicializa y migra la base de datos sin perder los gastos existentes.

### Formulario y validación

- **Monto (obligatorio):** admite solo dígitos y un separador decimal, con hasta dos cifras decimales. Rechaza letras, signos y formatos malformados; valida el valor final antes de guardarlo y no conviertas entradas inválidas en cero. El teclado decimal ayuda, pero no sustituye la validación.
- **Categoría (obligatoria):** si el usuario intenta guardar sin elegir una, muestra un mensaje explícito junto al selector o mediante el mecanismo de alerta de la aplicación. No ocultes este caso deshabilitando el botón de guardar antes de que pueda mostrar el mensaje.
- **Fecha (obligatoria):** valida que haya una fecha seleccionada antes de guardar.
- **Descripción (opcional):** limita la entrada a 400 caracteres y permite únicamente letras del alfabeto español (incluidas tildes, diéresis y ñ), dígitos y espacios. Filtra o rechaza los demás caracteres tanto en la interacción como en la validación al guardar.
- Mantén los datos ingresados cuando un guardado falle y muestra el error; limpia el formulario solo tras guardar correctamente o cancelar/cerrar según el patrón del modal.

### Operaciones y lista

- Permite abrir un gasto para editarlo, precargando todos sus campos, incluidos fecha y comprobante. Persiste la edición y actualiza el estado visible solo cuando SQLite confirma el cambio.
- Permite eliminar un gasto con confirmación antes de borrar. Si falla el borrado, informa al usuario y conserva el elemento.
- Añade una opción visible para ordenar los gastos por monto descendente (los más altos primero). Al activar el ordenamiento, los valores mayores deben preceder a los menores; resuelve empates por fecha descendente. Al desactivarlo, restaura el orden habitual de gastos recientes primero.
- Aplica el orden al conjunto de gastos que se muestra sin alterar los montos, totales ni registros guardados. Mantén el filtrado mensual existente si la pantalla muestra solo los gastos del mes actual.
- Actualiza las operaciones del repositorio y el contexto para que la lista, los totales y las acciones de edición/eliminación reflejen los datos persistidos.

## Colores y espaciado

```typescript
import { LiquidGlassColors, Spacing } from '@/constants/theme';
```

| Uso | Valor |
|-----|-------|
| Gradiente destacado | `primary #FF6B9D` → `secondary #C44569` |
| Fondo de pantalla | `LinearGradient` con `['#FFF5F9', '#FFE8F0', '#FFF9FC']` |
| Texto principal | `glassText #2C1B47` |
| Texto secundario | `glassTextSecondary #8B6B8F` |
| Texto sobre gradiente | `glassTextLight #FFFBF5` |
| Borde glass | `glassBorder` |

Espaciado: `Spacing.two` (8) entre elementos, `Spacing.three` (16) padding de cards, `Spacing.four` (24) padding de pantallas.

## Efecto glass

El blur solo se nota si hay color detrás. Reglas:

1. Usa `GlassCard` para las tarjetas.
2. Pon círculos de colores (`position: 'absolute'`, `borderRadius: 999`, `pointerEvents="none"`) entre el fondo y el contenido. Ejemplo en `src/app/index.tsx`.
3. Los gradientes sobre una `GlassCard` van translúcidos (~0.7), no sólidos.
4. Fondos de paneles y modales con poca opacidad (~0.45), nunca ~0.95.

En Android el blur de `expo-blur` es solo una aproximación; en iOS 26+ existe el Liquid Glass real con `GlassView` de `expo-glass-effect` (no usado todavía).

## Patrones

- **Pantalla:** `LinearGradient` de fondo + círculos + `SafeAreaView` (de `react-native-safe-area-context`) + contenido con `paddingHorizontal: Spacing.four`. Ver `src/app/index.tsx`.
- **Items de lista:** `GlassCard` dentro de `Animated.View` con `entering={FadeInDown.delay(index * 100).springify()}`. Ver `ExpenseItem.tsx`.
- **Botones principales:** `LinearGradient` primary → secondary con `start={{x:0,y:0}} end={{x:1,y:1}}`. Ver el FAB en `index.tsx`.
- **Modal bottom sheet:** copiar la estructura de `AddExpenseModal.tsx` (backdrop con blur, `SlideInDown`, handle, `ScrollView`).
- **Inputs:** fondo `rgba(255,255,255,0.5)`, `borderWidth: 1`, `glassBorder`, `borderRadius: Spacing.two`.

## Teclado (importante)

Todo modal o pantalla con inputs usa `KeyboardAvoidingView` (`'padding'` en iOS, `'height'` en Android) y un `ScrollView` con `keyboardShouldPersistTaps="handled"`, para que el teclado no tape los campos y los botones sigan funcionando.

## Tipografía

- Título de pantalla: 28, bold, `glassText`.
- Números grandes: 42, bold, `letterSpacing: -1`, `glassTextLight`.
- Texto secundario: `glassTextSecondary`.

## Checklist

- [ ] Fondo con gradiente y círculos de color
- [ ] Cards con `GlassCard`
- [ ] Gradientes translúcidos sobre cards, paneles con poca opacidad
- [ ] Colores y espaciado desde `theme.ts`, sin valores sueltos
- [ ] Inputs: `ScrollView` + `KeyboardAvoidingView`
- [ ] Fecha y categoría obligatorias con validación visible
- [ ] Monto numérico válido con hasta dos decimales
- [ ] Descripción opcional, limitada a 400 caracteres permitidos
- [ ] Comprobante opcional desde galería o cámara, con permisos y errores explícitos
- [ ] Edición y eliminación confirmada con persistencia en SQLite
- [ ] Orden descendente por monto con desempate por fecha
