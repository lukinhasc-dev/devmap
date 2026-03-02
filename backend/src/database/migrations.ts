import db from "./connection";

export function runMigrations() {
    db.pragma("foreign_keys = ON");

    projects();
    endpoints();
    databases();
    github();
    tasks();
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

export function databases() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS databases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,

            nome TEXT NOT NULL,
            tipo_bd TEXT NOT NULL, -- mysql, postgres, sqlite, mongo
            host TEXT,
            porta TEXT,
            query_bd TEXT, -- Query do banco de dados para facilitar entendimento
            usuario TEXT,
            senha TEXT,
            observacoes TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE
        );
    `);

    console.log("🚀 Tabela databases criada!");
}

export function github() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS github_repos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,

            nome_repositorio TEXT NOT NULL,
            link_repositorio TEXT NOT NULL,
            stack TEXT,
            observacoes TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE
        );
    `);

    console.log("🚀 Tabela github criada!");
}


export function tasks() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,

            titulo TEXT NOT NULL,
            descricao TEXT,
            status TEXT NOT NULL, -- pendente, em andamento, concluida

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE
        );
    `);

    console.log("🚀 Tabela tasks criada!");
}