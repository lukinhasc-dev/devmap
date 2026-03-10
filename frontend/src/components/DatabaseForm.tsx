import { useRef } from "react";
import type { Database } from "../models/Database.model";
import JsonTextarea from "./JsonTextarea";

export type DatabaseFormData = Omit<Database, "id" | "project_id" | "created_at" | "updated_at">;

type Props = {
    form: DatabaseFormData;
    onChange: (field: keyof DatabaseFormData, value: string) => void;
    error?: string;
};

export default function DatabaseForm({ form, onChange, error }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                // Limpa os dados do DUMP de SQL, removendo Inserções de Dados e mantendo só a Estrutura.
                // Isso evita que um dump de 100MB trave o react e também reduz o tamanho do payload.
                const cleaned = content
                    .replace(/--.*$/gm, '') // Remove comentários de linha única (--)
                    .replace(/\/\*[\s\S]*?\*\//g, '') /* Remove comentários block /* */
                    .replace(/INSERT\s+INTO\s+[^;]+;/gi, '') // Remove inserts de dados
                    .replace(/COPY\s+[^;]+;[\s\S]*?\\\./gi, '') // Remove backups de COPY FROM stdin (pg_dump)
                    .replace(/\n\s*\n/g, '\n\n') // Remove linhas vazias em excesso
                    .trim();

                // Caso ainda seja absurdamente grande, limita os caracteres. 
                const safeSchema = cleaned.substring(0, 300000); // Suficiente para gerar milhares de tabelas

                onChange("schema", safeSchema);
            }
            // Limpa o input para poder selecionar o mesmo arquivo novamente
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsText(file);
    };

    return (
        <div className="ep-form">
            {error && <div className="ep-form__error">{error}</div>}

            <div className="ep-form__row ep-form__row--split">
                <label className="ep-form__label">
                    Nome da Conexão / Banco
                    <input
                        className="ep-form__input"
                        placeholder="Ex: Main PostgreSQL"
                        value={form.nome}
                        onChange={(e) => onChange("nome", e.target.value)}
                        autoFocus
                    />
                </label>

                <label className="ep-form__label" style={{ flex: 0.5 }}>
                    Tipo (Dialeto)
                    <select
                        className="ep-form__input ep-form__select"
                        value={form.tipo_bd}
                        onChange={(e) => onChange("tipo_bd", e.target.value)}
                    >
                        <option value="postgres">PostgreSQL</option>
                        <option value="mysql">MySQL / MariaDB</option>
                        <option value="sqlite">SQLite</option>
                        <option value="sqlserver">SQL Server</option>
                        <option value="oracle">Oracle</option>
                        <option value="outro">Outro</option>
                    </select>
                </label>
            </div>

            <label className="ep-form__label">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Schema SQL (Queries de CREATE TABLE)</span>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            background: "rgba(157, 78, 221, 0.1)",
                            color: "var(--color-primary)",
                            border: "1px solid rgba(157, 78, 221, 0.3)",
                            borderRadius: "var(--radius)",
                            fontSize: "0.75rem",
                            padding: "0.2rem 0.6rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem"
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Importar .sql
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept=".sql,.txt,.db"
                        onChange={handleFileChange}
                    />
                </div>
                <span className="ep-tester__hint" style={{ fontWeight: "normal" }}>
                    Cole aqui, ou importe um arquivo de script para gerar a visualização e os payloads automaticamente.
                </span>
                <JsonTextarea
                    className="ep-form__input ep-form__textarea ep-form__mono"
                    placeholder={"CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL\n);"}
                    value={form.schema}
                    onChange={(v) => onChange("schema", v)}
                    rows={12}
                />
            </label>
        </div>
    );
}
