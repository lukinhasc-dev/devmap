// ─── EndpointForm.tsx ─────────────────────────────────────────────────────────
// Formulário usado no Modal para criar/editar um endpoint.

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export type EndpointFormData = {
    nome: string;
    descricao: string;
    rota: string;
    metodo: string;
    controller_nome: string;
};

type Props = {
    form: EndpointFormData;
    error: string;
    onChange: (field: keyof EndpointFormData, value: string) => void;
};

export default function EndpointForm({ form, error, onChange }: Props) {
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

            <div className="ep-form__row">
                <label className="ep-form__label">
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
        </div>
    );
}
