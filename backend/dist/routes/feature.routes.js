"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const feature_controller_1 = require("../controllers/feature.controller");
const router = (0, express_1.Router)();
// Public routes
router.get('/active', feature_controller_1.getActiveFeatures);
router.get('/:id/click', feature_controller_1.recordFeatureClick);
// Admin routes (require authentication and admin role)
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_2.authorize)('ADMIN'));
router.get('/', feature_controller_1.getAllFeatures);
router.post('/', feature_controller_1.createFeature);
router.patch('/:id', feature_controller_1.updateFeature);
router.patch('/:id/toggle', feature_controller_1.toggleFeatureStatus);
router.delete('/:id', feature_controller_1.deleteFeature);
router.post('/reorder', feature_controller_1.reorderFeatures);
router.post('/:id/duplicate', feature_controller_1.duplicateFeature);
exports.default = router;
//# sourceMappingURL=feature.routes.js.map