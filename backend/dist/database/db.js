"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_js_1 = __importDefault(require("../config/config.js"));
const connectDB = async () => {
    try {
        if (!config_js_1.default.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }
        mongoose_1.default.set('strictQuery', false); // Thêm dòng này để tắt cảnh báo
        const conn = await mongoose_1.default.connect(config_js_1.default.MONGODB_URI);
        console.log(`Kết nối thành công: ${conn.connection.host}`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error connecting to MongoDB: ${error.message}`);
        }
        else {
            console.error('Error connecting to MongoDB: Unknown error');
        }
        process.exit(1); // 1 means exist with failure, 0 means exist with success
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map