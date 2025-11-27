import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getProjectOverview } from "../controllers/projectStats.controller";

const router = Router();

router.use(authenticate);

router.get("/:id/overview", getProjectOverview);

export default router;
