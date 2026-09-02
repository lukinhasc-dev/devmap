import db from "./connection";

export function runMigrations() {
    db.pragma("foreign_keys = ON");

    projects();
    endpointGroups();
    endpoints();
    migrateEndpointsColumns();
    databases();
    github();
    tasks();
    taskStatuses();
    taskLabels();
    migrateTasksColumns();
}

function columnExists(table: string, column: string): boolean {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    return cols.some((c) => c.name === column);
}

function addColumnIfNotExists(table: string, column: string, definition: string) {
    if (!columnExists(table, column)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
        console.log(`➕ Coluna "${column}" adicionada em "${table}"`);
    }
}

export function endpointGroups() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS endpoint_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,

            nome TEXT NOT NULL,
            descricao TEXT,
            base_url TEXT,
            ordem INTEGER DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE
        );
    `);

    console.log("🚀 Tabela endpoint_groups criada com sucesso!");
}

export function endpoints() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS endpoints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            rota TEXT NOT NULL,
            metodo TEXT NOT NULL,
            controller_nome TEXT,

            headers TEXT,
            body TEXT,
            query_params TEXT,

            auth_type TEXT,
            auth_config TEXT,

            project_id INTEGER NOT NULL,
            group_id INTEGER,

            ordem INTEGER DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE,

            FOREIGN KEY (group_id)
                REFERENCES endpoint_groups(id)
                ON DELETE SET NULL
        );
    `);

    console.log("🚀 Tabela endpoints criada com sucesso!");
}

export function migrateEndpointsColumns() {
    addColumnIfNotExists("endpoints", "headers", "TEXT");
    addColumnIfNotExists("endpoints", "body", "TEXT");
    addColumnIfNotExists("endpoints", "query_params", "TEXT");
    addColumnIfNotExists("endpoints", "auth_type", "TEXT");
    addColumnIfNotExists("endpoints", "auth_config", "TEXT");
    addColumnIfNotExists("endpoints", "group_id", "INTEGER");
    addColumnIfNotExists("endpoints", "ordem", "INTEGER DEFAULT 0");
}

export function projects() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            status TEXT NOT NULL,
            data_inicio DATETIME NOT NULL,
            data_entrega DATETIME,
            responsavel TEXT NOT NULL,
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
            schema TEXT NOT NULL,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE
        );
    `);

    console.log("🚀 Tabela databases criada!");
}

export function github() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS github (
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

export function taskStatuses() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS task_statuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,

            chave TEXT NOT NULL,
            nome TEXT NOT NULL,
            cor TEXT,
            ordem INTEGER DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE
        );
    `);

    console.log("🚀 Tabela task_statuses criada!");
}

export function taskLabels() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS task_labels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,

            nome TEXT NOT NULL,
            cor TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE
        );
    `);

    console.log("🚀 Tabela task_labels criada!");
}

export function migrateTasksColumns() {
    addColumnIfNotExists("tasks", "labels", "TEXT");
    addColumnIfNotExists("tasks", "priority", "TEXT");
}