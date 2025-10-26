import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import RoundRoutes from "./routes/RoundRoutes";
import TicketRoutes from "./routes/TicketRoutes";

dotenv.config();

export const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/", RoundRoutes);
app.use("/api", TicketRoutes);