"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/contact.ts
const express_1 = require("express");
const contact_controllers_js_1 = require("../controllers/contact.controllers.js");
const router = (0, express_1.Router)();
router.post('/contact', contact_controllers_js_1.submitContactForm);
exports.default = router;
//# sourceMappingURL=contact.routes.js.map