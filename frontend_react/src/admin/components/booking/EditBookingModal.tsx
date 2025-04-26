import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Booking, BookingStatus, Service } from '../../booking/booking';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

interface EditBookingModalProps {
  visible: boolean;
  isEditMode: boolean;
  booking: Booking | null;
  services: Service[];
  petTypes: string[];
  form: any;
  selectedDate: dayjs.Dayjs | null;
  slotAvailability: { [key: string]: number };
  availableTimeSlots: string[];
  currentDateTime: dayjs.Dayjs;
  onOk: () => void;
  onCancel: () => void;
  onEditModeToggle: () => void;
  onDateChange: (date: dayjs.Dayjs | null) => void;
  onTimeChange: (time: string) => void;
  onServiceChange: (value: string) => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  visible,
  isEditMode,
  booking,
  services,
  petTypes,
  form,
  selectedDate,
  slotAvailability,
  availableTimeSlots,
  currentDateTime,
  onOk,
  onCancel,
  onEditModeToggle,
  onDateChange,
  onTimeChange,
  onServiceChange,
}) => {
  const [tempSelectedDate, setTempSelectedDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    if (booking) {
      console.log('booking:', booking); // Debug
      console.log('booking.email:', booking.email); // Debug email
      let orderDateInLocal: dayjs.Dayjs | null = dayjs().tz('Asia/Ho_Chi_Minh');
      let bookingDateInLocal: dayjs.Dayjs | null = null;

      if (booking.orderDate && booking.orderDate !== 'N/A') {
        orderDateInLocal = dayjs(booking.orderDate, 'DD/MM/YYYY HH:mm:ss', true).tz('Asia/Ho_Chi_Minh');
        if (!orderDateInLocal.isValid()) {
          console.error('Invalid orderDate:', booking.orderDate);
          orderDateInLocal = dayjs().tz('Asia/Ho_Chi_Minh');
        }
      }

      if (booking.bookingDate && booking.bookingDate !== 'N/A') {
        bookingDateInLocal = dayjs(booking.bookingDate, 'DD/MM/YYYY', true).tz('Asia/Ho_Chi_Minh');
        if (!bookingDateInLocal.isValid()) {
          console.log('Trying YYYY-MM-DD format for bookingDate:', booking.bookingDate);
          bookingDateInLocal = dayjs(booking.bookingDate, 'YYYY-MM-DD', true).tz('Asia/Ho_Chi_Minh');
          if (!bookingDateInLocal.isValid()) {
            console.error('Invalid bookingDate:', booking.bookingDate);
            bookingDateInLocal = null;
          }
        }
      }

      form.setFieldsValue({
        orderId: booking.orderId,
        fullname: booking.fullname, // Rõ ràng sử dụng fullname
        email: booking.email || '',
        phone: booking.phone,
        petName: booking.petName,
        petType: booking.petType,
        bookingStatus: booking.bookingStatus,
        orderDate: orderDateInLocal,
        bookingDate: bookingDateInLocal,
        serviceId: booking.serviceId,
        bookingTime: booking.bookingTime,
        estimatedPrice: booking.estimatedPrice
          ? booking.estimatedPrice.toLocaleString('vi-VN') + ' VND'
          : '0 VND',
        duration: booking.duration,
        realPrice: booking.realPrice
          ? booking.realPrice.toLocaleString('vi-VN') + ' VND'
          : 'Chưa tính',
      });

      setTempSelectedDate(bookingDateInLocal);
    }
  }, [booking, form]);

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !selectedDate.isValid()) return availableTimeSlots;

    const isToday = selectedDate.isSame(currentDateTime, 'day');
    let baseSlots = availableTimeSlots;

    if (isToday) {
      const currentHour = currentDateTime.hour();
      baseSlots = availableTimeSlots.filter((time) => {
        const hour = parseInt(time.replace('h', ''), 10);
        return hour > currentHour;
      });
    }

    const selectedServiceId = form.getFieldValue('serviceId');
    const selectedService = services.find((s) => s.id === selectedServiceId);
    const duration = selectedService?.duration || 60;
    const slotsNeeded = Math.ceil(duration / 60);

    if (Object.keys(slotAvailability).length === 0) return baseSlots;

    return baseSlots.filter((time) => {
      const hour = parseInt(time.replace('h', ''), 10);
      for (let i = 0; i < slotsNeeded; i++) {
        const checkHour = hour + i;
        const checkTime = `${checkHour}h`;
        const slotsAvailable = slotAvailability[checkTime] || 0;
        if (slotsAvailable <= 0 || !availableTimeSlots.includes(checkTime)) {
          return false;
        }
      }
      return true;
    });
  };

  return (
    <Modal
      title={
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold" style={{ lineHeight: '32px' }}>
            {isEditMode ? 'Cập nhật thông tin đặt lịch' : 'Chi tiết lịch hẹn'}
          </span>
          <div className="flex items-center">
            {!isEditMode && (
              <Button
                type="primary"
                onClick={onEditModeToggle}
                style={{ marginRight: '16px', height: '32px', lineHeight: '32px' }}
              >
                Chỉnh sửa
              </Button>
            )}
            <Button
              type="text"
              onClick={onCancel} // Sửa lỗi cú pháp
              style={{ fontSize: '16px', lineHeight: '32px' }}
            >
              ✕
            </Button>
          </div>
        </div>
      }
      closable={false}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={isEditMode ? 'Lưu & Đóng' : 'Đóng'}
      cancelText="Hủy bỏ"
      width="90%"
      className="max-w-2xl mx-auto"
      styles={{ body: { padding: '16px', overflowX: 'hidden' } }}
    >
      {booking ? (
        <div className="p-4 bg-white rounded-lg shadowed-lg">
          <Form form={form} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Form.Item
                  label="Mã lịch hẹn"
                  name="orderId"
                  rules={[{ required: true, message: 'Vui lòng nhập mã lịch hẹn!' }]}
                >
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  label="Người đặt"
                  name="fullname"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên người đặt!' },
                    {
                      pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                      message: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng!',
                    },
                  ]}
                >
                  <Input disabled={!isEditMode} />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: false, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                  ]}
                >
                  <Input disabled={!isEditMode} placeholder="example@email.com" />
                </Form.Item>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ required: false, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input disabled={!isEditMode} />
                </Form.Item>
                <Form.Item
                  label="Tên thú cưng"
                  name="petName"
                  rules={[{ required: true, message: 'Vui lòng nhập tên thú cưng!' }]}
                >
                  <Input disabled={!isEditMode} />
                </Form.Item>
                <Form.Item
                  label="Loại thú cưng"
                  name="petType"
                  rules={[{ required: true, message: 'Vui lòng chọn loại thú cưng!' }]}
                >
                  <Select disabled={!isEditMode}>
                    {petTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Trạng thái"
                  name="bookingStatus"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                  <Select disabled={!isEditMode}>
                    <Option value={BookingStatus.PENDING}>ĐANG CHỜ</Option>
                    <Option value={BookingStatus.CONFIRMED}>ĐÃ XÁC NHẬN</Option>
                    <Option value={BookingStatus.CANCELLED}>ĐÃ HỦY</Option>
                  </Select>
                </Form.Item>
              </div>
              <div>
                <Form.Item
                  label="Đặt lúc"
                  name="orderDate"
                  rules={[{ required: true, message: 'Vui lòng nhập thời gian đặt!' }]}
                >
                  <DatePicker
                    format="DD/MM/YYYY HH:mm:ss"
                    showTime
                    disabled
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  label="Chọn dịch vụ"
                  name="serviceId"
                  rules={[{ required: true, message: 'Vui lòng chọn dịch vụ!' }]}
                >
                  <Select
                    placeholder="Chọn dịch vụ"
                    disabled={!isEditMode}
                    onChange={(value) => {
                      onServiceChange(value);
                      const selectedService = services.find((s) => s.id === value);
                      form.setFieldsValue({
                        estimatedPrice: selectedService?.price
                          ? selectedService.price.toLocaleString('vi-VN') + ' VND'
                          : '0 VND',
                        duration: selectedService?.duration || 0,
                      });
                    }}
                    loading={services.length === 0}
                  >
                    {services.map((service) => (
                      <Option key={service.id} value={service.id}>
                        {service.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Ngày đặt"
                  name="bookingDate"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày đặt!' }]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    disabled={!isEditMode}
                    value={tempSelectedDate}
                    style={{ width: '100%' }}
                    placeholder="25/04/2025"
                    onChange={(date: dayjs.Dayjs | null) => {
                      console.log('DatePicker onChange:', date);
                      const newDate = date ? dayjs(date).tz('Asia/Ho_Chi_Minh').startOf('day') : null;
                      console.log('New date:', newDate);
                      form.setFieldsValue({ bookingDate: newDate, bookingTime: undefined });
                      setTempSelectedDate(newDate);
                      onDateChange(newDate);
                    }}
                    disabledDate={(current) => {
                      if (!current) return false;
                      return current.isBefore(
                        dayjs().tz('Asia/Ho_Chi_Minh').startOf('day')
                      );
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Giờ đặt"
                  name="bookingTime"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ đặt!' }]}
                >
                  <Select
                    placeholder={
                      selectedDate ? 'Chọn giờ' : 'Vui lòng chọn ngày trước'
                    }
                    disabled={!isEditMode || !selectedDate || !selectedDate.isValid()}
                    style={{ width: '100%' }}
                    onChange={onTimeChange}
                  >
                    {getAvailableTimeSlots().map((time) => (
                      <Option key={time} value={time}>
                        {time} ({slotAvailability[time] || 0} slot còn lại)
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Giá thực tế" name="realPrice">
                  <Input
                    value={
                      booking?.realPrice
                        ? booking.realPrice.toLocaleString('vi-VN') + ' VND'
                        : 'Chưa tính'
                    }
                    disabled
                  />
                </Form.Item>
                <Form.Item
                  label="Thời gian (phút)"
                  name="duration"
                  rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
                >
                  <Input disabled />
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      ) : (
        <div className="p-4 text-center">Đang tải...</div>
      )}
    </Modal>
  );
};

export default EditBookingModal;