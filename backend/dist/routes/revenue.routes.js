"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const revenue_controllers_js_1 = require("../controllers/revenue.controllers.js");
const router = (0, express_1.Router)();
router.get('/revenue', revenue_controllers_js_1.getRevenue);
exports.default = router;
//# sourceMappingURL=revenue.routes.js.map