import React, { useState } from "react";
import { Form, Input, Select, Radio, DatePicker } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import moment from "moment-timezone";
import PriceTableModal from "./PriceTableModal";

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
  petFormData: {
    estimatedPrice?: number;
    estimatedDuration?: string;
  };
  selectedDate: moment.Moment | null;
  availableTimeSlots: string[];
  slotAvailability: { [key: string]: number };
  currentDateTime?: moment.Moment;
  handleServiceChange: (value: string, index: number) => void;
  handleDateChange: (date: moment.Moment | null, index: number) => void;
  handleTimeChange: (hour: number, minute: number, index: number) => void;
  removePetForm?: (index: number) => void;
  isRemovable?: boolean;
}

const PetInfoForm: React.FC<PetInfoFormProps> = ({
  index,
  form,
  services,
  petFormData,
  selectedDate,
  slotAvailability,
  currentDateTime,
  handleServiceChange,
  handleDateChange,
  handleTimeChange,
  removePetForm,
  isRemovable,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  /* ================= SAFE TIME ================= */
  const safeNow = currentDateTime ?? moment().tz("Asia/Ho_Chi_Minh");
  const currentHour = safeNow.hour();
  const currentMinute = safeNow.minute();

  /* ================= FORM WATCH ================= */
  const rawHour = Form.useWatch(["pets", index, "hour"], form);
  const rawMinute = Form.useWatch(["pets", index, "minute"], form);

  const selectedHour = typeof rawHour === "number" ? rawHour : null;
  const selectedMinute = typeof rawMinute === "number" ? rawMinute : null;

  /* ================= SLOT ================= */
  const currentHourKey =
    selectedHour !== null ? `${selectedHour}h` : null;
  const remainingSlots =
    currentHourKey ? slotAvailability[currentHourKey] ?? 0 : null;

  /* ================= CONST ================= */
  const hours = [8, 9, 10, 11, 13, 14, 15, 16, 17];

  const parseDuration = (duration?: string) => {
    if (!duration) return "Chưa chọn dịch vụ";
    const minutes = parseInt(duration, 10);
    return isNaN(minutes) ? "Chưa chọn dịch vụ" : `${minutes} phút`;
  };

  /* ================= DISABLED DATE ================= */
  const disabledDate = (current: moment.Moment) => {
    return current.isBefore(
      moment().tz("Asia/Ho_Chi_Minh").startOf("day")
    );
  };

  /* ================= VALIDATE TIME ================= */
  const validateBookingTime = () => {
    const hour = form.getFieldValue(["pets", index, "hour"]);
    const minute = form.getFieldValue(["pets", index, "minute"]);
    const date = form.getFieldValue(["pets", index, "date"]);

    if (!date || hour == null || minute == null) {
      return Promise.resolve();
    }

    const selectedInTZ = moment.tz(
      {
        year: date.year(),
        month: date.month(),
        date: date.date(),
        hour: hour,
        minute: minute,
        second: 0,
        millisecond: 0,
      },
      'Asia/Ho_Chi_Minh'
    );

    if (selectedInTZ.isBefore(safeNow)) {
      if (selectedInTZ.isSame(safeNow, 'day')) {
        return Promise.reject(
          new Error(`Chỉ có thể đặt sau ${safeNow.format('HH:mm')} trở đi`)
        );
      }
      return Promise.reject(
        new Error("Không thể đặt thời gian trong quá khứ")
      );
    }

    return Promise.resolve();
  };

  return (
    <div className="relative pb-6 mb-8 border-b last:border-b-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          Thú cưng {index + 1}
        </h3>
        {isRemovable && removePetForm && (
          <span
            className="text-sm text-red-500 cursor-pointer hover:underline"
            onClick={() => removePetForm(index)}
          >
            Xóa thú cưng
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
        <Form.Item
          label="Tên thú cưng *"
          name={["pets", index, "petName"]}
          rules={[{ required: true, message: "Nhập tên thú cưng" }]}
        >
          <Input placeholder="Nhập tên thú cưng" />
        </Form.Item>

        <Form.Item
          label="Loại thú cưng *"
          name={["pets", index, "petType"]}
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value="dog">Chó</Radio>
            <Radio value="cat">Mèo</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Chọn dịch vụ *"
          name={["pets", index, "service"]}
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Chọn dịch vụ"
            onChange={(v) => handleServiceChange(v, index)}
          >
            {services.map((s) => (
              <Option key={s._id} value={s._id}>
                {s.service_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label=" ">
          <div className="flex flex-col">
            <div className="mb-1">
              <span className="font-medium">Thời gian dự tính:</span>{" "}
              <span className="text-green-600">
                {parseDuration(petFormData?.estimatedDuration)}
              </span>
            </div>
            <span
              className="text-sm text-[#22A6DF] cursor-pointer hover:underline"
              onClick={() => setIsModalVisible(true)}
            >
              Xem bảng giá
            </span>
          </div>
        </Form.Item>

      </div>

      <Form.Item
        label="Chọn ngày hẹn *"
        name={["pets", index, "date"]}
        rules={[{ required: true }]}
      >
        <DatePicker
          className="w-full"
          format="DD/MM/YYYY"
          disabledDate={disabledDate}
          suffixIcon={<CalendarOutlined />}
          onChange={(d) => handleDateChange(d, index)}
          value={selectedDate}
        />
      </Form.Item>

      <div className="flex gap-4">
        <Form.Item
          label="Giờ *"
          name={["pets", index, "hour"]}
          rules={[
            { required: true },
            { validator: validateBookingTime },
          ]}
          className="flex-1"
        >
          <Select
            disabled={!selectedDate}
            placeholder="Giờ"
            onChange={(h) =>
              handleTimeChange(
                h,
                form.getFieldValue(["pets", index, "minute"]) ?? 0,
                index
              )
            }
          >
            {hours.map((h) => {
              let disabled = false;

              if (
                selectedDate?.isSame(safeNow, "day") &&
                h < currentHour
              ) {
                disabled = true;
              }

              return (
                <Option key={h} value={h} disabled={disabled}>
                  {String(h).padStart(2, "0")}h
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item
          label="Phút"
          name={["pets", index, "minute"]}
          rules={[
            { required: true },
            { validator: validateBookingTime },
          ]}
        >

          <Radio.Group disabled={!selectedDate} buttonStyle="solid">
            {[0, 15, 30, 45].map((m) => {
              let disabled = false;

              if (
                selectedDate?.isSame(safeNow, "day") &&
                selectedHour === currentHour &&
                m <= currentMinute
              ) {
                disabled = true;
              }

              return (
                <Radio.Button key={m} value={m} disabled={disabled}>
                  {String(m).padStart(2, "0")}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </Form.Item>
      </div>

      {remainingSlots !== null && (
        <div
          className={
            remainingSlots > 0
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {remainingSlots > 0
            ? "Có thể đặt lịch"
            : "Khung giờ đã kín"}
        </div>
      )}

      <PriceTableModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default PetInfoForm;
