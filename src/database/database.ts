import {SQLiteDatabase} from 'expo-sqlite';

export const DATABASE_NAME = 'gastos.db';

export async function initDatabase(db: SQLiteDatabase): Promise<void>{

// execAsync permite ejecutar varias sentencias SQL seguidas.
//WAL

await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS expenses (
    id          TEXT PRIMARY KEY NOT NULL , -- el mismo id string que ya usaba la app
    amount      REAL NOT NULL,              -- REAL = numero con decimales
    category    TEXT NOT NULL,              
    date        TEXT NOT NULL,              -- fecha en formato ISO 8601
    description TEXT,                       -- puede ser NULL porque es opcional
    receipt_uri TEXT                        -- referencia local opcional al comprobante
    );
    `);

    const columns = await db.getAllAsync<{ name: string }>(
        'PRAGMA table_info(expenses)'
    );
    if (!columns.some((column) => column.name === 'receipt_uri')) {
        await db.execAsync('ALTER TABLE expenses ADD COLUMN receipt_uri TEXT');
    }
}