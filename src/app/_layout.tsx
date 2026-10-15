import { Stack } from 'expo-router';

import { ExpenseProvider } from '@/context/ExpenseContext';

// El provider va aqui arriba para que todas las pantallas compartan los gastos
export default function RootLayout() {
  return (
    <ExpenseProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ExpenseProvider>
  );
}
