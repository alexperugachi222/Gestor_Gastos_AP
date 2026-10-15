import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { ExpenseProvider } from '@/context/ExpenseContext';
import {DATABASE_NAME,initDatabase} from '@/database/database';
// El provider va aqui arriba para que todas las pantallas compartan los gastos
export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
      <ExpenseProvider>
        <Stack screenOptions={{headerShown:false}}>
          <Stack.Screen name="index" />
        </Stack>
      </ExpenseProvider>
    </SQLiteProvider>
  );
}
