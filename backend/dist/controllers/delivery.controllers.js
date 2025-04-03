"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDelivery = exports.updateDelivery = exports.insertDelivery = exports.getDeliveryById = exports.getAllDeliveries = void 0;
const delivery_model_js_1 = __importDefault(require("../models/delivery.model.js"));
// Get all deliveries
const getAllDeliveries = async (req, res) => {
    try {
        const deliveries = await delivery_model_js_1.default.find();
        res.status(200).json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching deliveries',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAllDeliveries = getAllDeliveries;
// Get delivery by ID
const getDeliveryById = async (req, res) => {
    try {
        const delivery = await delivery_model_js_1.default.findById(req.params.id);
        if (!delivery) {
            res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: delivery
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getDeliveryById = getDeliveryById;
// Create new delivery
const insertDelivery = async (req, res) => {
    try {
        const { delivery_name, description, delivery_fee, estimated_delivery_time, status } = req.body;
        // Validate required fields
        if (!delivery_name || !delivery_fee || !estimated_delivery_time) {
            res.status(400).json({
                success: false,
                message: 'Delivery name, delivery fee, and estimated delivery time are required'
            });
            return;
        }
        const delivery = new delivery_model_js_1.default({
            delivery_name,
            description,
            delivery_fee,
            estimated_delivery_time,
            status
        });
        const savedDelivery = await delivery.save();
        res.status(201).json({
            success: true,
            data: savedDelivery,
            message: 'Delivery created successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating delivery',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.insertDelivery = insertDelivery;
// Update delivery
const updateDelivery = async (req, res) => {
    try {
        const delivery = await delivery_model_js_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!delivery) {
            res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: delivery,
            message: 'Delivery updated successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating delivery',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateDelivery = updateDelivery;
// Delete delivery
const deleteDelivery = async (req, res) => {
    try {
        const delivery = await delivery_model_js_1.default.findByIdAndDelete(req.params.id);
        if (!delivery) {
            res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Delivery deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting delivery',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deleteDelivery = deleteDelivery;
//# sourceMappingURL=delivery.controllers.js.map