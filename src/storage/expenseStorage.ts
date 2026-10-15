import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '@/types/expense';
 
// Clave con la que se guarda la lista en AsyncStorage.
// AsyncStorage funciona como un diccionario clave -> texto, asi que
// toda la lista de gastos queda guardada como UN solo texto bajo esta clave.
const STORAGE_KEY = '@gestor_gastos/expenses';
 
// Lee todos los gastos guardados en el telefono.
// Si es la primera vez que se abre la app no hay nada guardado y devuelve [].
export async function loadExpenses(): Promise<Expense[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
 
  // getItem devuelve null cuando la clave no existe todavia
  if (json === null) {
    return [];
  }
 
  // JSON.parse devuelve las fechas como string (ej: "2026-10-15T16:20:00.000Z"),
  // por eso se vuelven a convertir a Date para respetar el tipo Expense.
  const data: Expense[] = JSON.parse(json);
  return data.map((expense) => ({
    ...expense,
    date: new Date(expense.date),
  }));
}
 
// Guarda la lista COMPLETA de gastos.
// AsyncStorage no sabe "agregar un elemento": cada vez se reescribe todo el arreglo.
export async function saveExpenses(expenses: Expense[]): Promise<void> {
  // JSON.stringify convierte cada Date a texto ISO automaticamente
  const json = JSON.stringify(expenses);
  await AsyncStorage.setItem(STORAGE_KEY, json);
}
