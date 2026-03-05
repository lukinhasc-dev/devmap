import { useEffect, useState } from "react"
import DefaultPage from "./DefaultPage.tsx"
import DashboardCards, { type DashboardStats } from "../components/DashboardCards.tsx"
import DashboardCharts from "../components/DashboardCharts.tsx"
import { getDashboardStats } from "../services/dashboard.service.ts"
import "../styles/DefaultPage.css"

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .catch(() => setError("Erro ao carregar o dashboard."))
            .finally(() => setLoading(false))
    }, [])

    return (
        <DefaultPage tittle="Dashboard" description="Visão geral de todas as funcionalidades">
            {loading && <p>Carregando...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {stats && (
                <>
                    <DashboardCards stats={stats} />
                    <DashboardCharts stats={stats} />
                </>
            )}
        </DefaultPage>
    )
}
