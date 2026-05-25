import * as SQLite from 'expo-sqlite';
import { SQL_CREATE_TABLES, SQL_CREATE_INDEXES } from './schema';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (database) return database;

    database = await SQLite.openDatabaseAsync('orcafacil.db');

    await database.execAsync('PRAGMA foreign_keys = ON;');
    await database.execAsync('PRAGMA journal_mode = WAL;');

    await database.execAsync(SQL_CREATE_TABLES);
    await database.execAsync(SQL_CREATE_INDEXES);

    return database;
}

export async function closeDatabase(): Promise<void> {
    if (database) {
        await database.closeAsync();
        database = null;
    }
}