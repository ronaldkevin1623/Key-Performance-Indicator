"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const projectStats_controller_1 = require("../controllers/projectStats.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/:id/overview", projectStats_controller_1.getProjectOverview);
exports.default = router;
//# sourceMappingURL=projectStats.routes.js.map