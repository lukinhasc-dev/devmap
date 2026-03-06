import express from "express";
import cors from "cors";
import "./src/database/connection";
import { runMigrations } from "./src/database/migrations";
import index from "./src/routes/index";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//Rotas das APIs
app.use("/api/devmap", index);

runMigrations();

export default app;