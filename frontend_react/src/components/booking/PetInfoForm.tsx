import React, { useState } from "react";
import { Form, Input, Select, Radio, DatePicker } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import moment from "moment-timezone";
import PriceTableModal from "./PriceTableModal";
import "tailwindcss/tailwind.css";

const { Option } = Select;

interface Service {
  _id: string;
  service_name: string;
  service_price: number;
  duration?: string;
}

interface PetInfoFormProps {
  index: number;
  form: any;
  services: Service[];
  petFormData: { estimatedPrice?: number; estimatedDuration?: string };
  selectedDate: moment.Moment | null;
  availableTimeSlots: string[];
  slotAvailability: { [key: string]: number };
  handleServiceChange: (value: string, index: number) => void;
  handleDateChange: (date: moment.Moment | null, index: number) => void;
  handleTimeChange: (time: string, index: number) => void;
  removePetForm?: (index: number) => void;
  isRemovable?: boolean;
  onViewPriceClick?: () => void;
}

const PetInfoForm: React.FC<PetInfoFormProps> = ({
  index,
  form,
  services,
  petFormData,
  selectedDate,
  availableTimeSlots,
  slotAvailability,
  handleServiceChange,
  handleDateChange,
  handleTimeChange,
  removePetForm,
  isRemovable,
  onViewPriceClick,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
   
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const parseDuration = (duration: string | undefined): string => {
    if (!duration) return "Chưa chọn dịch vụ";
    const minutes = parseInt(duration, 10);
    return isNaN(minutes) ? "Chưa chọn dịch vụ" : `${minutes} phút`;
  };

  const disabledDate = (current: any) => {
    return current && current.isBefore(moment().tz("Asia/Ho_Chi_Minh").startOf("day"));
  };

  return (
    <div key={index} className="relative pb-4 mb-6 border-b">
      <div className="flex items-center justify-between">
        <h3 className="mb-2 font-medium text-md">Thú cưng {index + 1}</h3>
        {isRemovable && removePetForm && (
          <div
            className="text-red-500 cursor-pointer hover:underline"
            onClick={() => removePetForm(index)}
          >
            Xóa thú cưng
          </div>
        )}
      </div>
      <Form.Item
        label={<span>Tên thú cưng <span className="text-red-500">*</span></span>}
        name={["pets", index, "petName"]}
        rules={[{ required: true, message: "Vui lòng nhập tên thú cưng!" }]}
      >
        <Input placeholder="Nhập tên thú cưng" className="w-full" />
      </Form.Item>
      <div className="flex mb-4 space-x-4">
        <Form.Item
          label={<span>Thú cưng của bạn là <span className="text-red-500">*</span></span>}
          name={["pets", index, "petType"]}
          rules={[{ required: true, message: "Vui lòng chọn loại thú cưng!" }]}
          className="w-1/2"
        >
          <Radio.Group>
            <Radio value="dog">Chó</Radio>
            <Radio value="cat">Mèo</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={<span>Chọn dịch vụ <span className="text-red-500">*</span></span>}
          name={["pets", index, "service"]}
          rules={[{ required: true, message: "Vui lòng chọn dịch vụ!" }]}
          className="w-1/2"
        >
          <Select
            placeholder="Dịch vụ"
            className="w-full"
            onChange={(value) => handleServiceChange(value, index)}
          >
            {services.map((service) => (
              <Option key={service._id} value={service._id}>
                {service.service_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>
      <div className="mb-2">
        <span className="font-medium">Thời gian dự tính: </span>
        <span className="text-green-600">{parseDuration(petFormData?.estimatedDuration)}</span>
      </div>
      <div>
        <p className="text-sm text-red-500 mb-2">
          *Giá hiển thị là ước tính và có thể thay đổi tùy thuộc vào loại thú cưng và khối lượng thực tế khi cân tại cửa hàng:{" "}
          <span
            className="text-[#22A6DF] cursor-pointer hover:underline"
            onClick={showModal}
          >
            Xem bảng giá
          </span>
        </p>
      </div>
      <h3 className="mb-2 font-medium text-md">Thời gian đặt hẹn</h3>
      <div className="flex mb-4 space-x-4">
        <Form.Item
          label={<span>Chọn ngày hẹn <span className="text-red-500">*</span></span>}
          name={["pets", index, "date"]}
          rules={[{ required: true, message: "Vui lòng chọn ngày hẹn!" }]}
          className="w-1/2"
        >
          <DatePicker
            suffixIcon={<CalendarOutlined />}
            className="w-full"
            placeholder="21/01/2025"
            disabledDate={disabledDate}
            onChange={(date) => handleDateChange(date, index)}
            value={selectedDate}
          />
        </Form.Item>
        <Form.Item
          label={<span>Chọn giờ hẹn <span className="text-red-500">*</span></span>}
          name={["pets", index, "time"]}
          rules={[{ required: true, message: "Vui lòng chọn giờ hẹn!" }]}
          className="w-1/2"
        >
          <Select
            placeholder="Vui lòng chọn ngày trước"
            className="w-full"
            disabled={!selectedDate}
            onChange={(value) => handleTimeChange(value, index)}
          >
            {availableTimeSlots.map((time) => (
              <Option key={time} value={time}>
                {time} ({slotAvailability[time] || 0} slot còn lại)
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <PriceTableModal visible={isModalVisible} onClose={handleModalClose} />
    </div>
  );
};

export default PetInfoForm;