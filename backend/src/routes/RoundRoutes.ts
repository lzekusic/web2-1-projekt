import express from "express";
import { requireM2M } from "../M2Mauth";
import {startNewRound, closeRound, storeResults} from "../controllers/RoundController";

const router = express.Router();

router.post("/new-round", requireM2M, startNewRound);
router.post("/close", requireM2M, closeRound);
router.post("/store-results", requireM2M, storeResults);

export default router;