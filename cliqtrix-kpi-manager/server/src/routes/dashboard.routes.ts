import { Router } from "express";
import {
  getAdminDashboard,
  getEmployeeDashboard,
  getLeaderboard,
} from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/admin", getAdminDashboard);
router.get("/employee", getEmployeeDashboard);
router.get("/leaderboard", getLeaderboard);

export default router;
