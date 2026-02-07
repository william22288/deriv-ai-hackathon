import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.SQLITE_DB_PATH || path.join(dataDir, 'hr_platform.db');

// Initialize SQLite database
export const db: DatabaseType = new Database(dbPath, { 
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined 
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Configure journal mode for better performance
db.pragma('journal_mode = WAL');

export async function testConnection(): Promise<boolean> {
  try {
    const result = db.prepare('SELECT 1 as test').get();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export async function initializeDatabase(): Promise<void> {
  console.log('SQLite database initialized at:', dbPath);
}

// Helper function to run queries (for compatibility with pg-promise style)
export function query(sql: string, params: any[] = []) {
  return db.prepare(sql).all(...params);
}

export function one(sql: string, params: any[] = []) {
  return db.prepare(sql).get(...params);
}

export function none(sql: string, params: any[] = []) {
  return db.prepare(sql).run(...params);
}

export default db;
