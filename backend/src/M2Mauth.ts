import {auth} from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";

dotenv.config();

export const requireM2M = auth({
    audience: process.env.AUTH0_AUDIENCE as string, 
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL as string, 
    tokenSigningAlg: "RS256",
});
