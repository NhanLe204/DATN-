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
declare const sendBookingEmail: ({ recipientEmail, customerName, orderDetails, orderId, isCancellation, subject: customSubject, html: customHtml }: BookingEmailData & {
    subject?: string;
    html?: string;
}) => Promise<void>;
export default sendBookingEmail;
