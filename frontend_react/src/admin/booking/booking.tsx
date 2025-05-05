import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Form, notification, Button, Spin } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { debounce } from 'lodash';
import orderDetailApi from '../../api/orderDetailApi';
import serviceApi from '../../api/serviceApi';
import orderApi from '../../api/orderApi';
import SearchBar from '../components/booking/SearchBar';
import BookingTable from '../components/booking/BookingTable';
import EditBookingModal from '../components/booking/EditBookingModal';
import StartServiceModal from '../components/booking/StartServiceModal';
import AddBookingModal from '../components/booking/AddBookingModal';
import { FaPlus } from "react-icons/fa";

dayjs.extend(utc);
dayjs.extend(timezone);

export enum BookingStatus {
  PENDING = 'ĐANG CHỜ',
  CONFIRMED = 'ĐÃ XÁC NHẬN',
  IN_PROGRESS = 'ĐANG THỰC HIỆN',
  COMPLETED = 'HOÀN THÀNH',
  CANCELLED = 'ĐÃ HỦY',
}

interface Booking {
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
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [petTypes, setPetTypes] = useState<string[]>(['Chó', 'Mèo', 'Khác']);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [startForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [slotAvailability, setSlotAvailability] = useState<{
    [key: string]: number;
  }>({});
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [isStarting, setIsStarting] = useState(false); // Trạng thái loading cho bắt đầu dịch vụ
  const [isCompleting, setIsCompleting] = useState(false); // Trạng thái loading cho hoàn thành dịch vụ

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

  const fetchAvailableSlotsRef = useRef(
    debounce(async (date: dayjs.Dayjs | null) => {
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
    }, 500)
  );

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
      const currentDateTime = dayjs().tz('Asia/Ho_Chi_Minh');
      const currentDate = currentDateTime.startOf('day'); // Lấy ngày hiện tại (bỏ giờ)

      const bookingData = response.data
        .map((booking: any) => {
          const petTypes: { [key: string]: string } = {
            dog: 'Chó',
            cat: 'Mèo',
          };
          const petType =
            petTypes[booking.petType?.toLowerCase()] || booking.petType || 'Khác';
          const matchedService = services.find(
            (service) => service.name === booking.service?.name
          );

          let bookingMoment: dayjs.Dayjs | null = null;
          if (booking.booking_date) {
            const cleanedBookingDate = booking.booking_date.replace(/\(.*\)/, '').trim();
            bookingMoment = dayjs(cleanedBookingDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]Z', true);
            if (!bookingMoment.isValid()) {
              bookingMoment = dayjs(cleanedBookingDate);
            }
            if (!bookingMoment.isValid()) {
              console.warn('Invalid booking_date:', booking.booking_date);
              bookingMoment = null;
            } else {
              bookingMoment = bookingMoment.tz('Asia/Ho_Chi_Minh');
            }
          }
          const bookingTime = bookingMoment ? bookingMoment.format('H[h]') : 'N/A';
          const bookingDate = bookingMoment ? bookingMoment.format('DD/MM/YYYY') : 'N/A';

          let orderDateMoment: dayjs.Dayjs | null = null;
          if (booking.order_date) {
            orderDateMoment = dayjs(booking.order_date);
            if (!orderDateMoment.isValid()) {
              orderDateMoment = dayjs(booking.order_date, 'ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)', true);
              if (!orderDateMoment.isValid()) {
                console.warn('Invalid order_date:', booking.order_date);
                orderDateMoment = null;
              }
            }
            if (orderDateMoment) {
              orderDateMoment = orderDateMoment.tz('Asia/Ho_Chi_Minh');
            }
          }
          const orderDateFormatted = orderDateMoment
            ? orderDateMoment.format('DD/MM/YYYY HH:mm:ss')
            : 'N/A';

          return {
            key: booking.orderId || 'N/A',
            id: booking.orderId || 'N/A',
            orderId: booking.orderId || 'N/A',
            fullname: booking.fullname || booking.user?.name || 'Unknown User',
            phone: booking.user?.phone || booking.phone || 'Unknown Phone',
            email: booking.user?.email || booking.email || '',
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
            bookingMoment,
          };
        })
        .filter((booking: Booking) => {
          // Lọc các lịch hẹn chưa qua thời gian và từ ngày hiện tại trở đi
          if (!booking.bookingMoment || !booking.bookingMoment.isValid()) {
            return false;
          }
          const bookingEndTime = booking.bookingMoment.add(booking.duration || 0, 'minute');
          const bookingDateMoment = booking.bookingMoment.startOf('day');
          return (
            bookingEndTime.isAfter(currentDateTime) && // Chưa qua thời gian kết thúc
            (bookingDateMoment.isSame(currentDate, 'day') || bookingDateMoment.isAfter(currentDate, 'day')) // Từ ngày hiện tại trở đi
          );
        })
        .sort((a: Booking, b: Booking) => {
          // Sắp xếp theo orderDate giảm dần (mới nhất trước)
          const dateA = a.orderDate && a.orderDate !== 'N/A'
            ? dayjs(a.orderDate, 'DD/MM/YYYY HH:mm:ss').tz('Asia/Ho_Chi_Minh')
            : dayjs(0);
          const dateB = b.orderDate && b.orderDate !== 'N/A'
            ? dayjs(b.orderDate, 'DD/MM/YYYY HH:mm:ss').tz('Asia/Ho_Chi_Minh')
            : dayjs(0);
          return dateB.valueOf() - dateA.valueOf(); // Giảm dần
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

  const handleSearch = (value: string) => {
    setSearchText(value);
    const normalizedSearchText = removeAccents(value.toLowerCase());
    const filtered = bookings.filter((booking) => {
      const normalizedServiceName = removeAccents(
        booking.serviceName.toLowerCase()
      );
      const normalizedFullname = removeAccents(booking.fullname.toLowerCase());
      const normalizedPetName = removeAccents(
        booking.petName?.toLowerCase() || ''
      );
      const normalizedPetType = removeAccents(
        booking.petType?.toLowerCase() || ''
      );
      return (
        normalizedServiceName.includes(normalizedSearchText) ||
        booking.orderId.toLowerCase().includes(normalizedSearchText) ||
        normalizedFullname.includes(normalizedSearchText) ||
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

    let parsedBookingDate: dayjs.Dayjs | null = null;
    if (record.bookingDate && record.bookingDate !== 'N/A') {
      parsedBookingDate = dayjs(record.bookingDate, 'DD/MM/YYYY', true).tz('Asia/Ho_Chi_Minh');
      if (!parsedBookingDate.isValid()) {
        console.warn('Invalid bookingDate in handleEdit:', record.bookingDate);
        parsedBookingDate = null;
      }
    }

    let parsedOrderDate: dayjs.Dayjs | null = null;
    if (record.orderDate && record.orderDate !== 'N/A') {
      parsedOrderDate = dayjs(record.orderDate, 'DD/MM/YYYY HH:mm:ss', true).tz('Asia/Ho_Chi_Minh');
      if (!parsedOrderDate.isValid()) {
        console.warn('Invalid orderDate:', record.orderDate);
        parsedOrderDate = null;
      }
    }

    form.setFieldsValue({
      orderId: record.orderId || 'N/A',
      fullname: record.fullname || 'Unknown User',
      email: record.email || '',
      phone: record.phone || 'Unknown Phone',
      orderDate: parsedOrderDate,
      petName: record.petName || 'N/A',
      petType: record.petType || 'Khác',
      serviceId: record.serviceId || 'N/A',
      bookingDate: parsedBookingDate,
      bookingTime: record.bookingTime && record.bookingTime !== 'N/A' ? record.bookingTime : undefined,
      estimatedPrice: record.estimatedPrice
        ? record.estimatedPrice.toLocaleString('vi-VN') + ' VND'
        : '0 VND',
      duration: record.duration || 0,
      bookingStatus: record.bookingStatus || BookingStatus.PENDING,
      realPrice: record.realPrice
        ? record.realPrice.toLocaleString('vi-VN') + ' VND'
        : 'Chưa tính',
    });

    setSelectedDate(parsedBookingDate);
    if (parsedBookingDate && parsedBookingDate.isValid()) {
      fetchAvailableSlotsRef.current(parsedBookingDate);
    } else {
      setSlotAvailability({});
    }

    setIsEditModalVisible(true);
  };

  const handleAdd = () => {
    addForm.resetFields();
    setSelectedDate(null);
    setSlotAvailability({});
    setIsAddModalVisible(true);
  };

  const handleAddModalOk = () => {
    addForm.validateFields().then(async (values) => {
      try {
        if (!values.fullname) {
          throw new Error('Tên người đặt không được để trống');
        }
  
        const bookingDateTime = dayjs(
          `${values.bookingDate.format('YYYY-MM-DD')} ${values.bookingTime.replace('h', ':00')}`,
          'YYYY-MM-DD H:mm'
        ).tz('Asia/Ho_Chi_Minh');
  
        const newBookingData = {
          payment_typeID: null,
          orderdate: dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'),
          infoUserGuest: {
            fullName: values.fullname, // Sử dụng fullname từ form
            phone: values.phone,
            email: values.email || null,
          },
          orderDetails: [
            {
              serviceId: values.serviceId,
              quantity: 1,
              booking_date: bookingDateTime.format('YYYY-MM-DD HH:mm:ss'),
              petName: values.petName,
              petType: values.petType,
            },
          ],
        };
  
        const response = await orderApi.create(newBookingData);
  
        const newBooking: Booking = {
          key: response.data.order._id,
          id: response.data.order._id,
          orderId: response.data.order._id,
          fullname: values.fullname, // Sử dụng fullname từ form
          phone: values.phone,
          orderDate: dayjs().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss'),
          serviceId: values.serviceId,
          serviceName: services.find((s) => s.id === values.serviceId)?.name || 'Unknown Service',
          bookingDate: values.bookingDate.format('DD/MM/YYYY'),
          bookingTime: values.bookingTime,
          estimatedPrice: services.find((s) => s.id === values.serviceId)?.price || 0,
          duration: services.find((s) => s.id === values.serviceId)?.duration || 0,
          bookingStatus: BookingStatus.CONFIRMED,
          petName: values.petName,
          petType: values.petType,
          petWeight: 0,
          email: values.email || '',
        };
  
        const updatedBookings = [newBooking, ...bookings];
        setBookings(updatedBookings);
        setFilteredBookings(updatedBookings);
        setIsAddModalVisible(false);
        notification.success({
          message: 'Thành công',
          description: 'Thêm lịch hẹn mới thành công!',
        });
      } catch (error) {
        console.error('Error adding booking:', error);
        notification.error({
          message: 'Lỗi',
          description: error.response?.data?.message || 'Không thể thêm lịch hẹn mới!',
        });
      }
    }).catch((error) => {
      console.error('Form validation failed:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng kiểm tra lại các trường thông tin!',
      });
    });
  };

  const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
    setSelectedDate(null);
    setSlotAvailability({});
    addForm.resetFields();
  };

  const handleEditModalOk = () => {
    if (!isEditMode) {
      notification.info({
        message: 'Thông báo',
        description: 'Vui lòng nhấn "Chỉnh sửa" để thay đổi thông tin!',
      });
      handleModalCancel();
      return;
    }
    form.validateFields().then(async (values) => {
      if (selectedBooking) {
        try {
          console.log('Form values:', values);
          const updateData: any = { orderId: String(selectedBooking.orderId) };

          if (values.serviceId && values.serviceId !== selectedBooking.serviceId) {
            updateData.serviceId = values.serviceId;
          }
          if (values.petName && values.petName !== selectedBooking.petName) {
            updateData.petName = values.petName;
          }
          if (values.petType && values.petType !== selectedBooking.petType) {
            updateData.petType = values.petType;
          }
          if (values.fullname && values.fullname !== selectedBooking.fullname) {
            updateData.fullname = values.fullname;
            console.log('Updating fullname:', values.fullname);
          }
          if (values.bookingDate && values.bookingTime) {
            const newBookingDateTime = dayjs(
              `${values.bookingDate.format('YYYY-MM-DD')} ${values.bookingTime.replace('h', ':00')}`,
              'YYYY-MM-DD H:mm'
            ).tz('Asia/Ho_Chi_Minh');
            updateData.bookingDate = newBookingDateTime.format('YYYY-MM-DD HH:mm:ss');
          }
          if (values.bookingStatus && values.bookingStatus !== selectedBooking.bookingStatus) {
            updateData.bookingStatus = values.bookingStatus;
          }

          console.log('Sending updateData:', updateData);
          const response = await orderDetailApi.updateBooking(updateData);
          console.log('API response:', response);

          await fetchBookings();

          setIsEditModalVisible(false);
          notification.success({
            message: 'Thành công',
            description: 'Cập nhật thông tin đặt lịch thành công!',
          });
        } catch (error) {
          console.error('Error updating booking:', error);
          const errorMessage = error.response?.data?.message || 'Không thể cập nhật thông tin đặt lịch!';
          notification.error({
            message: 'Lỗi',
            description: errorMessage,
          });
        }
      }
    }).catch((error) => {
      console.error('Form validation failed:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng kiểm tra lại các trường thông tin!',
      });
    });
  };

  const handleStart = (record: Booking) => {
    const currentDateTime = dayjs().tz('Asia/Ho_Chi_Minh');

    let bookingMoment: dayjs.Dayjs | null = null;
    if (record.bookingDate && record.bookingDate !== 'N/A' && record.bookingTime && record.bookingTime !== 'N/A') {
      const [day, month, year] = record.bookingDate.split('/');
      const bookingTime = record.bookingTime.replace('h', ':00');
      const bookingDateTimeStr = `${year}-${month}-${day} ${bookingTime}`;
      bookingMoment = dayjs(bookingDateTimeStr, 'YYYY-MM-DD H:mm').tz('Asia/Ho_Chi_Minh');

      if (!bookingMoment.isValid()) {
        console.warn('Invalid booking date/time:', record.bookingDate, record.bookingTime);
        notification.error({
          message: 'Lỗi',
          description: 'Thời gian đặt lịch không hợp lệ!',
        });
        return;
      }

      if (currentDateTime.isBefore(bookingMoment)) {
        notification.error({
          message: 'Lỗi',
          description: 'Chưa tới giờ đặt lịch, không thể bắt đầu dịch vụ!',
        });
        return;
      }
    } else {
      notification.error({
        message: 'Lỗi',
        description: 'Thông tin thời gian đặt lịch không hợp lệ!',
      });
      return;
    }

    if (record.bookingStatus !== BookingStatus.CONFIRMED) {
      notification.error({
        message: 'Lỗi',
        description: 'Chỉ có thể bắt đầu dịch vụ với lịch hẹn đã xác nhận!',
      });
      return;
    }

    setSelectedBooking(record);
    startForm.setFieldsValue({
      petWeight: record.petWeight || 0,
    });
    setIsStartModalVisible(true);
  };

  const handleStartModalOk = () => {
    startForm.validateFields().then(async (values) => {
      if (selectedBooking) {
        setIsStarting(true); // Bật trạng thái loading
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
        } finally {
          setIsStarting(false); // Tắt trạng thái loading
        }
      }
    });
  };

  const handleComplete = async (orderId: string) => {
    setIsCompleting(true); // Bật trạng thái loading
    try {
      const response = await orderDetailApi.changeBookingStatus({
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
      console.error('Error completing booking:', error);

      try {
        await fetchBookings();
        const updatedBooking = bookings.find((b) => b.orderId === orderId);
        if (updatedBooking?.bookingStatus === BookingStatus.COMPLETED) {
          notification.success({
            message: 'Thành công',
            description: 'Trạng thái đã được cập nhật thành Hoàn thành!',
          });
          return;
        }
      } catch (refreshError) {
        console.error('Error refreshing bookings:', refreshError);
      }

      notification.error({
        message: 'Lỗi',
        description:
          error.response?.data?.message || 'Không thể cập nhật trạng thái!',
      });
    } finally {
      setIsCompleting(false); // Tắt trạng thái loading
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

  const handleDateChange = useCallback((date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
    fetchAvailableSlotsRef.current(date);
  }, []);

  const handleTimeChange = useCallback(
    (time: string) => {
      form.setFieldsValue({ bookingTime: time });
      addForm.setFieldsValue({ bookingTime: time });
    },
    [form, addForm]
  );

  const handleServiceChange = useCallback(
    (value: string) => {
      const selectedService = services.find((service) => service.id === value);
      form.setFieldsValue({
        estimatedPrice: selectedService?.price
          ? selectedService.price.toLocaleString('vi-VN') + ' VND'
          : '0 VND',
        duration: selectedService?.duration || 0,
      });
      addForm.setFieldsValue({
        estimatedPrice: selectedService?.price
          ? selectedService.price.toLocaleString('vi-VN') + ' VND'
          : '0 VND',
        duration: selectedService?.duration || 0,
      });
      if (selectedDate) {
        fetchAvailableSlotsRef.current(selectedDate);
      }
    },
    [services, selectedDate, form, addForm]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Spin spinning={isStarting || isCompleting} tip={isStarting ? "Đang bắt đầu dịch vụ..." : "Đang hoàn thành dịch vụ..."}>
        <Card
          title={
            <div className="flex justify-between items-center gap-4">
              <SearchBar searchText={searchText} onSearch={handleSearch} />
              <Button type="primary" onClick={handleAdd}>
                <FaPlus />Thêm
              </Button>
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
          currentDateTime={dayjs().tz('Asia/Ho_Chi_Minh')}
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

        <AddBookingModal
          visible={isAddModalVisible}
          services={services}
          petTypes={petTypes}
          form={addForm}
          selectedDate={selectedDate}
          slotAvailability={slotAvailability}
          availableTimeSlots={availableTimeSlots}
          currentDateTime={dayjs().tz('Asia/Ho_Chi_Minh')}
          onOk={handleAddModalOk}
          onCancel={handleAddModalCancel}
          onDateChange={handleDateChange}
          onTimeChange={handleTimeChange}
          onServiceChange={handleServiceChange}
        />
      </Spin>
    </motion.div>
  );
};

export default BookingManager;
export { Booking, Service };