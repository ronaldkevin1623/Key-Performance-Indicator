import { Router } from "express";
import { getAdminDashboard, getEmployeeDashboard } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/admin", authenticate, getAdminDashboard);
router.get("/employee", authenticate, getEmployeeDashboard);

export default router;
