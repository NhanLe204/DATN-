export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}
export enum OrderStatus {
  PENDING = 'PENDING', // Đơn hàng đang chờ xử lý
  PROCESSING = 'PROCESSING', // Đang xử lý
  SHIPPED = 'SHIPPED', // Đã giao hàng
  DELIVERED = 'DELIVERED', // Đã nhận hàng
  CANCELLED = 'CANCELLED' // Đã hủy
}
