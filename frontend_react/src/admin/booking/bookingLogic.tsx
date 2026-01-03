import { useState, useEffect, useCallback, useRef } from 'react';
import { Form, notification } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import orderDetailApi from '../../api/orderDetailApi';
import serviceApi from '../../api/serviceApi';
import orderApi from '../../api/orderApi';
import { Booking, Service, BookingStatus } from './bookingTypes';
import { removeAccents, availableTimeSlots } from './bookingTypes';
import debounce from 'lodash/debounce';
dayjs.extend(utc);
dayjs.extend(timezone);

export const useBookingLogic = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchText, setSearchText] = useState('');
  const [slotAvailability, setSlotAvailability] = useState<{ [key: string]: number }>({});
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [form] = Form.useForm();
  const [startForm] = Form.useForm();
  const [addForm] = Form.useForm();

  // lấy slot
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

  // lấy dịch vụ
  const fetchServices = async () => {
    try {
      const response = await serviceApi.getAllService();
      const fetchedServices = Array.isArray(response.data.result)
        ? response.data.result
          .filter((service: any) => service._id != null && service.service_name != null)
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

  // lấy booking
  const fetchBookings = async () => {
    try {
      const response = await orderDetailApi.getAllBookings();
      const grouped: { [orderId: string]: any } = {};
      response.data.forEach((detail: any) => {
        const orderId = detail.orderId;

        if (!grouped[orderId]) {
          grouped[orderId] = {
            orderId,
            orderCode: detail.orderCode || 'N/A',
            fullname: detail.fullname || 'Unknown',
            phone: detail.phone || 'Unknown',
            email: detail.email || '',
            orderDate: detail.order_date
              ? dayjs(detail.order_date).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')
              : 'N/A',
            bookingStatus: detail.bookingStatus || BookingStatus.PENDING,
            petsCount: 0,
            details: [],
          };
        }
        grouped[orderId].petsCount += 1;
        grouped[orderId].details.push(detail);
      });
      const bookingData = Object.values(grouped).map((group: any) => {
        const firstDetail = group.details[0];
        const service = services.find(s =>
          s.id === firstDetail.serviceId?._id ||
          s.id === firstDetail.serviceId ||
          s.name === firstDetail.service?.name
        );
        const bookingMoment = firstDetail.booking_date
          ? dayjs(firstDetail.booking_date).tz('Asia/Ho_Chi_Minh')
          : null;

        return {
          key: group.orderId,
          id: group.orderId,
          orderId: group.orderId,
          orderCode: group.orderCode,
          fullname: group.fullname,
          phone: group.phone,
          email: group.email,
          orderDate: group.orderDate,
          serviceId: service?.id || 'N/A',
          serviceName: service?.name || firstDetail.service?.name || 'Unknown Service',
          bookingDate: bookingMoment ? bookingMoment.format('DD/MM/YYYY') : 'N/A',
          bookingTime: bookingMoment ? `${bookingMoment.hour()}h` : 'N/A',
          bookingStart: bookingMoment ? bookingMoment.format('HH:mm') : 'N/A',
          estimatedPrice: service?.price || 0,
          duration: service?.duration || 0,
          bookingStatus: group.bookingStatus,
          petName: firstDetail.petName || 'N/A',
          petType: firstDetail.petType || 'Khác',
          petWeight: firstDetail.petWeight || 0,
          realPrice: firstDetail.realPrice || undefined,
          petsCount: group.petsCount,
          bookingMoment,
        };
      });

      bookingData.sort((a, b) => {
        const dateA = a.orderDate !== 'N/A' ? dayjs(a.orderDate, 'DD/MM/YYYY HH:mm:ss') : dayjs(0);
        const dateB = b.orderDate !== 'N/A' ? dayjs(b.orderDate, 'DD/MM/YYYY HH:mm:ss') : dayjs(0);
        return dateB.valueOf() - dateA.valueOf();
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

  // tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
    const normalizedSearchText = removeAccents(value.toLowerCase());
    const filtered = bookings.filter((booking) => {
      const normalizedServiceName = removeAccents(booking.serviceName.toLowerCase());
      const normalizedFullname = removeAccents(booking.fullname.toLowerCase());
      const normalizedPetName = removeAccents(booking.petName?.toLowerCase() || '');
      const normalizedPetType = removeAccents(booking.petType?.toLowerCase() || '');
      return (
        normalizedServiceName.includes(normalizedSearchText) ||
        booking.orderId.toLowerCase().includes(normalizedSearchText) ||
        normalizedFullname.includes(normalizedSearchText) ||
        removeAccents(booking.bookingStatus.toLowerCase()).includes(normalizedSearchText) ||
        normalizedPetName.includes(normalizedSearchText) ||
        normalizedPetType.includes(normalizedSearchText)
      );
    });
    setFilteredBookings(filtered);
  };

  // chỉnh sửa
  const handleEdit = async (record: Booking) => {
    setSelectedBooking(record);
    form.setFieldsValue({
      fullname: record.fullname || '',
      phone: record.phone || '',
      email: record.email || '',
      orderDate: record.orderDate !== 'N/A'
        ? dayjs(record.orderDate, 'DD/MM/YYYY HH:mm:ss').tz('Asia/Ho_Chi_Minh')
        : null,
      bookingStatus: record.bookingStatus as BookingStatus || BookingStatus.PENDING,
    });
    try {
      const response = await orderDetailApi.getAllBookings();
      const allDetails = response.data;
      const orderDetails = allDetails.filter((detail: any) => detail.orderId === record.orderId);

      if (orderDetails && orderDetails.length > 0) {
        const pets = orderDetails.map((detail: any) => {
          const bookingMoment = detail.booking_date
            ? dayjs(detail.booking_date).tz('Asia/Ho_Chi_Minh')
            : null;

          return {
            orderDetailId: detail.orderDetailId || detail._id,
            petName: detail.petName || '',
            petType: detail.petType || 'Chó',
            service: detail.service?._id || detail.serviceId || undefined,
            date: bookingMoment,
            hour: bookingMoment ? bookingMoment.hour() : 8,
            minute: bookingMoment
              ? Math.floor(bookingMoment.minute() / 15) * 15
              : 0,
            time: bookingMoment ? bookingMoment.format('HH:mm') : '08:00',
          };
        });
        form.setFieldsValue({ pets });
        if (pets[0]?.date && pets[0].date.isValid()) {
          setSelectedDate(pets[0].date);
          fetchAvailableSlotsRef.current(pets[0].date);
        }
      } else {
        throw new Error('Không có dữ liệu thú cưng');
      }
    } catch (error) {
      console.error('Error loading pet details for edit:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không tải được thông tin thú cưng!',
      });
      form.setFieldsValue({
        pets: [{
          petName: '',
          petType: 'Chó',
          service: undefined,
          date: null,
          time: undefined,
        }]
      });
    }
  };

  // thêm mới
  const handleAdd = () => {
    addForm.resetFields();
    setSelectedDate(null);
    addForm.setFieldsValue({
      pets: [{
        petName: '',
        petType: 'Chó',
        service: undefined,
        date: null,
        hour: 8,
        minute: 0,
        time: '08:00',
      }]
    });
  };

  // hàm add
  const handleAddModalOk = async (): Promise<boolean> => {
    try {
      const values = await addForm.validateFields();
      const pets: any[] = values.pets || [];
      if (pets.length === 0) {
        notification.error({ message: 'Lỗi', description: 'Phải có ít nhất 1 thú cưng!' });
        return false;
      }
      for (const pet of pets) {
        if (!pet.date || pet.hour === undefined || pet.minute === undefined || !pet.service) {
          notification.error({ message: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin cho tất cả thú cưng!' });
          return false;
        }

        const service = services.find(s => s.id === pet.service);
        if (!service) {
          notification.error({ message: 'Lỗi', description: 'Dịch vụ không hợp lệ!' });
          return false;
        }

        const duration = service.duration || 60;
        const slotsNeeded = Math.ceil(duration / 15);
        let currentHour = pet.hour;
        let currentMinute = pet.minute;

        for (let i = 0; i < slotsNeeded; i++) {
          const timeKey = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
          const available = slotAvailability.hasOwnProperty(timeKey)
            ? slotAvailability[timeKey]
            : 5;
          if (available <= 0) {
            notification.error({
              message: 'Không đủ slot!',
              description: `Khung giờ ${timeKey} không còn chỗ. Vui lòng chọn giờ khác!`,
            });
            return false;
          }
          currentMinute += 15;
          if (currentMinute >= 60) {
            currentMinute -= 60;
            currentHour += 1;
          }
          if (currentHour > 17 || (currentHour === 17 && currentMinute > 45)) {
            notification.error({
              message: 'Giờ kết thúc vượt quá khung làm việc!',
              description: 'Dịch vụ này kéo dài quá giờ đóng cửa (17:45).',
            });
            return false;
          }
        }
      }
      const orderDetails = pets.map(pet => {
        const hour = pet.hour ?? 8;
        const minute = pet.minute ?? 0;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const bookingDateTime = dayjs(
          `${pet.date.format('YYYY-MM-DD')} ${timeString}`
        ).tz('Asia/Ho_Chi_Minh');

        return {
          serviceId: pet.service,
          quantity: 1,
          booking_date: bookingDateTime.format('YYYY-MM-DD HH:mm:ss'),
          petName: pet.petName,
          petType: pet.petType,
        };
      });
      const newBookingData = {
        payment_typeID: null,
        orderdate: dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'),
        infoUserGuest: {
          fullName: values.fullname,
          phone: values.phone,
          email: values.email || null,
        },
        orderDetails,
      };
      await orderApi.create(newBookingData);
      await fetchBookings();
      notification.success({
        message: 'Thành công',
        description: `Đã thêm lịch hẹn cho ${pets.length} thú cưng!`,
      });
      return true;
    } catch (error: any) {
      console.error('Error adding booking:', error);
      notification.error({
        message: 'Lỗi',
        description: error.response?.data?.message || 'Không thể thêm lịch hẹn!',
      });
      return false;
    }
  };

  const handleAddModalCancel = () => {
    setSelectedDate(null);
    setSlotAvailability({});
    addForm.resetFields();
  };

  // chỉnh sửa
  const handleEditModalOk = async (): Promise<boolean> => {
    try {
      const values = await form.validateFields();
      if (!selectedBooking?.orderId) {
        notification.error({ message: 'Lỗi', description: 'Không tìm thấy mã đơn hàng!' });
        return false;
      }
      const pets = values.pets || [];
      if (pets.length === 0) {
        notification.error({ message: 'Lỗi', description: 'Phải có ít nhất 1 thú cưng!' });
        return false;
      }
      const petsForUpdate = pets.map((pet: any) => ({
        orderDetailId: pet.orderDetailId || undefined,
        serviceId: pet.service,
        petName: pet.petName,
        petType: pet.petType,
        date: pet.date?.format('YYYY-MM-DD') || undefined,
        hour: pet.hour,
        minute: pet.minute,
      }));
      await orderDetailApi.updateBooking({
        orderId: selectedBooking.orderId,
        fullname: values.fullname,
        phone: values.phone,
        email: values.email,
        bookingStatus: values.bookingStatus,
        pets: petsForUpdate,
      });
      await fetchBookings();
      notification.success({
        message: 'Thành công!',
        description: `Đã cập nhật lịch hẹn (${pets.length} thú cưng)`,
      });
      return true;
    } catch (error: any) {
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể cập nhật!',
      });
      return false;
    }
  };

  const handleStart = (record: Booking) => {
    setSelectedBooking(record);
    let bookingMoment: dayjs.Dayjs | null = null;
    if (record.bookingDate !== 'N/A' && record.bookingTime !== 'N/A') {
      const [day, month, year] = record.bookingDate.split('/');
      const time = record.bookingTime.replace('h', ':00');
      bookingMoment = dayjs(`${year}-${month}-${day} ${time}`).tz('Asia/Ho_Chi_Minh');
    }
    if (!bookingMoment?.isValid() || record.bookingStatus !== BookingStatus.CONFIRMED) {
      notification.error({ message: 'Lỗi', description: 'Không thể bắt đầu dịch vụ!' });
      return;
    }
    startForm.setFieldsValue({ petWeight: record.petWeight || 0 });
  };

  const handleStartModalOk = () => {
    startForm.validateFields().then(async (values) => {
      setIsStarting(true);
      try {
        const petWeight = Number(values.petWeight);
        if (isNaN(petWeight)) throw new Error('Cân nặng không hợp lệ');

        const realPriceResponse = await orderDetailApi.realPrice(selectedBooking!.orderId, petWeight, selectedBooking!.petType || 'Chó', selectedBooking!.serviceName);
        if (!realPriceResponse.success || !realPriceResponse.data.realPrice) throw new Error('Không thể tính giá thực tế');

        await orderDetailApi.changeBookingStatus({ orderId: selectedBooking!.orderId, bookingStatus: 'IN_PROGRESS' });

        const updated = bookings.map(b => b.orderId === selectedBooking!.orderId ? { ...b, bookingStatus: BookingStatus.IN_PROGRESS, petWeight, realPrice: realPriceResponse.data.realPrice } : b);
        setBookings(updated);
        setFilteredBookings(updated);
        notification.success({ message: 'Thành công', description: `Đã bắt đầu dịch vụ! Giá thực tế: ${realPriceResponse.data.realPrice.toLocaleString('vi-VN')} VND` });
        return true;
      } catch (error: any) {
        notification.error({ message: 'Lỗi', description: error.message || 'Không thể bắt đầu dịch vụ!' });
      } finally {
        setIsStarting(false);
        return false;
      }
    });
  };

  const handleComplete = async (orderId: string) => {
    setIsCompleting(true);
    try {
      await orderDetailApi.changeBookingStatus({ orderId, bookingStatus: 'COMPLETED' });
      const updated = bookings.map(b => b.orderId === orderId ? { ...b, bookingStatus: BookingStatus.COMPLETED } : b);
      setBookings(updated);
      setFilteredBookings(updated);
      notification.success({ message: 'Thành công', description: 'Đã hoàn thành!' });
    } catch {
      await fetchBookings();
      notification.error({ message: 'Lỗi', description: 'Không thể cập nhật trạng thái!' });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleModalCancel = () => {
    setSelectedBooking(null);
    setSelectedDate(null);
    setSlotAvailability({});
    form.resetFields();
    startForm.resetFields();
  };

  const handleDateChange = useCallback((date: dayjs.Dayjs | null, index?: number) => {
    if (date && date.isValid()) {
      setSelectedDate(date);
      fetchAvailableSlotsRef.current(date);
    } else {
      setSlotAvailability({});
    }

    if (index !== undefined && addForm) {
      const pets = addForm.getFieldValue('pets') || [];
      if (pets[index]) {
        pets[index] = {
          ...pets[index],
          date,
          hour: undefined,
          minute: undefined,
          time: undefined,
        };
        addForm.setFieldsValue({ pets });
      }
    }
  }, [addForm]);

  const handleTimeChange = useCallback((
    value: number,
    field: 'hour' | 'minute',
    index?: number
  ) => {
    if (index === undefined) return;
    const pets = addForm.getFieldValue('pets') || [];
    if (!pets[index]) return;

    if (field === 'hour') {
      pets[index].hour = value;
    } else if (field === 'minute') {
      pets[index].minute = value;
    }
    const hour = pets[index].hour ?? 8;
    const minute = pets[index].minute ?? 0;
    pets[index].time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    addForm.setFieldsValue({ pets });
  }, [addForm]);

  const handleServiceChange = useCallback((value: string, index?: number) => {
    if (index !== undefined) {
      const pets = addForm.getFieldValue('pets') || [];
      pets[index] = { ...pets[index], service: value };
      addForm.setFieldsValue({ pets });
    }
    const selectedService = services.find(s => s.id === value);
    if (selectedService && index === undefined) {
      const priceStr = `${selectedService.price.toLocaleString('vi-VN')} VND`;
      addForm.setFieldsValue({ estimatedPrice: priceStr, duration: selectedService.duration || 0 });
    }
  }, [services, addForm]);
  useEffect(() => { fetchServices(); }, []);
  useEffect(() => { if (services.length > 0) fetchBookings(); }, [services]);

  return {
    bookings, filteredBookings, services, searchText, setSearchText,
    selectedDate, slotAvailability, isStarting, isCompleting,
    form, startForm, addForm,
    availableTimeSlots,
    handleSearch, handleEdit, handleAdd, handleAddModalOk, handleAddModalCancel,
    handleEditModalOk, handleStart, handleStartModalOk, handleComplete,
    handleModalCancel, handleDateChange, handleTimeChange, handleServiceChange,
    fetchBookings, selectedBooking,
  };
};