import express from "express";
import { requireM2M } from "../M2Mauth";
import {totalTickets, generateTicket, getTicket, lastResults, getActiveRoundStatus} from "../controllers/TicketController";

const router = express.Router();

router.get("/totalTickets", requireM2M, totalTickets);
router.post("/generateTicket", requireM2M, generateTicket);
router.get("/getTicket/:uuid", getTicket);
router.get("/lastResults", requireM2M, lastResults);

router.get("/activeRound", requireM2M, getActiveRoundStatus);

export default router;