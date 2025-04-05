export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}
export declare enum OrderStatus {
    PENDING = "PENDING",// Đơn hàng đang chờ xử lý
    PROCESSING = "PROCESSING",// Đang xử lý
    SHIPPING = "SHIPPING",// Đang giao hàng
    SHIPPED = "SHIPPED",// Đã giao hàng
    DELIVERED = "DELIVERED",// Đã nhận hàng
    CANCELLED = "CANCELLED"
}
