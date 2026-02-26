import Database from "better-sqlite3";
import type BetterSqlite3 from "better-sqlite3";
import path from "path";

// Caminho do banco (por enquanto simples)
const dbPath = path.resolve(__dirname, "../../../devmap.db");

const db: BetterSqlite3.Database = new Database(dbPath);

// Ativar foreign keys (boa prática)
db.pragma("foreign_keys = ON");

console.log("📦 SQLite conectado com sucesso.");

export default db;