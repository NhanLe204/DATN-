import dayjs from 'dayjs';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Booking {
  email: string;
  key: string;
  id: string;
  orderId: string;
  fullname: string;
  phone: string;
  orderDate: string;
  serviceName: string;
  serviceId?: string;
  bookingDate: string;
  bookingTime: string;
  estimatedPrice: number;
  duration: number;
  bookingStatus: string;
  petName?: string;
  petType?: string;
  petWeight?: number;
  userId?: string;
  realPrice?: number;
  bookingMoment?: dayjs.Dayjs | null;
  orderCode: string;
  booking_note?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const availableTimeSlots = [
  '08:00', '08:15', '08:30', '08:45',
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
];

export const petTypesDefault = ['Chó', 'Mèo', 'Khác'];