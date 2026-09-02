import type { EndpointGroup } from "../models/EndpointGroup.model";
import type { AuthConfig } from "../models/Auth.model";
import AuthEditor from "./AuthEditor";
import KeyValueEditor, { type KeyValuePair } from "./KeyValueEditor";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export type EndpointFormData = {
    nome: string;
    descricao: string;
    rota: string;
    metodo: string;
    controller_nome: string;
    group_id: string;
    headers: string;
    body: string;
    params: KeyValuePair[];
    auth: AuthConfig;
};

type Props = {
    form: EndpointFormData;
    error: string;
    groups: EndpointGroup[];
    onChange: (field: keyof EndpointFormData, value: string) => void;
    onAuthChange: (auth: AuthConfig) => void;
    onParamsChange: (params: KeyValuePair[]) => void;
};

export default function EndpointForm({ form, error, groups, onChange, onAuthChange, onParamsChange }: Props) {
    return (
        <div className="ep-form">
            {error && <p className="ep-form__error">{error}</p>}

            <div className="ep-form__row">
                <label className="ep-form__label">
                    Nome *
                    <input
                        className="ep-form__input"
                        type="text"
                        value={form.nome}
                        placeholder="ex: Listar usuários"
                        onChange={(e) => onChange("nome", e.target.value)}
                    />
                </label>
            </div>

            <div className="ep-form__row">
                <label className="ep-form__label">
                    Descrição
                    <textarea
                        className="ep-form__input ep-form__textarea"
                        value={form.descricao}
                        rows={2}
                        placeholder="O que esse endpoint faz?"
                        onChange={(e) => onChange("descricao", e.target.value)}
                    />
                </label>
            </div>

            <div className="ep-form__row ep-form__row--split">
                <label className="ep-form__label">
                    Método *
                    <select
                        className="ep-form__input ep-form__select"
                        value={form.metodo}
                        onChange={(e) => onChange("metodo", e.target.value)}
                    >
                        {HTTP_METHODS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </label>

                <label className="ep-form__label" style={{ flex: 2 }}>
                    Rota *
                    <input
                        className="ep-form__input ep-form__mono"
                        type="text"
                        value={form.rota}
                        placeholder="/api/users"
                        onChange={(e) => onChange("rota", e.target.value)}
                    />
                </label>
            </div>

            <div className="ep-form__row ep-form__row--split">
                <label className="ep-form__label">
                    Grupo
                    <select
                        className="ep-form__input ep-form__select"
                        value={form.group_id}
                        onChange={(e) => onChange("group_id", e.target.value)}
                    >
                        <option value="">Sem grupo</option>
                        {groups.map((g) => (
                            <option key={g.id} value={String(g.id)}>{g.nome}</option>
                        ))}
                    </select>
                </label>

                <label className="ep-form__label" style={{ flex: 2 }}>
                    Controller
                    <input
                        className="ep-form__input ep-form__mono"
                        type="text"
                        value={form.controller_nome}
                        placeholder="ex: getUsers"
                        onChange={(e) => onChange("controller_nome", e.target.value)}
                    />
                </label>
            </div>

            <div className="ep-form__section-title">Parâmetros (query)</div>
            <KeyValueEditor
                pairs={form.params}
                onChange={onParamsChange}
                keyPlaceholder="page"
                valuePlaceholder="1"
            />

            <div className="ep-form__row">
                <label className="ep-form__label">
                    Headers (JSON)
                    <textarea
                        className="ep-form__input ep-form__textarea ep-form__mono"
                        value={form.headers}
                        rows={3}
                        placeholder={'{\n  "Accept": "application/json"\n}'}
                        onChange={(e) => onChange("headers", e.target.value)}
                    />
                </label>
            </div>

            <div className="ep-form__row">
                <label className="ep-form__label">
                    Body (JSON)
                    <textarea
                        className="ep-form__input ep-form__textarea ep-form__mono"
                        value={form.body}
                        rows={3}
                        placeholder={'{\n  "chave": "valor"\n}'}
                        onChange={(e) => onChange("body", e.target.value)}
                    />
                </label>
            </div>

            <div className="ep-form__section-title">Autenticação</div>
            <AuthEditor value={form.auth} onChange={onAuthChange} />
        </div>
    );
}
