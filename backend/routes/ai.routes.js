import { Router } from "express";
import { receiveAlert } from "../controllers/ai.controller.js";

const aiRouter = Router();

aiRouter.post("/alert", receiveAlert);

export default aiRouter;
