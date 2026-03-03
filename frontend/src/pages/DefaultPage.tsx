import { useState } from "react"
import "../styles/DefaultPage.css"

type FilterOption = {
    label: string
    value: string
}

type DefaultPageProps = {
    tittle: string
    description: string
    children: React.ReactNode
    onSearch?: (value: string) => void
    onAdd?: () => void
    addLabel?: string
    filters?: FilterOption[]
    onFilterChange?: (value: string) => void
}

export default function DefaultPage({
    tittle,
    description,
    children,
    onSearch,
    onAdd,
    addLabel = "Novo",
    filters,
    onFilterChange,
}: DefaultPageProps) {
    const [activeFilter, setActiveFilter] = useState<string>(filters?.[0]?.value ?? "")

    function handleFilter(value: string) {
        setActiveFilter(value)
        onFilterChange?.(value)
    }

    return (
        <>
            <div className="home-page">
                {/* ── Topo: título + toolbar ── */}
                <div className="page-header">
                    <div className="page-header-text">
                        <h1 className="tittle">{tittle}</h1>
                        <p className="description">{description}</p>
                    </div>

                    <div className="page-toolbar">
                        <div className="search-wrapper">
                            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Pesquisar..."
                                onChange={(e) => onSearch?.(e.target.value)}
                            />
                        </div>

                        {onAdd && (
                            <button className="add-button" onClick={onAdd}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                {addLabel}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Sub-barra: filtros ── */}
                {filters && filters.length > 0 && (
                    <div className="page-subbar">
                        <div className="filter-chips">
                            {filters.map((f) => (
                                <button
                                    key={f.value}
                                    className={`filter-chip${activeFilter === f.value ? " filter-chip--active" : ""}`}
                                    onClick={() => handleFilter(f.value)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="content">
                {children}
            </div>
        </>
    )
}