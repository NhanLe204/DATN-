import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  Button,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import serviceApi from "../../api/serviceApi";
import moment from "moment";

const { Option } = Select;

interface Service {
  _id: string;
  service_name: string;
  service_price: number;
  description?: string;
  duration?: string; // ISO string like "1970-01-01T00:00:00.060Z"
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PetFormData {
  estimatedPrice?: number;
  estimatedDuration?: string;
}

const SpaBookingForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [petForms, setPetForms] = useState<number[]>([0]);
  const [services, setServices] = useState<Service[]>([]);
  const [petFormData, setPetFormData] = useState<PetFormData[]>([{ estimatedPrice: undefined, estimatedDuration: undefined }]);
  const [selectedDates, setSelectedDates] = useState<(moment.Moment | null)[]>([null]);

  const currentDateTime = moment("2025-03-26T17:38:00"); // Ngày và giờ hiện tại: 26/03/2025, 5:38 PM
  const availableTimeSlots = [
    "8h", "9h", "10h", "11h", "13h", "14h", "15h", "16h", "17h",
  ];

  const handleInfoClick = () => {
    navigate("/info");
  };

  const addPetForm = () => {
    if (petForms.length < 2) {
      setPetForms([...petForms, petForms.length]);
      setPetFormData([...petFormData, { estimatedPrice: undefined, estimatedDuration: undefined }]);
      setSelectedDates([...selectedDates, null]);
    } else {
      alert("Pet Heaven chỉ nhận tối đa 2 thú cưng cho 1 lịch hẹn!");
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const serviceResponse = await serviceApi.getAllActive();
        const serviceData = serviceResponse.data.data;
        console.log("Fetched services:", serviceData);

        if (Array.isArray(serviceData)) {
          setServices(serviceData);
        } else {
          console.error("Nested service data is not an array:", serviceData);
          setServices([]);
        }
      } catch (error) {
        console.log("Error fetching services:", error);
        setServices([]);
      }
    };

    fetchServices();
  }, []);

  const removePetForm = (indexToRemove: number) => {
    if (petForms.length > 1) {
      setPetForms(petForms.filter((_, index) => index !== indexToRemove));
      setPetFormData(petFormData.filter((_, index) => index !== indexToRemove));
      setSelectedDates(selectedDates.filter((_, index) => index !== indexToRemove));
      form.setFields(
        petForms
          .map((_, index) =>
            index === indexToRemove
              ? { name: ["pets", index], value: undefined }
              : {
                  name: ["pets", index],
                  value: form.getFieldValue(["pets", index]),
                }
          )
          .filter((field) => field.value !== undefined)
      );
    }
  };

  const onFinish = (values: any) => {
    console.log("Form submitted with values:", values);
    alert("Đặt lịch thành công!");
    form.resetFields();
    setPetFormData(petForms.map(() => ({ estimatedPrice: undefined, estimatedDuration: undefined })));
    setSelectedDates(petForms.map(() => null));
  };

  const parseDuration = (duration: string | undefined): string => {
    if (!duration) return "Chưa chọn dịch vụ";
    const date = new Date(duration);
    const milliseconds = date.getUTCMilliseconds();
    const minutes = Math.floor(milliseconds);
    return `${minutes} phút`;
  };

  const handleServiceChange = (value: string, index: number) => {
    const selectedService = services.find((service) => service._id === value);
    console.log("Selected service:", selectedService);

    const updatedPetFormData = [...petFormData];
    updatedPetFormData[index] = {
      estimatedPrice: selectedService?.service_price || 0,
      estimatedDuration: selectedService?.duration,
    };
    setPetFormData(updatedPetFormData);

    form.setFieldsValue({
      pets: {
        [index]: {
          estimatedPrice: selectedService?.service_price || 0,
          estimatedDuration: selectedService?.duration,
        },
      },
    });
    console.log("Updated petFormData:", updatedPetFormData);
    console.log("Form values after set:", form.getFieldsValue());
  };

  // Vô hiệu hóa các ngày không còn khung giờ khả dụng
  const disabledDate = (current: moment.Moment) => {
    // Vô hiệu hóa các ngày trước ngày hiện tại
    if (current && current < moment().startOf("day")) {
      return true;
    }

    // Kiểm tra ngày hiện tại: nếu không còn khung giờ nào khả dụng, vô hiệu hóa ngày đó
    const isToday = current && current.isSame(moment(), "day");
    if (isToday) {
      const currentHour = currentDateTime.hour();
      const currentMinute = currentDateTime.minute();

      const hasAvailableSlots = availableTimeSlots.some((time) => {
        const hour = parseInt(time.replace("h", ""), 10);
        if (hour < currentHour) return false;
        if (hour === currentHour) {
          return currentMinute === 0;
        }
        return true;
      });

      return !hasAvailableSlots; // Vô hiệu hóa nếu không còn khung giờ nào khả dụng
    }

    return false;
  };

  const getAvailableTimeSlots = (index: number) => {
    const selectedDate = selectedDates[index];
    if (!selectedDate) return []; // Nếu chưa chọn ngày, không hiển thị khung giờ

    const isToday = selectedDate.isSame(moment(), "day");
    if (!isToday) return availableTimeSlots; // Nếu không phải ngày hôm nay, hiển thị tất cả khung giờ

    // Nếu là ngày hôm nay, lọc bỏ các khung giờ đã qua
    const currentHour = currentDateTime.hour();
    const currentMinute = currentDateTime.minute();

    const filteredTimeSlots = availableTimeSlots.filter((time) => {
      const hour = parseInt(time.replace("h", ""), 10);
      if (hour < currentHour) return false;
      if (hour === currentHour) {
        return currentMinute === 0;
      }
      return true;
    });

    return filteredTimeSlots.length > 0 ? filteredTimeSlots : availableTimeSlots; // Đảm bảo không trả về danh sách rỗng
  };

  const handleDateChange = (date: moment.Moment | null, index: number) => {
    const updatedDates = [...selectedDates];
    updatedDates[index] = date;
    setSelectedDates(updatedDates);

    // Đặt lại trường giờ khi ngày thay đổi
    form.setFieldsValue({
      pets: {
        [index]: {
          time: undefined,
        },
      },
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold text-center">
        ĐẶT LỊCH SPA CHO THÚ CƯNG
      </h1>
      <p
        className="text-[#22A6DF] text-center mb-6 cursor-pointer hover:underline"
        onClick={handleInfoClick}
      >
        Thông tin cần biết về dịch vụ chăm sóc thú cưng tại Pet Heaven
      </p>

      <div className="max-w-2xl p-6 mx-auto bg-white rounded-lg shadow-md">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="p-6 mb-6 border border-gray-200 rounded-md">
            <h2 className="mb-4 text-lg font-semibold text-center">
              THÔNG TIN KHÁCH HÀNG
            </h2>
            <Form.Item
              label={<span>Họ và tên <span className="text-red-500">*</span></span>}
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input placeholder="Nhập họ và tên" className="w-full" />
            </Form.Item>

            <Form.Item
              label={<span>Số điện thoại <span className="text-red-500">*</span></span>}
              name="phone"
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
            >
              <Input placeholder="Nhập số điện thoại" className="w-full" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea placeholder="Nhập ghi chú" rows={3} className="w-full" />
            </Form.Item>
          </div>

          <div className="p-6 mb-6 border border-gray-200 rounded-md">
            <h2 className="mb-4 text-lg font-semibold text-center">
              THÔNG TIN THÚ CƯNG
            </h2>
            {petForms.map((index) => (
              <div key={index} className="relative pb-4 mb-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="mb-2 font-medium text-md">
                    Thú cưng {index + 1}
                  </h3>
                  {petForms.length > 1 && index === 1 && (
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

                <div className="mb-4">
                  <span className="font-medium">Giá dự tính: </span>
                  <span className="text-green-600">
                    {petFormData[index]?.estimatedPrice !== undefined
                      ? `${petFormData[index].estimatedPrice.toLocaleString("vi-VN")} VNĐ`
                      : "Chưa chọn dịch vụ"}
                  </span>
                  <span className="ml-4 font-medium">Thời gian dự tính: </span>
                  <span className="text-green-600">
                    {parseDuration(petFormData[index]?.estimatedDuration)}
                  </span>
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
                      disabled={!selectedDates[index]} // Vô hiệu hóa nếu chưa chọn ngày
                    >
                      {getAvailableTimeSlots(index).map((time) => (
                        <Option key={time} value={time}>
                          {time}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <p className="text-sm text-gray-500">
                  *Giá có thể thay đổi tùy thuộc vào loại thú cưng, khối lượng
                  và chiều dài lông.{" "}
                  <span
                    className="text-[#22A6DF] cursor-pointer hover:underline"
                    onClick={() => navigate("/info")}
                  >
                    Xem bảng giá
                  </span>
                </p>
              </div>
            ))}
            {petForms.length < 2 && (
              <div
                className="text-[#22A6DF] cursor-pointer mb-4"
                onClick={addPetForm}
              >
                + Thêm thú cưng
              </div>
            )}
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-12 bg-[#22A6DF] hover:bg-[#1A8ABF] text-white font-semibold"
            >
              ĐẶT LỊCH NGAY
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SpaBookingForm;