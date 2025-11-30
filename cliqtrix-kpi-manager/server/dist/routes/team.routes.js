"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/team.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const team_controller_1 = require("../controllers/team.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/", team_controller_1.getAllTeams);
router.get("/project/:projectId", team_controller_1.getTeamByProject); // NEW
router.put("/:projectId", team_controller_1.upsertTeamForProject);
router.delete("/:id", team_controller_1.deleteTeam);
exports.default = router;
//# sourceMappingURL=team.routes.js.map