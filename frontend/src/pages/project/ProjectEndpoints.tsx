import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ModalDefault from "../../components/ModalDefault";
import EndpointCard from "../../components/EndpointCard";
import EndpointForm, { type EndpointFormData } from "../../components/EndpointForm";
import GroupForm, { type GroupFormData } from "../../components/GroupForm";
import EndpointTester, { type EndpointTesterHandle } from "../../components/EndpointTester";
import { EMPTY_AUTH, serializeAuth, deserializeAuth } from "../../components/AuthEditor";
import { parsePairs, stringifyPairs } from "../../components/KeyValueEditor";
import {
    getEndpointsByProject,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
} from "../../services/endpoint.service";
import {
    getGroupsByProject,
    createGroup,
    updateGroup,
    deleteGroup,
} from "../../services/endpointgroup.service";
import type { Endpoint } from "../../models/Endpoint.model";
import type { EndpointGroup } from "../../models/EndpointGroup.model";
import "../../styles/Endpoints.css";

const EMPTY_FORM: EndpointFormData = {
    nome: "",
    descricao: "",
    rota: "",
    metodo: "GET",
    controller_nome: "",
    group_id: "",
    headers: "",
    body: "",
    params: [],
    auth: EMPTY_AUTH,
};

const EMPTY_GROUP_FORM: GroupFormData = {
    nome: "",
    descricao: "",
    base_url: "",
};

function joinUrl(base: string | null | undefined, rota: string): string {
    if (!rota) return base ?? "";
    if (/^https?:\/\//i.test(rota)) return rota;
    if (!base) return rota;
    return `${base.replace(/\/+$/, "")}/${rota.replace(/^\/+/, "")}`;
}

function IconPlus() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function IconFolder() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function IconEdit() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function IconTrash() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}

export default function ProjectEndpoints() {
    const { id } = useParams<{ id: string }>();
    const projectId = Number(id);

    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [groups, setGroups] = useState<EndpointGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<EndpointFormData>(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [groupSaving, setGroupSaving] = useState(false);
    const [groupForm, setGroupForm] = useState<GroupFormData>(EMPTY_GROUP_FORM);
    const [groupFormError, setGroupFormError] = useState("");
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

    const testerRef = useRef<EndpointTesterHandle>(null);

    function fetchAll() {
        setLoading(true);
        Promise.all([
            getGroupsByProject(projectId),
            getEndpointsByProject(projectId),
        ])
            .then(([groupsData, endpointsData]) => {
                setGroups(groupsData);
                setEndpoints(endpointsData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }

    useEffect(() => { fetchAll(); }, [projectId]);

    const q = search.toLowerCase();
    const filtered = q
        ? endpoints.filter((ep) =>
            ep.nome.toLowerCase().includes(q) ||
            ep.rota.toLowerCase().includes(q) ||
            ep.metodo.toLowerCase().includes(q)
        )
        : endpoints;

    const ungrouped = filtered.filter((ep) => ep.group_id === null || ep.group_id === undefined);

    function endpointsOfGroup(groupId: number) {
        return filtered.filter((ep) => ep.group_id === groupId);
    }

    function handleAdd(groupId?: number) {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, group_id: groupId ? String(groupId) : "" });
        setFormError("");
        setModalOpen(true);
    }

    function handleEdit(ep: Endpoint) {
        setEditingId(ep.id);
        setForm({
            nome: ep.nome,
            descricao: ep.descricao ?? "",
            rota: ep.rota,
            metodo: ep.metodo,
            controller_nome: ep.controller_nome ?? "",
            group_id: ep.group_id ? String(ep.group_id) : "",
            headers: ep.headers ?? "",
            body: ep.body ?? "",
            params: parsePairs(ep.query_params),
            auth: deserializeAuth(ep.auth_type, ep.auth_config),
        });
        setFormError("");
        setModalOpen(true);
    }

    async function handleSave() {
        if (!form.nome.trim() || !form.rota.trim()) {
            setFormError("Nome e Rota são obrigatórios.");
            return;
        }
        setSaving(true);
        try {
            const { auth_type, auth_config } = serializeAuth(form.auth);
            const payload = {
                nome: form.nome,
                descricao: form.descricao,
                rota: form.rota,
                metodo: form.metodo,
                controller_nome: form.controller_nome,
                headers: form.headers.trim() || null,
                body: form.body.trim() || null,
                query_params: stringifyPairs(form.params),
                auth_type,
                auth_config,
                group_id: form.group_id ? Number(form.group_id) : null,
                project_id: projectId,
            } as unknown as Endpoint;

            if (editingId !== null) {
                await updateEndpoint(editingId, payload);
            } else {
                await createEndpoint(payload);
            }
            setModalOpen(false);
            fetchAll();
        } catch {
            setFormError("Erro ao salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(endpointId: number) {
        if (!window.confirm("Deseja realmente excluir este endpoint?")) return;
        try {
            await deleteEndpoint(endpointId);
            fetchAll();
        } catch (err) {
            console.error(err);
        }
    }

    function handleAddGroup() {
        setEditingGroupId(null);
        setGroupForm(EMPTY_GROUP_FORM);
        setGroupFormError("");
        setGroupModalOpen(true);
    }

    function handleEditGroup(group: EndpointGroup) {
        setEditingGroupId(group.id);
        setGroupForm({
            nome: group.nome,
            descricao: group.descricao ?? "",
            base_url: group.base_url ?? "",
        });
        setGroupFormError("");
        setGroupModalOpen(true);
    }

    async function handleSaveGroup() {
        if (!groupForm.nome.trim()) {
            setGroupFormError("O nome do grupo é obrigatório.");
            return;
        }
        setGroupSaving(true);
        try {
            const payload = {
                nome: groupForm.nome,
                descricao: groupForm.descricao || null,
                base_url: groupForm.base_url || null,
                project_id: projectId,
            } as Partial<EndpointGroup>;

            if (editingGroupId !== null) {
                await updateGroup(editingGroupId, payload);
            } else {
                await createGroup(payload);
            }
            setGroupModalOpen(false);
            fetchAll();
        } catch {
            setGroupFormError("Erro ao salvar o grupo. Tente novamente.");
        } finally {
            setGroupSaving(false);
        }
    }

    async function handleDeleteGroup(group: EndpointGroup) {
        const count = endpoints.filter((ep) => ep.group_id === group.id).length;
        const msg = count > 0
            ? `Excluir o grupo "${group.nome}"? Os ${count} endpoint(s) dentro dele ficarão sem grupo (não serão apagados).`
            : `Excluir o grupo "${group.nome}"?`;
        if (!window.confirm(msg)) return;
        try {
            await deleteGroup(group.id);
            fetchAll();
        } catch (err) {
            console.error(err);
        }
    }

    function handleTest(ep: Endpoint) {
        const group = groups.find((g) => g.id === ep.group_id);
        testerRef.current?.loadRequest({
            url: joinUrl(group?.base_url, ep.rota),
            method: ep.metodo,
            headers: ep.headers ?? "",
            body: ep.body ?? "",
            params: ep.query_params ?? "",
            auth: deserializeAuth(ep.auth_type, ep.auth_config),
        });
    }

    function renderEndpointGrid(list: Endpoint[]) {
        return (
            <div className="endpoints-grid">
                {list.map((ep) => (
                    <EndpointCard
                        key={ep.id}
                        endpoint={ep}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onTest={handleTest}
                    />
                ))}
            </div>
        );
    }

    const hasAnything = groups.length > 0 || endpoints.length > 0;

    return (
        <div className="project-subpage">
            <div className="ep-subpage-header">
                <h2 className="project-subpage__heading">Endpoints</h2>

                <div className="ep-subpage-toolbar">
                    <div className="ep-subpage-search">
                        <svg className="ep-subpage-search__icon" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="ep-subpage-search__input"
                            placeholder="Pesquisar endpoint..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button className="ep-subpage-add-btn ep-subpage-add-btn--secondary" onClick={handleAddGroup}>
                        <IconFolder />
                        Novo Grupo
                    </button>

                    <button className="ep-subpage-add-btn" onClick={() => handleAdd()}>
                        <IconPlus />
                        Novo Endpoint
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="project-subpage__empty-desc" style={{ padding: "1rem 0" }}>Carregando endpoints...</p>
            ) : !hasAnything ? (
                <div className="project-subpage__empty">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                    </svg>
                    <p className="project-subpage__empty-title">Nenhum endpoint cadastrado</p>
                    <p className="project-subpage__empty-desc">
                        Crie um grupo para organizar suas rotas ou adicione um endpoint direto.
                    </p>
                </div>
            ) : (
                <>
                    {groups.map((group) => {
                        const list = endpointsOfGroup(group.id);
                        return (
                            <section key={group.id} className="ep-group-section">
                                <div className="ep-group-header">
                                    <span className="ep-group-title">
                                        <IconFolder />
                                        {group.nome}
                                    </span>
                                    {group.base_url && (
                                        <span className="ep-group-base-url">{group.base_url}</span>
                                    )}
                                    <span className="ep-group-count">{list.length}</span>

                                    <div className="ep-group-actions">
                                        <button className="card-icon-btn card-icon-btn--enter" title="Adicionar endpoint neste grupo" onClick={() => handleAdd(group.id)}>
                                            <IconPlus />
                                        </button>
                                        <button className="card-icon-btn card-icon-btn--edit" title="Editar grupo" onClick={() => handleEditGroup(group)}>
                                            <IconEdit />
                                        </button>
                                        <button className="card-icon-btn card-icon-btn--delete" title="Excluir grupo" onClick={() => handleDeleteGroup(group)}>
                                            <IconTrash />
                                        </button>
                                    </div>
                                </div>

                                {group.descricao && <p className="ep-group-desc">{group.descricao}</p>}

                                {list.length === 0 ? (
                                    <div className="ep-group-empty">
                                        {search ? "Nenhum endpoint deste grupo bate com a busca." : "Nenhum endpoint neste grupo ainda."}
                                    </div>
                                ) : (
                                    renderEndpointGrid(list)
                                )}
                            </section>
                        );
                    })}

                    {ungrouped.length > 0 && (
                        <section className="ep-group-section">
                            <div className="ep-group-header">
                                <span className="ep-group-title">Sem grupo</span>
                                <span className="ep-group-count">{ungrouped.length}</span>
                            </div>
                            {renderEndpointGrid(ungrouped)}
                        </section>
                    )}
                </>
            )}

            <EndpointTester ref={testerRef} />

            <ModalDefault
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSave}
                title={editingId !== null ? "Editar Endpoint" : "Novo Endpoint"}
                description="Preencha os dados do endpoint."
                submitLabel={editingId !== null ? "Salvar Alterações" : "Criar Endpoint"}
                isLoading={saving}
            >
                <EndpointForm
                    form={form}
                    error={formError}
                    groups={groups}
                    onChange={(field, value) => {
                        setForm((p) => ({ ...p, [field]: value }));
                        setFormError("");
                    }}
                    onAuthChange={(auth) => {
                        setForm((p) => ({ ...p, auth }));
                        setFormError("");
                    }}
                    onParamsChange={(params) => {
                        setForm((p) => ({ ...p, params }));
                        setFormError("");
                    }}
                />
            </ModalDefault>

            <ModalDefault
                isOpen={groupModalOpen}
                onClose={() => setGroupModalOpen(false)}
                onSubmit={handleSaveGroup}
                title={editingGroupId !== null ? "Editar Grupo" : "Novo Grupo"}
                description="Organize seus endpoints em coleções."
                submitLabel={editingGroupId !== null ? "Salvar Alterações" : "Criar Grupo"}
                isLoading={groupSaving}
            >
                <GroupForm
                    form={groupForm}
                    error={groupFormError}
                    onChange={(field, value) => {
                        setGroupForm((p) => ({ ...p, [field]: value }));
                        setGroupFormError("");
                    }}
                />
            </ModalDefault>
        </div>
    );
}
