"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/admin", dashboard_controller_1.getAdminDashboard);
router.get("/employee", dashboard_controller_1.getEmployeeDashboard);
router.get("/leaderboard", dashboard_controller_1.getLeaderboard);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map