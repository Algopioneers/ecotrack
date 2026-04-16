"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const cms_controller_1 = require("../controllers/cms.controller");
const router = (0, express_1.Router)();
// Public routes
router.get('/slug/:slug', cms_controller_1.getPublicPage);
// Admin routes
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), cms_controller_1.getAllPages);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), cms_controller_1.getPage);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), cms_controller_1.createPage);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), cms_controller_1.updatePage);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), cms_controller_1.deletePage);
router.post('/:id/duplicate', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), cms_controller_1.duplicatePage);
exports.default = router;
//# sourceMappingURL=cms.routes.js.map