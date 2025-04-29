export declare const sendBookingCompletionEmail: (orderDetail: {
    realPrice: any;
    serviceId: any;
    petName: any;
    petType: any;
    booking_date: any;
}, order: {
    orderId: any;
}, user: {
    email: any;
    name: any;
}) => Promise<void>;
