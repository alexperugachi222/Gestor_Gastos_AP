import { SQLiteDatabase } from "expo-sqlite";
import { Category, Expense } from '@/types/expense';

//forma en que una filla llega desde SQLite.
// No es igual a Expense: la fecha viene com otexto y la descipcion como null.

interface ExpenseRow {
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string | null;

}

//convierte una fila de la tabla en un objeto Expense que entiende la app

function rowToExpense(row: ExpenseRow): Expense {
    return {
        id: row.id,
        amount: row.amount,
        category: row.category as Category,
        date: new Date(row.date),
        description: row.description ?? undefined
    };
}

export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {

    const rows = await db.getAllAsync<ExpenseRow>(
        'SELECT id, amount,category,date, description FROM expenses ORDER BY date DESC'
    );
    return rows.map(rowToExpense);
}

export async function insertExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
    // Los signos ? son parametros: SQLite coloca los valores de forma segura.
    // Nunca se arma el SQL concatenando texto, eso abre la puerta a inyeccion SQL.
    await db.runAsync(
        'INSERT INTO expenses (id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
        expense.id,
        expense.amount,
        expense.category,
        expense.date.toISOString(),
        expense.description ?? null
    );

}