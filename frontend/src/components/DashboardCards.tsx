import "../styles/Cards.css"

// ── Types ───────────────────────────────────────────────
export type DashboardStats = {
    endpointsStats: {
        total: number
        get: number
        post: number
        put: number
        delete: number
    }
    projectsStats: {
        total: number
        andamento: number
        concluido: number
        pausados: number
    }
    githubStats: {
        total: number
    }
    databaseStats: {
        total: number
    }
}

// ── Icons ────────────────────────────────────────────────
function IconEndpoints() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    )
}

function IconProjects() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </svg>
    )
}

function IconGithub() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    )
}

function IconDatabase() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
        </svg>
    )
}

// ── Stat Card ────────────────────────────────────────────
type StatCardProps = {
    label: string
    value: number
    icon: React.ReactNode
    sub?: { label: string; value: number }[]
}

function StatCard({ label, value, icon, sub }: StatCardProps) {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">{label}</h3>
                <span className="card-icon">{icon}</span>
            </div>
            <p className="card-total">{value}</p>
            {sub && sub.length > 0 && (
                <div className="card-sub">
                    {sub.map(item => (
                        <span key={item.label} className="card-sub-item">
                            <strong>{item.value}</strong> {item.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── DashboardCards ───────────────────────────────────────
type DashboardCardsProps = {
    stats: DashboardStats
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
    return (
        <div className="cards-grid">
            <StatCard
                label="Projetos"
                value={stats.projectsStats.total}
                icon={<IconProjects />}
                sub={[
                    { label: "Em Andamento", value: stats.projectsStats.andamento },
                    { label: "Concluídos", value: stats.projectsStats.concluido },
                    { label: "Pausados", value: stats.projectsStats.pausados },
                ]}
            />
            <StatCard
                label="Endpoints"
                value={stats.endpointsStats.total}
                icon={<IconEndpoints />}
                sub={[
                    { label: "GET", value: stats.endpointsStats.get },
                    { label: "POST", value: stats.endpointsStats.post },
                    { label: "PUT", value: stats.endpointsStats.put },
                    { label: "DELETE", value: stats.endpointsStats.delete },
                ]}
            />
            <StatCard
                label="GitHub"
                value={stats.githubStats.total}
                icon={<IconGithub />}
            />
            <StatCard
                label="Databases"
                value={stats.databaseStats.total}
                icon={<IconDatabase />}
            />
        </div>
    )
}