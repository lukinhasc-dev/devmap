import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ModalDefault from "../../components/ModalDefault";
import DatabaseForm, { type DatabaseFormData } from "../../components/DatabaseForm";
import {
    getDatabasesByProject,
    createDatabase,
    updateDatabase,
    deleteDatabase,
} from "../../services/database.service";
import SchemaService from "../../services/schema.service";
import type { Database } from "../../models/Database.model";
import "../../styles/Endpoints.css"; // reaproveitando estilos do tester e sub-header

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function IconPlus() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function IconDatabase() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    );
}

// ─── Tipos do Parser ──────────────────────────────────────────────────────────

type Column = {
    name: string;
    type: string;
    nullable: boolean;
    isPrimary: boolean;
    isForeign: boolean;
    defaultValue: string | null;
};

type TableStructure = {
    table: string;
    columns: Column[];
    jsonExample: Record<string, any>;
};

type ParsedSchema = {
    tables: TableStructure[];
    rawSql: string;
    errors: string[];
};

// ─── Component ────────────────────────────────────────────────────────────────

const schemaService = new SchemaService();

export default function ProjectDatabases() {
    const { id: projectIdStr } = useParams();
    const projectId = Number(projectIdStr);

    const [databases, setDatabases] = useState<Database[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<DatabaseFormData>({
        nome: "",
        tipo_bd: "postgres",
        schema: "",
    });
    const [formError, setFormError] = useState("");

    const [selectedDb, setSelectedDb] = useState<Database | null>(null);
    const [parsedSchema, setParsedSchema] = useState<ParsedSchema | null>(null);
    const [schemaLoading, setSchemaLoading] = useState(false);

    // ─── Efeitos ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!projectId) return;
        fetchDatabases();
    }, [projectId]);

    useEffect(() => {
        if (selectedDb) {
            fetchSchema(selectedDb.id);
        } else {
            setParsedSchema(null);
        }
    }, [selectedDb]);

    // ─── Funções API ──────────────────────────────────────────────────────────

    async function fetchDatabases() {
        setLoading(true);
        try {
            const data = await getDatabasesByProject(projectId);
            setDatabases(data);
            if (data.length > 0 && !selectedDb) {
                setSelectedDb(data[0]); // Seleciona o primeiro por padrão
            } else if (data.length === 0) {
                setSelectedDb(null);
            } else if (selectedDb) {
                // Atualiza a listagem mantendo a seleção se existir
                const stillExists = data.find((d: Database) => d.id === selectedDb.id);
                if (stillExists) setSelectedDb(stillExists);
                else setSelectedDb(data[0]);
            }
        } catch (error) {
            console.error("Erro ao buscar bancos", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchSchema(dbId: number) {
        setSchemaLoading(true);
        try {
            const data = await schemaService.getSchemaByDatabaseId(dbId);
            setParsedSchema(data);
        } catch (error) {
            console.error("Erro ao carregar schema", error);
        } finally {
            setSchemaLoading(false);
        }
    }

    // ─── Handlers CRUD ────────────────────────────────────────────────────────

    function handleAdd() {
        setEditingId(null);
        setForm({ nome: "", tipo_bd: "postgres", schema: "" });
        setFormError("");
        setModalOpen(true);
    }

    function handleEdit(dbItem: Database) {
        setEditingId(dbItem.id);
        setForm({
            nome: dbItem.nome,
            tipo_bd: dbItem.tipo_bd,
            schema: dbItem.schema,
        });
        setFormError("");
        setModalOpen(true);
    }

    async function handleDelete(id: number) {
        if (!confirm("Tem certeza que deseja deletar este banco de dados?")) return;
        try {
            await deleteDatabase(id);
            fetchDatabases();
        } catch (error) {
            alert("Erro ao deletar");
        }
    }

    async function handleSave() {
        if (!form.nome.trim() || !form.schema.trim()) {
            setFormError("Nome e Schema SQL são obrigatórios.");
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await updateDatabase(editingId, { ...form, project_id: projectId } as Database);
            } else {
                await createDatabase({ ...form, project_id: projectId } as Database);
            }
            setModalOpen(false);
            await fetchDatabases();
        } catch (error: any) {
            setFormError(error.response?.data?.message || "Erro ao salvar banco de dados.");
        } finally {
            setSaving(false);
        }
    }

    // ─── Renderização Gráfica ─────────────────────────────────────────────────

    return (
        <div className="project-subpage">
            {/* ── Cabeçalho Principal ── */}
            <div className="ep-subpage-header">
                <div>
                    <h2 className="project-subpage__heading" style={{ margin: 0 }}>Databases</h2>
                    <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                        Gerencie a estrutura do banco de dados deste projeto.
                    </p>
                </div>
                <button className="ep-subpage-add-btn" onClick={handleAdd}>
                    <IconPlus />
                    Nova Conexão
                </button>
            </div>

            {loading ? (
                <p className="project-subpage__empty-desc">Carregando bancos...</p>
            ) : databases.length === 0 ? (
                <div className="project-subpage__empty">
                    <IconDatabase />
                    <p className="project-subpage__empty-title">Nenhum banco de dados configurado</p>
                    <p className="project-subpage__empty-desc">
                        Adicione um novo banco para monitorar schemas, tabelas e criar payloads JSON.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem", alignItems: "flex-start" }}>

                    {/* ── Lista Lateral de Bancos ── */}
                    <div style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {databases.map(d => (
                            <div
                                key={d.id}
                                onClick={() => setSelectedDb(d)}
                                style={{
                                    padding: "0.8rem",
                                    background: selectedDb?.id === d.id ? "var(--color-elevated)" : "var(--color-surface)",
                                    border: `1px solid ${selectedDb?.id === d.id ? "var(--color-primary)" : "var(--color-border)"}`,
                                    borderRadius: "var(--radius)",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.4rem",
                                    transition: "var(--transition)"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text)" }}>
                                        {d.nome}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                                        style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", padding: "2px" }}
                                        title="Deletar"
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span className={`ep-method ep-method--GET`}>{d.tipo_bd.toUpperCase()}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(d); }}
                                        style={{ fontSize: "0.75rem", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer" }}
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── View do Schema Selecionado ── */}
                    <div className="ep-tester" style={{ flex: 1, marginTop: 0 }}>
                        <div className="ep-tester__header">
                            <span className="ep-tester__title">
                                <IconDatabase />
                                Schema: {selectedDb?.nome}
                            </span>
                            <span className="ep-tester__hint">
                                Estrutura parseada a partir do SQL fornecido.
                            </span>
                        </div>

                        <div className="ep-tester__body">
                            {schemaLoading ? (
                                <div className="ep-tester__empty">Interpretando SQL do Schema...</div>
                            ) : parsedSchema ? (
                                <>
                                    {parsedSchema.errors?.length > 0 && (
                                        <div className="ep-tester__html-notice" style={{ marginBottom: "1rem", flexWrap: "wrap" }}>
                                            <span>⚠️</span>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <strong>Avisos de Parse:</strong>
                                                {parsedSchema.errors.map((e, i) => <span key={i}>{e}</span>)}
                                            </div>
                                        </div>
                                    )}

                                    {parsedSchema.tables?.length === 0 ? (
                                        <div className="ep-tester__empty">
                                            Nenhuma tabela extraída. Verifique o seu código SQL (ele usa CREATE TABLE?).
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                            {parsedSchema.tables.map(t => (
                                                <div key={t.table} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--color-surface)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                                                    {/* Header Tabela */}
                                                    <div style={{ background: "var(--color-elevated)", padding: "1rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                                            <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.5px" }}>
                                                                {t.table}
                                                            </span>
                                                        </div>
                                                        <span className="ep-tester__content-type" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{t.columns.length} colunas</span>
                                                    </div>

                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0" }}>
                                                        {/* Coluna Esquerda: Definição */}
                                                        <div style={{ flex: "1 1 55%", minWidth: "350px", background: "var(--color-surface)", padding: "1.5rem" }}>
                                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                                {/* Cabecalho de Colunas */}
                                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-muted)", fontWeight: "bold", paddingBottom: "0.8rem", borderBottom: "1px solid var(--color-border)" }}>
                                                                    <span style={{ minWidth: "180px" }}>Nome</span>
                                                                    <span style={{ minWidth: "120px" }}>Tipo</span>
                                                                    <span>Atributos</span>
                                                                </div>

                                                                {/* Lista de Colunas */}
                                                                {t.columns.map((c, idx) => (
                                                                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.85rem", fontFamily: "monospace", padding: "0.8rem 0", borderBottom: idx < t.columns.length - 1 ? "1px dashed var(--color-border)" : "none" }}>
                                                                        <strong style={{ color: "var(--color-primary)", minWidth: "180px", fontSize: "0.95rem" }}>{c.name}</strong>
                                                                        <span style={{ color: "var(--color-text)", minWidth: "120px" }}>{c.type}</span>
                                                                        <div style={{ display: "flex", gap: "0.4rem", flex: 1, flexWrap: "wrap" }}>
                                                                            {c.isPrimary && <span className="ep-tester__content-type" style={{ borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.05)" }}>PK</span>}
                                                                            {c.isForeign && <span className="ep-tester__content-type" style={{ borderColor: "rgba(59,130,246,0.3)", color: "#3b82f6", backgroundColor: "rgba(59,130,246,0.05)" }}>FK</span>}
                                                                            {!c.nullable && <span className="ep-tester__content-type" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444", backgroundColor: "rgba(239,68,68,0.05)" }}>NOT NULL</span>}
                                                                            {c.defaultValue && <span className="ep-tester__content-type" style={{ borderColor: "rgba(16,185,129,0.3)", color: "#10b981", backgroundColor: "rgba(16,185,129,0.05)", textTransform: "none" }}>Default: {c.defaultValue}</span>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Coluna Direita: JSON Example */}
                                                        <div style={{ flex: "1 1 40%", minWidth: "300px", background: "var(--color-bg)", padding: "1.5rem", borderLeft: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
                                                            <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                                                Payload JSON Sugerido
                                                            </span>
                                                            <div className="ep-tester__json-block" style={{ flex: 1, maxHeight: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "1.2rem", background: "var(--color-surface)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                                                                <pre style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.6", color: "var(--color-text)" }}>{JSON.stringify(t.jsonExample, null, 2)}</pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal CRUD ── */}
            <ModalDefault
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSave}
                title={editingId !== null ? "Editar Banco de Dados" : "Adicionar Banco de Dados"}
                description="Conecte seu schema SQL para gerar interfaces JSON instantâneas."
                submitLabel={editingId !== null ? "Salvar Alterações" : "Salvar Conexão"}
                isLoading={saving}
            >
                <DatabaseForm
                    form={form}
                    error={formError}
                    onChange={(field, value) => {
                        setForm((p) => ({ ...p, [field]: value }));
                        setFormError("");
                    }}
                />
            </ModalDefault>
        </div>
    );
}
