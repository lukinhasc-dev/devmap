// ─── EndpointCard.tsx ─────────────────────────────────────────────────────────

import type { Endpoint } from "../models/Endpoint.model";
import "../styles/Cards.css";
import "../styles/Endpoints.css";

type Props = {
    endpoint: Endpoint;
    onEdit: (ep: Endpoint) => void;
    onDelete: (id: number) => void;
    onTest: (ep: Endpoint) => void;
};

function IconEdit() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function IconDelete() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}

function IconPlay() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    );
}

const methodClass: Record<string, string> = {
    GET: "ep-method--GET",
    POST: "ep-method--POST",
    PUT: "ep-method--PUT",
    PATCH: "ep-method--PATCH",
    DELETE: "ep-method--DELETE",
};

export default function EndpointCard({ endpoint, onEdit, onDelete, onTest }: Props) {
    const method = endpoint.metodo.toUpperCase();

    return (
        <div className="card">
            {/* ── Header ── */}
            <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                    <span className={`ep-method ${methodClass[method] ?? ""}`}>{method}</span>
                    <span className="ep-route">{endpoint.rota}</span>
                </div>

                <div className="card-actions">
                    <button className="card-icon-btn card-icon-btn--enter" title="Testar endpoint" onClick={() => onTest(endpoint)}>
                        <IconPlay />
                    </button>
                    <button className="card-icon-btn card-icon-btn--edit" title="Editar" onClick={() => onEdit(endpoint)}>
                        <IconEdit />
                    </button>
                    <button className="card-icon-btn card-icon-btn--delete" title="Excluir" onClick={() => onDelete(endpoint.id)}>
                        <IconDelete />
                    </button>
                </div>
            </div>

            {/* ── Nome e Descrição ── */}
            <p className="card-title">{endpoint.nome}</p>
            {endpoint.descricao && (
                <p className="card-description">{endpoint.descricao}</p>
            )}

            {/* ── Controller ── */}
            {endpoint.controller_nome && (
                <span className="ep-controller">{endpoint.controller_nome}()</span>
            )}
        </div>
    );
}
