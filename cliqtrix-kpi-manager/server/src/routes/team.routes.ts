// src/routes/team.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  upsertTeamForProject,
  getAllTeams,
  getTeamByProject,
  deleteTeam,
} from "../controllers/team.controller";

const router = Router();

router.use(authenticate);

router.get("/", getAllTeams);
router.get("/project/:projectId", getTeamByProject); // NEW
router.put("/:projectId", upsertTeamForProject);
router.delete("/:id", deleteTeam);

export default router;
