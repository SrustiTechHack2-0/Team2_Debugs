import { Router } from "express";
import { create, validate } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post('/create', create);
authRouter.post('/validate', validate);

export default authRouter;