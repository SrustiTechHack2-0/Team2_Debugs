import { Router } from "express";

const authRouter = Router();

authRouter.post('/create', create);
authRouter.post('/validate', validate);

export default authRouter;