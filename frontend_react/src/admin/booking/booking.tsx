import React, { useState, useEffect } from 'react';
import { Card, Form, notification } from 'antd';
import { motion } from 'framer-motion';
import moment from 'moment-timezone';
import orderDetailApi from '../../api/orderDetailApi';
import serviceApi from '../../api/serviceApi';
import orderApi from '../../api/orderApi';
import SearchBar from '../components/booking/SearchBar'
import BookingTable from '../components/booking/BookingTable';
import EditBookingModal from '../components/booking/EditBookingModal';
import StartServiceModal from '../components/booking/StartServiceModal';

export enum BookingStatus {
  PENDING = 'ĐANG CHỜ',
  CONFIRMED = 'ĐÃ XÁC NHẬN',
  IN_PROGRESS = 'ĐANG THỰC HIỆN',
  COMPLETED = 'HOÀN THÀNH',
  CANCELLED = 'ĐÃ HỦY',
}

interface Booking {
  key: string;
  id: string;
  orderId: string;
  username: string;
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
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const BookingManager: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [petTypes, setPetTypes] = useState<string[]>(['Chó', 'Mèo', 'Khác']);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [startForm] = Form.useForm();
  const [slotAvailability, setSlotAvailability] = useState<{
    [key: string]: number;
  }>({});
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(
    moment().tz('Asia/Ho_Chi_Minh')
  );

  const availableTimeSlots = [
    '8h',
    '9h',
    '10h',
    '11h',
    '13h',
    '14h',
    '15h',
    '16h',
    '17h',
  ];

  const fetchServices = async () => {
    try {
      const response = await serviceApi.getAllService();
      const fetchedServices = Array.isArray(response.data.result)
        ? response.data.result
            .filter(
              (service: any) =>
                service._id != null && service.service_name != null
            )
            .map((service: any) => ({
              id: service._id,
              name: service.service_name,
              price: service.service_price,
              duration: service.duration,
            }))
        : [];
      setServices(fetchedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách dịch vụ!',
      });
      setServices([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await orderDetailApi.getAllBookings();
      const bookingData = response.data.map((booking: any) => {
        const petTypes: { [key: string]: string } = {
          dog: 'Chó',
          cat: 'Mèo',
        };
        const petType =
          petTypes[booking.petType?.toLowerCase()] || booking.petType || 'N/A';
        const matchedService = services.find(
          (service) => service.name === booking.service?.name
        );

        let bookingMoment: moment.Moment | null = null;
        if (booking.booking_date) {
          bookingMoment = moment(booking.booking_date, moment.ISO_8601, true).tz('Asia/Ho_Chi_Minh');
          if (!bookingMoment.isValid()) {
            console.warn('Invalid booking_date:', booking.booking_date);
            bookingMoment = null;
          }
        }
        const bookingTime = bookingMoment ? bookingMoment.format('H[h]') : 'N/A';
        const bookingDate = bookingMoment ? bookingMoment.format('DD/MM/YYYY') : 'N/A';

        let orderDateMoment: moment.Moment | null = null;
        if (booking.order_date) {
          orderDateMoment = moment(booking.order_date, moment.ISO_8601, true).tz('Asia/Ho_Chi_Minh');
          if (!orderDateMoment.isValid()) {
            console.warn('Invalid order_date:', booking.order_date);
            orderDateMoment = null;
          }
        }
        const orderDateFormatted = orderDateMoment
          ? orderDateMoment.format('DD/MM/YYYY HH:mm:ss')
          : 'N/A';

        return {
          key: booking.orderId || 'N/A',
          id: booking.orderId || 'N/A',
          orderId: booking.orderId || 'N/A',
          username: booking.user?.name || 'Unknown User',
          phone: booking.user?.phone || 'Unknown Phone',
          orderDate: orderDateFormatted,
          serviceId: matchedService
            ? matchedService.id
            : booking.service?._id || 'N/A',
          serviceName: booking.service?.name || 'Unknown Service',
          bookingDate: bookingDate,
          bookingTime: bookingTime,
          estimatedPrice: booking.service?.price || 0,
          duration: booking.service?.duration || 0,
          bookingStatus: booking.bookingStatus
            ? booking.bookingStatus === 'PENDING'
              ? BookingStatus.PENDING
              : booking.bookingStatus === 'CONFIRMED'
              ? BookingStatus.CONFIRMED
              : booking.bookingStatus === 'IN_PROGRESS'
              ? BookingStatus.IN_PROGRESS
              : booking.bookingStatus === 'COMPLETED'
              ? BookingStatus.COMPLETED
              : BookingStatus.CANCELLED
            : BookingStatus.PENDING,
          petName: booking.petName || 'N/A',
          petType: petType,
          petWeight: booking.petWeight || 0,
          realPrice: booking.realPrice || undefined,
        };
      });
      setBookings(bookingData);
      setFilteredBookings(bookingData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách lịch hẹn!',
      });
    }
  };

  const fetchAvailableSlots = async (date: moment.Moment | null) => {
    if (!date || !date.isValid()) {
      setSlotAvailability({});
      return;
    }
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const response = await orderApi.getAvailableSlots(dateStr);
      setSlotAvailability(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách khung giờ, vui lòng thử lại!',
      });
      setSlotAvailability({});
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchServices();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      fetchBookings();
    }
  }, [services]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(moment().tz('Asia/Ho_Chi_Minh'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const normalizedSearchText = removeAccents(value.toLowerCase());
    const filtered = bookings.filter((booking) => {
      const normalizedServiceName = removeAccents(
        booking.serviceName.toLowerCase()
      );
      const normalizedUsername = removeAccents(booking.username.toLowerCase());
      const normalizedPetName = removeAccents(
        booking.petName?.toLowerCase() || ''
      );
      const normalizedPetType = removeAccents(
        booking.petType?.toLowerCase() || ''
      );
      return (
        normalizedServiceName.includes(normalizedSearchText) ||
        booking.orderId.toLowerCase().includes(normalizedSearchText) ||
        normalizedUsername.includes(normalizedSearchText) ||
        removeAccents(booking.bookingStatus.toLowerCase()).includes(
          normalizedSearchText
        ) ||
        normalizedPetName.includes(normalizedSearchText) ||
        normalizedPetType.includes(normalizedSearchText)
      );
    });
    setFilteredBookings(filtered);
  };

  const handleEdit = (record: Booking) => {
    setSelectedBooking(record);
    setIsEditMode(false);

    let parsedBookingDate: moment.Moment | null = null;
    if (record.bookingDate && record.bookingDate !== 'N/A') {
      const momentDate = moment(record.bookingDate, 'DD/MM/YYYY', true).tz('Asia/Ho_Chi_Minh');
      if (momentDate.isValid()) {
        parsedBookingDate = momentDate;
        setSelectedDate(momentDate);
        fetchAvailableSlots(momentDate);
      } else {
        console.warn('Invalid bookingDate:', record.bookingDate);
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }

    let parsedOrderDate: moment.Moment | null = null;
    if (record.orderDate && record.orderDate !== 'N/A') {
      const momentOrderDate = moment(record.orderDate, 'DD/MM/YYYY HH:mm:ss', true).tz('Asia/Ho_Chi_Minh');
      if (momentOrderDate.isValid()) {
        parsedOrderDate = momentOrderDate;
      } else {
        console.warn('Invalid orderDate:', record.orderDate);
      }
    }

    form.setFieldsValue({
      orderId: record.orderId,
      username: record.username,
      phone: record.phone,
      orderDate: parsedOrderDate,
      petName: record.petName,
      petType: record.petType,
      serviceId: record.serviceId,
      bookingDate: parsedBookingDate,
      bookingTime: record.bookingTime !== 'N/A' ? record.bookingTime : null,
      estimatedPrice: record.estimatedPrice
        ? record.estimatedPrice.toLocaleString('vi-VN') + ' VND'
        : '0 VND',
      duration: record.duration,
      bookingStatus: record.bookingStatus,
      realPrice: record.realPrice
        ? record.realPrice.toLocaleString('vi-VN') + ' VND'
        : 'Chưa tính',
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalOk = () => {
    if (!isEditMode) {
      handleModalCancel();
      return;
    }
    form.validateFields().then(async (values) => {
      if (selectedBooking) {
        try {
          const statusToSend =
            values.bookingStatus === BookingStatus.PENDING
              ? 'PENDING'
              : values.bookingStatus === BookingStatus.CONFIRMED
              ? 'CONFIRMED'
              : values.bookingStatus === BookingStatus.IN_PROGRESS
              ? 'IN_PROGRESS'
              : values.bookingStatus === BookingStatus.COMPLETED
              ? 'COMPLETED'
              : 'CANCELLED';

          const bookingDate = values.bookingDate
            ? values.bookingDate.format('YYYY-MM-DD')
            : '';
          const bookingTime = values.bookingTime
            ? `${parseInt(values.bookingTime.replace('h', ''))}:00`
            : '';

          const selectedServiceId = values.serviceId;
          const selectedService = services.find(
            (service) => service.id === selectedServiceId
          );
          const duration = selectedService?.duration || 60;
          const slotsNeeded = Math.ceil(duration / 60);
          const hour = parseInt(values.bookingTime.replace('h', ''), 10);

          for (let i = 0; i < slotsNeeded; i++) {
            const checkHour = hour + i;
            const checkTime = `${checkHour}h`;
            const slotsAvailable = slotAvailability[checkTime] || 0;
            if (slotsAvailable <= 0) {
              notification.error({
                message: 'Lỗi',
                description: `Khung giờ ${checkTime} không còn slot trống!`,
              });
              return;
            }
          }

          await orderDetailApi.updateBooking(
            selectedBooking.orderId,
            values.serviceId,
            values.petName,
            values.petType,
            bookingDate,
            bookingTime,
            statusToSend,
            values.username
          );

          const updatedBookings = bookings.map((b) =>
            b.orderId === selectedBooking.orderId
              ? {
                  ...b,
                  username: values.username,
                  serviceId: values.serviceId,
                  serviceName: selectedService?.name || b.serviceName,
                  estimatedPrice: selectedService?.price || b.estimatedPrice,
                  duration: selectedService?.duration || b.duration,
                  petName: values.petName,
                  petType: values.petType,
                  bookingStatus: values.bookingStatus,
                  bookingDate: values.bookingDate
                    ? values.bookingDate.format('DD/MM/YYYY')
                    : b.bookingDate,
                  bookingTime: values.bookingTime || b.bookingTime,
                }
              : b
          );
          setBookings(updatedBookings);
          setFilteredBookings(updatedBookings);
          setIsEditModalVisible(false);
          setIsEditMode(false);
          notification.success({
            message: 'Thành công',
            description: 'Thông tin đặt lịch đã được cập nhật!',
            placement: 'topRight',
            duration: 2,
          });
        } catch (error) {
          console.error('Error updating booking:', error);
          notification.error({
            message: 'Lỗi',
            description: 'Không thể cập nhật thông tin đặt lịch!',
          });
        }
      }
    });
  };

  const handleStart = (record: Booking) => {
    setSelectedBooking(record);
    startForm.setFieldsValue({
      petWeight: record.petWeight || 0,
    });
    setIsStartModalVisible(true);
  };

  const handleStartModalOk = () => {
    startForm.validateFields().then(async (values) => {
      if (selectedBooking) {
        try {
          const petWeight = Number(values.petWeight);
          if (isNaN(petWeight)) {
            throw new Error('Cân nặng không hợp lệ');
          }

          const requestData = {
            orderId: selectedBooking.orderId,
            petWeight,
            petType: selectedBooking.petType || 'Chó',
            serviceName: selectedBooking.serviceName,
          };
          console.log('Sending to /v1/realPrice:', requestData);

          if (!selectedBooking.orderId || selectedBooking.orderId === 'N/A') {
            throw new Error('Mã đơn hàng (orderId) không hợp lệ');
          }

          const realPriceResponse = await orderDetailApi.realPrice(
            selectedBooking.orderId,
            petWeight,
            selectedBooking.petType || 'Chó',
            selectedBooking.serviceName
          );

          if (!realPriceResponse.success || !realPriceResponse.data.realPrice) {
            throw new Error(
              realPriceResponse.message || 'Không thể tính giá thực tế'
            );
          }

          const statusRequestData = {
            orderId: selectedBooking.orderId,
            bookingStatus: 'IN_PROGRESS',
          };

          await orderDetailApi.changeBookingStatus(statusRequestData);

          const updatedBookings = bookings.map((b) =>
            b.orderId === selectedBooking.orderId
              ? {
                  ...b,
                  bookingStatus: BookingStatus.IN_PROGRESS,
                  petWeight: petWeight,
                  realPrice: realPriceResponse.data.realPrice,
                }
              : b
          );
          setBookings(updatedBookings);
          setFilteredBookings(updatedBookings);
          setIsStartModalVisible(false);
          notification.success({
            message: 'Thành công',
            description: `Đã bắt đầu dịch vụ! Giá thực tế: ${realPriceResponse.data.realPrice.toLocaleString(
              'vi-VN'
            )} VND`,
          });
        } catch (error) {
          console.error('Error starting service:', error);
          notification.error({
            message: 'Lỗi',
            description:
              error.response?.data?.message ||
              error.message ||
              'Không thể bắt đầu dịch vụ hoặc tính giá thực tế!',
          });
        }
      }
    });
  };

  const handleComplete = async (orderId: string) => {
    try {
      await orderDetailApi.changeBookingStatus({
        orderId: orderId,
        bookingStatus: 'COMPLETED',
      });
      const updatedBookings = bookings.map((b) =>
        b.orderId === orderId
          ? { ...b, bookingStatus: BookingStatus.COMPLETED }
          : b
      );
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      notification.success({
        message: 'Thành công',
        description: 'Đã cập nhật trạng thái thành Hoàn thành!',
      });
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể cập nhật trạng thái!',
      });
    }
  };

  const handleModalCancel = () => {
    setIsEditModalVisible(false);
    setIsStartModalVisible(false);
    setIsEditMode(false);
    setSelectedDate(null);
    setSlotAvailability({});
    form.resetFields();
    startForm.resetFields();
  };

  const handleDateChange = (date: moment.Moment | null) => {
    if (date && date.isValid()) {
      const newDate = moment.tz(
        {
          year: date.year(),
          month: date.month(),
          date: date.date(),
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh'
      );
      setSelectedDate(newDate);
      fetchAvailableSlots(newDate);
    } else {
      setSelectedDate(null);
      fetchAvailableSlots(null);
    }
    form.setFieldsValue({ bookingTime: undefined });
  };

  const handleTimeChange = (time: string) => {
    form.setFieldsValue({ bookingTime: time });
  };

  const handleServiceChange = (value: string) => {
    const selectedService = services.find((service) => service.id === value);
    form.setFieldsValue({
      estimatedPrice: selectedService?.price
        ? selectedService.price.toLocaleString('vi-VN') + ' VND'
        : '0 VND',
      duration: selectedService?.duration || 0,
    });
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title={
          <div className="flex items-center gap-4">
            <SearchBar searchText={searchText} onSearch={handleSearch} />
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        <BookingTable
          bookings={filteredBookings}
          onEdit={handleEdit}
          onStart={handleStart}
          onComplete={handleComplete}
        />
      </Card>

      <EditBookingModal
        visible={isEditModalVisible}
        isEditMode={isEditMode}
        booking={selectedBooking}
        services={services}
        petTypes={petTypes}
        form={form}
        selectedDate={selectedDate}
        slotAvailability={slotAvailability}
        availableTimeSlots={availableTimeSlots}
        currentDateTime={currentDateTime}
        onOk={handleEditModalOk}
        onCancel={handleModalCancel}
        onEditModeToggle={() => setIsEditMode(true)}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
        onServiceChange={handleServiceChange}
      />

      <StartServiceModal
        visible={isStartModalVisible}
        booking={selectedBooking}
        form={startForm}
        onOk={handleStartModalOk}
        onCancel={handleModalCancel}
      />
    </motion.div>
  );
};

export default BookingManager;
export { Booking, Service };