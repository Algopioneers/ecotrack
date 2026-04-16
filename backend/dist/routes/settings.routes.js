"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const settings_controller_1 = require("../controllers/settings.controller");
const router = (0, express_1.Router)();
router.get('/', settings_controller_1.getSettings);
router.put('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), settings_controller_1.updateSettings);
router.post('/upload-logo', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), settings_controller_1.uploadLogo);
router.post('/upload-favicon', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), settings_controller_1.uploadFavicon);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map