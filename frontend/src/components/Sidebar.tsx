import { NavLink } from "react-router-dom"
import { Home, FolderGit2, Database, Plug, CheckSquare, Map } from "lucide-react"
import "../styles/Sidebar.css"

const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/projects", icon: FolderGit2, label: "Projects" },
    { to: "/github", icon: Map, label: "GitHub" },
    { to: "/databases", icon: Database, label: "Databases" },
    { to: "/endpoints", icon: Plug, label: "Endpoints" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
]

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar__logo">
                <span className="sidebar__logo-icon">⬡</span>
                <span className="sidebar__logo-text">DevMap</span>
            </div>

            <nav className="sidebar__nav">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/dashboard"}
                        className={({ isActive }) =>
                            `sidebar__item ${isActive ? "sidebar__item--active" : ""}`
                        }
                    >
                        <Icon size={18} className="sidebar__icon" />
                        <span className="sidebar__label">{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__footer">
                <span className="sidebar__version">v0.1.0 MVP</span>
            </div>
        </aside>
    )
}
