import { IconTag, IconAlignLeft, IconLayers, IconUser, IconCalendar } from "./Icons"

export type ProjectFormData = {
    nome: string
    descricao: string
    status: string
    responsavel: string
    data_inicio: string
    data_entrega: string
}

type Props = {
    form: ProjectFormData
    error: string
    onChange: (field: string, value: string) => void
}

export default function ProjectForm({ form, error, onChange }: Props) {
    return (
        <>
            <div className="form-group">
                <label className="form-label">Nome do Projeto *</label>
                <div className="form-input-wrapper">
                    <span className="form-input-icon"><IconTag /></span>
                    <input
                        className="form-input form-input--icon"
                        type="text"
                        placeholder="Ex: DevMap v2"
                        value={form.nome}
                        onChange={(e) => onChange("nome", e.target.value)}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Descrição</label>
                <div className="form-input-wrapper">
                    <span className="form-input-icon form-input-icon--top"><IconAlignLeft /></span>
                    <textarea
                        className="form-textarea form-textarea--icon"
                        placeholder="Descreva brevemente o projeto..."
                        rows={3} maxLength={85}
                        value={form.descricao}
                        onChange={(e) => onChange("descricao", e.target.value)}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <div className="form-input-wrapper">
                        <span className="form-input-icon"><IconLayers /></span>
                        <select
                            className="form-select form-select--icon"
                            value={form.status}
                            onChange={(e) => onChange("status", e.target.value)}
                        >
                            <option>Em Andamento</option>
                            <option>Pausados</option>
                            <option>Concluídos</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Responsável *</label>
                    <div className="form-input-wrapper">
                        <span className="form-input-icon"><IconUser /></span>
                        <input
                            className="form-input form-input--icon"
                            type="text"
                            placeholder="Nome do responsável"
                            maxLength={25}
                            value={form.responsavel}
                            onChange={(e) => onChange("responsavel", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Data de Início *</label>
                    <div className="form-input-wrapper">
                        <span className="form-input-icon"><IconCalendar /></span>
                        <input
                            className="form-input form-input--icon"
                            type="date"
                            value={form.data_inicio}
                            onChange={(e) => onChange("data_inicio", e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Data de Entrega</label>
                    <div className="form-input-wrapper">
                        <span className="form-input-icon"><IconCalendar /></span>
                        <input
                            className="form-input form-input--icon"
                            type="date"
                            value={form.data_entrega}
                            onChange={(e) => onChange("data_entrega", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {error && <p className="form-error">{error}</p>}
        </>
    )
}
