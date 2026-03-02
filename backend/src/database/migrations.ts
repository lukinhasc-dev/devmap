import db from "./connection";

db.pragma("foreign_keys = ON");

export function runMigrations() {
    projects();
    endpoints();
}

export function endpoints() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS endpoints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            rota TEXT NOT NULL,
            metodo TEXT NOT NULL, -- GET, POST, etc
            controller_nome TEXT,

            project_id INTEGER NOT NULL,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE
        );
    `);

    console.log("🚀 Tabela endpoints criada com sucesso!");
}

export function projects() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            status TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log("🚀 Tabela projects criada!");
}


