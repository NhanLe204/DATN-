export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}
export enum OrderStatus {
  PENDING = 'PENDING', // Đơn hàng đang chờ xử lý
  PROCESSING = 'PROCESSING', // Đang xử lý
  SHIPPED = 'SHIPPED', // Đã giao hàng
  DELIVERED = 'DELIVERED', // Đã nhận hàng
  CANCELLED = 'CANCELLED' // Đã hủy
}
