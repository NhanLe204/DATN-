// src/components/booking/BookingFormModal.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select } from 'antd';
import dayjs from 'dayjs';
import MultiPetFields from './MultiPetFields';
import { BookingStatus, Service } from '../../booking/bookingTypes';
import { TimePicker } from 'antd';
import TextArea from 'antd/es/input/TextArea';

interface BookingFormModalProps {
  visible: boolean;
  isEditMode: boolean;
  isAddMode?: boolean;
  booking?: any;
  services: Service[];
  petTypes: string[];
  form: any;
  slotAvailability: { [key: string]: number };
  availableTimeSlots: string[];
  currentDateTime: dayjs.Dayjs;
  onOk: () => Promise<boolean>;
  onCancel: () => void;
  onEditModeToggle?: () => void;
  onDateChange: (date: dayjs.Dayjs | null, index: number) => void;
  onTimeChange: (time: string, index: number) => void;
  onServiceChange: (value: string, index: number) => void;
  booking_note?: string;
}

const BookingFormModal: React.FC<BookingFormModalProps> = ({
  visible,
  isEditMode,
  isAddMode = false,
  booking,
  services,
  petTypes,
  form,
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
  const isViewMode = booking && !isEditMode;
  const modalTitle = isAddMode
    ? 'Thêm lịch hẹn mới'
    : isEditMode
      ? 'Cập nhật thông tin đặt lịch'
      : 'Chi tiết lịch hẹn';

  // Khi mở modal thêm → khởi tạo 1 pet mặc định
  useEffect(() => {
    if (visible && isAddMode) {
      form.resetFields();
      form.setFieldsValue({
        pets: [{
          petName: '',
          petType: petTypes[0] || 'Chó',
          service: undefined,
          date: null,
          time: undefined,
        }],
        bookingStatus: BookingStatus.PENDING,
        orderDate: dayjs().tz('Asia/Ho_Chi_Minh'),
      });
    }
  }, [visible, isAddMode, form, petTypes]);

  const handleOk = async () => {
    try {
      await form.validateFields();
      const success = await onOk();
      return success;
    } catch (err) {
      message.error('Vui lòng kiểm tra lại thông tin các bé!');
      return false;
    }
  };

  // Logic lấy slot khả dụng cho từng pet (theo index)
  const getAvailableTimeSlots = (index: number): string[] => {
    const date = form.getFieldValue(['pets', index, 'date']);
    if (!date || !date.isValid()) return availableTimeSlots;

    let slots = [...availableTimeSlots];

    // Lọc giờ quá khứ nếu hôm nay
    const isToday = date.isSame(currentDateTime, 'day');
    if (isToday) {
      const currentHour = currentDateTime.hour();
      slots = slots.filter(t => parseInt(t.replace('h', ''), 10) > currentHour);
    }

    // Nếu chưa chọn dịch vụ → hiện hết
    const serviceId = form.getFieldValue(['pets', index, 'service']);
    if (!serviceId) return slots;

    const commonSlots = slotAvailability || {};

    const service = services.find(s => s.id === serviceId);
    const duration = service?.duration || 60;
    const needed = Math.ceil(duration / 60);

    return slots.filter(time => {
      const startHour = parseInt(time.replace('h', ''), 10);
      for (let i = 0; i < needed; i++) {
        const checkTime = `${startHour + i}h`;
        if ((commonSlots[checkTime] ?? 0) <= 0) return false;
      }
      return true;
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-xl font-semibold">{modalTitle}</span>
          {isViewMode && onEditModeToggle && (
            <Button type="primary" onClick={onEditModeToggle}>
              Chỉnh sửa
            </Button>
          )}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        // Nút ở footer để đẹp hơn, dễ thấy hơn
        isViewMode ? null : (
          <Button key="cancel" onClick={onCancel}>
            Hủy bỏ
          </Button>
        ),
        isViewMode ? null : (
          <Button key="submit" type="primary" onClick={handleOk}>
            {isAddMode ? 'Thêm mới' : 'Lưu & Đóng'}
          </Button>
        ),
        isViewMode && (
          <Button key="close" type="default" onClick={onCancel}>
            Đóng
          </Button>
        ),
      ].filter(Boolean)}
      width={1100}
      closable={true}
      closeIcon={<span className="text-2xl">&times;</span>}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        validateMessages={{
          required: '${label} là bắt buộc!',
        }}
      >
        {/* Thông tin khách */}
        <div className="grid grid-cols-1 gap-4 p-4 mb-6 rounded-lg md:grid-cols-3 bg-gray-50">
          <Form.Item name="fullname" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
            <Input disabled={isViewMode} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { len: 10, message: 'Số điện thoại phải đủ 10 chữ số!' },
            ]}
          >
            <Input disabled={isViewMode} maxLength={10} />
          </Form.Item>

          <Form.Item name="email" label="Email"
            rules={[
              { type: 'email' },
              { required: true, message: 'Nhập email!' },
            ]}>
            <Input disabled={isViewMode} />
          </Form.Item>
          <Form.Item
            name="booking_note"
            label="Ghi chú nội bộ"
            className="md:col-span-3"
          >
            <TextArea
              rows={5}
              placeholder="Ghi chú cho admin (không hiển thị với khách)"
              disabled={isViewMode}
            />
          </Form.Item>


        </div>

        {/* Danh sách nhiều pet */}
        <MultiPetFields
          form={form}
          services={services}
          petTypes={petTypes}
          slotAvailability={slotAvailability}
          availableTimeSlots={availableTimeSlots}
          currentDateTime={currentDateTime}
          onServiceChange={onServiceChange}
          onDateChange={onDateChange}
          onTimeChange={onTimeChange}
          getAvailableTimeSlots={getAvailableTimeSlots}
          disabled={isViewMode}
        />


        {!isAddMode && (
          <Form.Item label="Trạng thái" name="bookingStatus">
            <Select disabled={isViewMode}>
              <Select.Option value="PENDING">Đang chờ xác nhận</Select.Option>
              <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
              <Select.Option value="IN_PROGRESS">Đang thực hiện</Select.Option>
              <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
              <Select.Option value="CANCELLED">Đã hủy</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default BookingFormModal;