import DefaultPage from "./DefaultPage"

export default function Home() {
    function handleAdd() {
        // abrir modal de novo projeto aqui
        console.log("Novo projeto")
    }

    return (
        <>
            <DefaultPage
                tittle="Projetos"
                description="Crie os seus projetos para gerenciar e acompanhar o desenvolvimento deles."
                addLabel="+ Novo Projeto"
                onAdd={handleAdd}
                filters={[
                    { label: "Todos", value: "all" },
                    { label: "Em andamento", value: "active" },
                    { label: "Concluídos", value: "done" },
                    { label: "Pausados", value: "paused" },
                ]}
                onFilterChange={(filter) => console.log("Filtro:", filter)}
                onSearch={(q) => console.log("Busca:", q)}
            >
                {null}
            </DefaultPage>
        </>
    )
}