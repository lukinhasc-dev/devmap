import express from "express";
import cors from "cors";
import "./src/database/connection";
import { runMigrations } from "./src/database/migrations";
import endpointRoutes from "./src/routes/endpoint.routes";
import projectsRoutes from "./src/routes/projects.routes";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors({ origin: "*" }));
app.use(express.json());


//Rotas das APIs
app.use("/api/devmap", endpointRoutes);
app.use("/api/devmap", projectsRoutes);



app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT} 🚀!`);

    //Banco de dados, os migrations serve para criar as tabelas no SQLite.
    runMigrations();
});

export default app;