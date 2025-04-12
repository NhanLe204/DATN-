interface BookingEmailData {
    recipientEmail: string;
    customerName?: string;
    orderDetails: Array<{
        serviceId: string | null;
        booking_date: Date | null;
        petName: string | null;
        petType: string | null;
    }>;
    orderId: string;
    isCancellation?: boolean;
}
declare const sendBookingEmail: ({ recipientEmail, customerName, orderDetails, orderId, isCancellation }: BookingEmailData) => Promise<void>;
export default sendBookingEmail;
