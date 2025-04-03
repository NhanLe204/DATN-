"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayments = exports.updatePayment = exports.insertPayment = exports.getPaymentById = exports.getAllPayments = void 0;
const paymentType_model_js_1 = __importDefault(require("../models/paymentType.model.js")); // Assuming there's a Payment model
// Get all payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await paymentType_model_js_1.default.find();
        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAllPayments = getAllPayments;
// Get payment by ID
const getPaymentById = async (req, res) => {
    try {
        const payment = await paymentType_model_js_1.default.findById(req.params.id);
        if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: payment
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getPaymentById = getPaymentById;
// Create new payment
const insertPayment = async (req, res) => {
    try {
        const { payment_type_name, description } = req.body;
        if (!payment_type_name || !description) {
            res.status(400).json({
                success: false,
                message: 'Payment type name is required'
            });
            return;
        }
        const payment = new paymentType_model_js_1.default({
            payment_type_name,
            description
        });
        const savedPayment = await payment.save();
        res.status(201).json({
            success: true,
            data: savedPayment,
            message: 'Payment created successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating payment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.insertPayment = insertPayment;
// Update payment
const updatePayment = async (req, res) => {
    try {
        const payment = await paymentType_model_js_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: payment,
            message: 'Payment updated successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating payment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updatePayment = updatePayment;
// Delete payment
const deletePayments = async (req, res) => {
    try {
        const payment = await paymentType_model_js_1.default.findByIdAndDelete(req.params.id);
        if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Payment deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting payment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deletePayments = deletePayments;
//# sourceMappingURL=paymentType.controllers.js.map