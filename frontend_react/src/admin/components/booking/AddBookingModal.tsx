import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { BookingStatus, Service } from '../../booking/booking';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

interface AddBookingModalProps {
  visible: boolean;
  services: Service[];
  petTypes: string[];
  form: any;
  selectedDate: dayjs.Dayjs | null;
  slotAvailability: { [key: string]: number };
  availableTimeSlots: string[];
  currentDateTime: dayjs.Dayjs;
  onOk: () => void;
  onCancel: () => void;
  onDateChange: (date: dayjs.Dayjs | null) => void;
  onTimeChange: (time: string) => void;
  onServiceChange: (value: string) => void;
}

const AddBookingModal: React.FC<AddBookingModalProps> = ({
  visible,
  services,
  petTypes,
  form,
  selectedDate,
  slotAvailability,
  availableTimeSlots,
  currentDateTime,
  onOk,
  onCancel,
  onDateChange,
  onTimeChange,
  onServiceChange,
}) => {
  const [tempSelectedDate, setTempSelectedDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        bookingStatus: BookingStatus.PENDING,
        orderDate: dayjs().tz('Asia/Ho_Chi_Minh'),
      });
    }
  }, [visible, form]);

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
            Thêm lịch hẹn mới
          </span>
          <Button
            type="text"
            onClick={onCancel}
            style={{ fontSize: '16px', lineHeight: '32px' }}
          >
            ✕
          </Button>
        </div>
      }
      closable={false}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Thêm mới"
      cancelText="Hủy bỏ"
      width="90%"
      className="max-w-2xl mx-auto"
      styles={{ body: { padding: '16px', overflowX: 'hidden' } }}
    >
      <div className="p-4 bg-white rounded-lg shadowed-lg">
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Form.Item
                label="Người đặt"
                name="fullname"
                rules={[{ required: true, message: 'Vui lòng nhập tên người đặt!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Email không hợp lệ!' },
                  { required: false },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Tên thú cưng"
                name="petName"
                rules={[{ required: true, message: 'Vui lòng nhập tên thú cưng!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Loại thú cưng"
                name="petType"
                rules={[{ required: true, message: 'Vui lòng chọn loại thú cưng!' }]}
              >
                <Select>
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
                <Select>
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
                  value={dayjs().tz('Asia/Ho_Chi_Minh')}
                />
              </Form.Item>
              <Form.Item
                label="Chọn dịch vụ"
                name="serviceId"
                rules={[{ required: true, message: 'Vui lòng chọn dịch vụ!' }]}
              >
                <Select
                  placeholder="Chọn dịch vụ"
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
                  value={tempSelectedDate}
                  style={{ width: '100%' }}
                  placeholder="25/04/2025"
                  onChange={(date: dayjs.Dayjs | null) => {
                    const newDate = date ? dayjs(date).tz('Asia/Ho_Chi_Minh').startOf('day') : null;
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
                  disabled={!selectedDate || !selectedDate.isValid()}
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
              <Form.Item
                label="Giá ước tính"
                name="estimatedPrice"
              >
                <Input disabled />
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
    </Modal>
  );
};

export default AddBookingModal;