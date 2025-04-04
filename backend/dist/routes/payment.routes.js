"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = require("express");
const payment_controllers_1 = require("../controllers/payment.controllers");
dotenv_1.default.config();
const paymentRouter = (0, express_1.Router)();
paymentRouter.post('/create_payment', payment_controllers_1.createPayment);
exports.default = paymentRouter;
//# sourceMappingURL=payment.routes.js.map