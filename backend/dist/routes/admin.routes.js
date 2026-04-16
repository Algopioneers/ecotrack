"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_2.authorize)('ADMIN'));
// Dashboard
router.get('/dashboard/stats', analytics_controller_1.getDashboardStats);
// Analytics
router.get('/analytics/revenue', analytics_controller_1.getRevenueAnalytics);
router.get('/analytics/pickups', analytics_controller_1.getPickupAnalytics);
router.get('/analytics/users', analytics_controller_1.getUserAnalytics);
router.get('/analytics/collectors', analytics_controller_1.getCollectorPerformance);
// User management
router.get('/users', analytics_controller_1.getAllUsers);
router.patch('/users/:id/status', analytics_controller_1.updateUserStatus);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map