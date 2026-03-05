export default function ProjectDatabases() {
    return (
        <div className="project-subpage">
            <h2 className="project-subpage__heading">Databases</h2>

            <div className="project-subpage__empty">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
                </svg>
                <p className="project-subpage__empty-title">Nenhum banco de dados conectado</p>
                <p className="project-subpage__empty-desc">
                    Adicione conexões de banco de dados para monitorar schemas, tabelas e métricas do projeto.
                </p>
            </div>
        </div>
    )
}
