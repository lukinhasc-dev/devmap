import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"
import type { DashboardStats } from "./DashboardCards"
import "../styles/DashboardCharts.css"

// Tipo local para o callback de tooltip do Recharts
type RechartsTooltipProps = {
    active?: boolean
    payload?: Array<{ name?: string; value?: number | string; payload?: Record<string, unknown> }>
}

// ── Paleta ──────────────────────────────────────────────
const COLORS = {
    andamento: "#fb923c",
    concluido: "#34d399",
    pausados: "#ef4444",
    GET: "#9d4edd",
    POST: "#63b3ed",
    PUT: "#fbbf24",
    DELETE: "#ef4444",
}

// ── Tooltip customizado ──────────────────────────────────
function CustomTooltip({ active, payload }: RechartsTooltipProps) {
    if (!active || !payload?.length) return null
    const { name, value } = payload[0]
    return (
        <div className="chart-tooltip">
            <span className="chart-tooltip-label">{name}</span>
            <span className="chart-tooltip-value">{value}</span>
        </div>
    )
}

// ── Props ────────────────────────────────────────────────
type Props = { stats: DashboardStats }

export default function DashboardCharts({ stats }: Props) {
    const { projectsStats, endpointsStats } = stats

    // Dados para o Donut (projetos por status)
    const projectsData = [
        { name: "Em Andamento", value: projectsStats.andamento, color: COLORS.andamento },
        { name: "Concluídos", value: projectsStats.concluido, color: COLORS.concluido },
        { name: "Pausados", value: projectsStats.pausados, color: COLORS.pausados },
    ].filter(d => d.value > 0)

    // Dados para o Bar (endpoints por método)
    const endpointsData = [
        { method: "GET", count: endpointsStats.get, fill: COLORS.GET },
        { method: "POST", count: endpointsStats.post, fill: COLORS.POST },
        { method: "PUT", count: endpointsStats.put, fill: COLORS.PUT },
        { method: "DELETE", count: endpointsStats.delete, fill: COLORS.DELETE },
    ]

    const hasProjects = projectsData.length > 0
    const hasEndpoints = endpointsData.some(d => d.count > 0)

    return (
        <div className="charts-row">

            {/* ── Gráfico 1: Status dos projetos (Donut) ── */}
            <div className="chart-card">
                <div className="chart-card-header">
                    <h3 className="chart-card-title">Projetos por Status</h3>
                    <span className="chart-card-badge">{projectsStats.total} total</span>
                </div>

                {hasProjects ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={projectsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {projectsData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} stroke="transparent" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                iconSize={9}
                                formatter={(value: string) => (
                                    <span style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
                                        {value}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="chart-empty">Nenhum projeto cadastrado ainda.</div>
                )}
            </div>

            {/* ── Gráfico 2: Endpoints por método HTTP (Bar) ── */}
            <div className="chart-card">
                <div className="chart-card-header">
                    <h3 className="chart-card-title">Endpoints por Método</h3>
                    <span className="chart-card-badge">{endpointsStats.total} total</span>
                </div>

                {hasEndpoints ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart
                            data={endpointsData}
                            margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                            barSize={36}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--color-border)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="method"
                                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                content={(props: RechartsTooltipProps) => {
                                    if (!props.active || !props.payload?.length) return null
                                    const item = props.payload[0].payload as { method: string }
                                    return (
                                        <div className="chart-tooltip">
                                            <span className="chart-tooltip-label">{item.method}</span>
                                            <span className="chart-tooltip-value">{props.payload[0].value}</span>
                                        </div>
                                    )
                                }}
                                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {endpointsData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="chart-empty">Nenhum endpoint cadastrado ainda.</div>
                )}
            </div>

        </div>
    )
}
