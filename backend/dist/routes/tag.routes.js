"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const tag_controllers_js_1 = require("../controllers/tag.controllers.js");
const tagRouter = (0, express_1.Router)();
// http://localhost:5000/api/v1/tags
tagRouter.get('/tags', tag_controllers_js_1.getAllTags);
tagRouter.get('/tags/:id', tag_controllers_js_1.getTagById);
tagRouter.post('/tags', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, tag_controllers_js_1.insertTag);
tagRouter.delete('/tags/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, tag_controllers_js_1.deleteTag);
tagRouter.patch('/tags/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, tag_controllers_js_1.updateTag);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);
// brandRouter.get('/brands/:id', getBrandById);
// brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
exports.default = tagRouter;
//# sourceMappingURL=tag.routes.js.map