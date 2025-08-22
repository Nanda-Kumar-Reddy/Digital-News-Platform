import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../');

const dbPath = process.env.DATABASE_PATH || path.join(root, 'database/app.db');
const dbDir = path.dirname(dbPath);


if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath, { fileMustExist: false });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function getDb() {
  return db;
}

export function runSchemaIfNeeded() {
  const schemaFile = path.join(root, 'database/schema.sql');
  const seedsFile = path.join(root, 'database/seeds.sql');

  const hasUsersTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    .get();

  if (!hasUsersTable) {
    if (!fs.existsSync(schemaFile)) {
      console.error('Missing database/schema.sql');
      process.exit(1);
    }
    db.exec(fs.readFileSync(schemaFile, 'utf8'));
    if (fs.existsSync(seedsFile)) {
      db.exec(fs.readFileSync(seedsFile, 'utf8'));
    }
    console.log('Database initialized with schema and seeds.');
  }
}
