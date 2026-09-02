import express from "express";
import cors from "cors";
import "./src/database/connection";
import { runMigrations } from "./src/database/migrations";
import index from "./src/routes/index";
import { uploadsDir } from "./src/middlewares/upload";


const app = express();
const PORT = process.env.PORT || 5173;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/uploads", express.static(uploadsDir));

//Rotas das APIs
app.use("/api/devmap", index);

runMigrations();

export default app;