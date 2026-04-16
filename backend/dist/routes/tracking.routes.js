"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const tracking_controller_1 = require("../controllers/tracking.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get collector location
router.get('/collector/:collectorId/location', tracking_controller_1.getCollectorLocation);
// Get route between two points
router.get('/route', tracking_controller_1.getRoute);
exports.default = router;
//# sourceMappingURL=tracking.routes.js.map