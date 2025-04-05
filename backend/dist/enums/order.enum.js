"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPING"] = "SHIPPING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED"; // Đã hủy
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
//# sourceMappingURL=order.enum.js.map