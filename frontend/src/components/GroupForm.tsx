export type GroupFormData = {
    nome: string;
    descricao: string;
    base_url: string;
};

type Props = {
    form: GroupFormData;
    error: string;
    onChange: (field: keyof GroupFormData, value: string) => void;
};

export default function GroupForm({ form, error, onChange }: Props) {
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
                        placeholder="ex: Autenticação"
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
                        placeholder="Sobre o que é essa coleção?"
                        onChange={(e) => onChange("descricao", e.target.value)}
                    />
                </label>
            </div>

            <div className="ep-form__row">
                <label className="ep-form__label">
                    Base URL
                    <input
                        className="ep-form__input ep-form__mono"
                        type="text"
                        value={form.base_url}
                        placeholder="https://api.exemplo.com"
                        onChange={(e) => onChange("base_url", e.target.value)}
                    />
                </label>
            </div>
        </div>
    );
}
