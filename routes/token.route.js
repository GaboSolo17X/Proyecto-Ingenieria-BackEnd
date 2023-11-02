
import express from 'express';
import { refreshToken } from "../controllers/token.controller.js";

const router = express.Router();

router.get("/refresh", refreshToken);


export default router;