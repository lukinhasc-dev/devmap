import db from "./connection";

export function runMigrations() {
    endpoints();
}

export function endpoints() { //Tabela de Endpoints
    db.exec(`
        CREATE TABLE IF NOT EXISTS endpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    rota TEXT NOT NULL,
    metodo TEXT NOT NULL, -- Ex: GET, POST, PUT, DELETE
    controller_nome TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
    `);

    console.log("🚀 Endpoints criadas com sucesso!");
}


