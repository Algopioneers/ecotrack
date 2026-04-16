"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const pickup_controller_1 = require("../controllers/pickup.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// User routes
router.post('/', pickup_controller_1.createPickupRequest);
router.get('/', pickup_controller_1.getUserPickupRequests);
router.get('/:id', pickup_controller_1.getPickupRequestById);
router.patch('/:id', pickup_controller_1.updatePickupRequest);
// Collector/Admin routes
router.get('/all/all', pickup_controller_1.getAllPickupRequests); // For collectors/admins to see all requests
exports.default = router;
//# sourceMappingURL=pickup.routes.js.map