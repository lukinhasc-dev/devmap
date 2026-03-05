export default function ProjectEndpoints() {
    return (
        <div className="project-subpage">
            <h2 className="project-subpage__heading">Endpoints</h2>

            <div className="project-subpage__empty">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                </svg>
                <p className="project-subpage__empty-title">Nenhum endpoint cadastrado</p>
                <p className="project-subpage__empty-desc">
                    Documente e monitore os endpoints da API do projeto para facilitar a integração e os testes.
                </p>
            </div>
        </div>
    )
}
