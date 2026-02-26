import express from "express";
import cors from "cors";
import "./database/connection";
import { runMigrations } from "./database/migrations";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "Backend funcionando! 🚀" });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT} 🚀!`);

    //Banco de dados, os migrations serve para criar as tabelas no SQLite.
    runMigrations();
});