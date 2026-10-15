import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Expense } from '@/types/expense';
import { loadExpenses, saveExpenses } from '@/storage/expenseStorage';
 
interface ExpenseContextType {
  expenses: Expense[];
  // true mientras se leen los gastos guardados al abrir la app
  isLoading: boolean;
  // Ahora devuelve una Promise porque guardar en el telefono es asincrono
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  getMonthlyTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
}
 
// Arranca en undefined para poder avisar si alguien usa el hook sin Provider
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
 
// Fase 2: los gastos se guardan en el telefono con AsyncStorage,
// asi que siguen ahi despues de cerrar y volver a abrir la app.
export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 
  // Se ejecuta una sola vez, cuando el Provider se monta (al abrir la app)
  useEffect(() => {
    const cargarGastos = async () => {
      try {
        const guardados = await loadExpenses();
        setExpenses(guardados);
      } catch (error) {
        // Si el JSON esta corrupto o falla la lectura, la app arranca vacia
        console.error('No se pudieron cargar los gastos', error);
      } finally {
        // Haya funcionado o no, ya terminamos de cargar
        setIsLoading(false);
      }
    };
 
    cargarGastos();
  }, []);
 
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    // Timestamp + algo aleatorio para que dos gastos seguidos no repitan id
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    };
 
    // Va al principio para que el ultimo gasto salga arriba
    const updated = [newExpense, ...expenses];
 
    // Primero se guarda y DESPUES se actualiza la pantalla.
    // Si saveExpenses falla, lanza el error y el estado no cambia,
    // asi la pantalla nunca muestra un gasto que no quedo guardado.
    await saveExpenses(updated);
    setExpenses(updated);
  };
 
  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
 
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });
  };
 
  const getMonthlyTotal = () => {
    return getCurrentMonthExpenses().reduce(
      (total, expense) => total + expense.amount,
      0
    );
  };
 
  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        addExpense,
        getMonthlyTotal,
        getCurrentMonthExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
 
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
