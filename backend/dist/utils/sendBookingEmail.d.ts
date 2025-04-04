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
}
declare const sendBookingEmail: ({ recipientEmail, customerName, orderDetails, orderId }: BookingEmailData) => Promise<void>;
export default sendBookingEmail;
