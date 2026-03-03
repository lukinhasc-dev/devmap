import "../styles/Home.css"
import ProjectsCards from "../components/Cards"

export default function Home() {
    return (
        <div className="tittle-page">
            <h1>Home</h1>
            <p>Página inicial do DevMap</p>
            <ProjectsCards />
        </div>
    )
}