// src/routes/cliq.routes.ts
import { Router, Request, Response } from "express";
import dashboardRoutes from "./dashboard.routes"; // adjust if your controller is separate

const router = Router();

/**
 * Helper: call the existing /api/dashboard/employee logic
 * This assumes dashboardRoutes exposes a handler or you refactor
 * your existing controller into a service function.
 *
 * For now, this route just returns a static/demo KPI payload so
 * the Cliq bot can work without JWT.
 */

router.get("/dashboard/employee", async (req: Request, res: Response) => {
  const appKey = req.header("x-cliq-app-key");

  if (!appKey || appKey !== process.env.CLIQ_APP_KEY) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized Cliq request",
    });
  }

  try {
    // TODO: Replace this demo data with a real call to your KPI logic.
    // For now we send a static structure that matches what the bot expects.
    const demoData = {
      completionRate: 78,
      tasksCompletedToday: 12,
      pointsEarned: 145,
    };

    return res.status(200).json({
      status: "success",
      data: demoData,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch KPI data for Cliq",
    });
  }
});

export default router;
