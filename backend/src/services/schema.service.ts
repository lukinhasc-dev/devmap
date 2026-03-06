import type { Database } from "../models/Database.model";
import db from "../database/connection";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Column = {
    name: string;
    type: string;
    nullable: boolean;
    isPrimary: boolean;
    isForeign: boolean;
    defaultValue: string | null;
};

export type TableStructure = {
    table: string;
    columns: Column[];
    jsonExample: Record<string, any>;
};

export type ParsedSchema = {
    tables: TableStructure[];
    rawSql: string;
    errors: string[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Gera um valor de exemplo baseado no tipo SQL da coluna.
 */
function inferExampleValue(sqlType: string): any {
    const t = sqlType.toLowerCase();

    if (t.includes("int") || t.includes("serial") || t.includes("numeric") || t.includes("decimal") || t.includes("float") || t.includes("real") || t.includes("double")) {
        return 1;
    }
    if (t.includes("bool")) {
        return true;
    }
    if (t.includes("date") && t.includes("time")) {
        return "2024-01-01T00:00:00Z";
    }
    if (t.includes("date")) {
        return "2024-01-01";
    }
    if (t.includes("time")) {
        return "12:00:00";
    }
    if (t.includes("json") || t.includes("jsonb")) {
        return {};
    }
    if (t.includes("uuid")) {
        return "550e8400-e29b-41d4-a716-446655440000";
    }
    if (t.includes("text") || t.includes("char") || t.includes("varchar") || t.includes("clob")) {
        return "string";
    }
    return "string";
}

/**
 * Verifica se uma linha de definição SQL é uma constraint (não uma coluna).
 */
function isConstraintLine(line: string): boolean {
    const upper = line.trimStart().toUpperCase();
    return (
        upper.startsWith("PRIMARY KEY") ||
        upper.startsWith("FOREIGN KEY") ||
        upper.startsWith("UNIQUE") ||
        upper.startsWith("CHECK") ||
        upper.startsWith("CONSTRAINT") ||
        upper.startsWith("INDEX") ||
        upper.startsWith("KEY ")
    );
}

/**
 * Parseia as colunas de um bloco CREATE TABLE.
 */
function parseColumns(tableBody: string): Column[] {
    const lines = tableBody.split(/,(?![^(]*\))/); // split por vírgula fora de parênteses

    const columns: Column[] = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || isConstraintLine(line)) continue;

        // Remove backticks, aspas e colchetes
        const cleaned = line.replace(/[`"[\]]/g, "");
        const tokens = cleaned.split(/\s+/);

        if (tokens.length < 2) continue;

        const name = tokens[0] ?? "";
        const rawType = tokens[1] ?? "";

        if (!name || !rawType) continue;

        const type = rawType.replace(/\(.*\)/, ""); // remove o tamanho ex: VARCHAR(255) → VARCHAR

        const upperLine = cleaned.toUpperCase();
        const isPrimary = upperLine.includes("PRIMARY KEY");
        const isForeign = upperLine.includes("REFERENCES");
        const nullable = !upperLine.includes("NOT NULL");
        const defaultMatch = cleaned.match(/DEFAULT\s+(\S+)/i);
        const defaultValue = defaultMatch && defaultMatch[1] ? defaultMatch[1] : null;

        columns.push({ name, type, nullable, isPrimary, isForeign, defaultValue });
    }

    return columns;
}

// ─── SchemaService ────────────────────────────────────────────────────────────

export class SchemaService {

    /**
     * Parseia uma string SQL e retorna a estrutura completa com tabelas,
     * colunas tipadas e exemplos de JSON para cada tabela.
     */
    parseSchema(sql: string): ParsedSchema {
        const errors: string[] = [];
        const tables: TableStructure[] = [];

        if (!sql || !sql.trim()) {
            return { tables, rawSql: sql, errors: ["Schema vazio."] };
        }

        // Regex para capturar cada bloco CREATE TABLE ... (...)
        const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"[\]]?(\w+)[`"[\]]?\s*\(([^;]*)\)/gis;

        let match: RegExpExecArray | null;

        while ((match = tableRegex.exec(sql)) !== null) {
            const tableName = match[1] ?? "unknown_table";
            const tableBody = match[2] ?? "";

            try {
                const columns = parseColumns(tableBody);

                // JSON example: exclui id, created_at, updated_at dos campos sugeridos
                const jsonExample: Record<string, any> = {};
                for (const col of columns) {
                    if (col.isPrimary || ["created_at", "updated_at"].includes(col.name.toLowerCase())) {
                        continue;
                    }
                    jsonExample[col.name] = inferExampleValue(col.type);
                }

                tables.push({ table: tableName, columns, jsonExample });
            } catch (err) {
                errors.push(`Erro ao parsear tabela "${tableName}": ${err instanceof Error ? err.message : String(err)}`);
            }
        }

        if (tables.length === 0 && errors.length === 0) {
            errors.push("Nenhuma instrução CREATE TABLE encontrada no schema.");
        }

        return { tables, rawSql: sql, errors };
    }

    // ── DB operations ─────────────────────────────────────────────────────────

    /** Retorna o schema de um database pelo ID, já parseado. */
    getSchemaByDatabaseId(databaseId: number): ParsedSchema | null {
        const row = db
            .prepare("SELECT schema FROM databases WHERE id = ?")
            .get(databaseId) as Pick<Database, "schema"> | undefined;

        if (!row) return null;

        return this.parseSchema(row.schema);
    }
}

export default new SchemaService();