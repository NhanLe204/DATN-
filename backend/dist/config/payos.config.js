"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __importDefault(require("@payos/node"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.PAYOS_CLIENT_ID ||
    (() => {
        throw new Error('PAYOS_API_KEY is not defined');
    })();
const apiSecret = process.env.PAYOS_API_KEY ||
    (() => {
        throw new Error('PAYOS_API_SECRET is not defined');
    })();
const apiUrl = process.env.PAYOS_CHECKSUM_KEY ||
    (() => {
        throw new Error('PAYOS_API_URL is not defined');
    })();
const payos = new node_1.default(apiKey, apiSecret, apiUrl);
exports.default = payos;
//# sourceMappingURL=payos.config.js.map