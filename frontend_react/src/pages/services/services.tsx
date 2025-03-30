import React, { useEffect, useState } from "react";
import { Form, Input, Select, Radio, DatePicker, Button, message } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import serviceApi from "../../api/serviceApi";
import paymentTypeApi from "../../api/paymentTypeApi";
import moment from "moment-timezone";
import orderApi from "../../api/orderApi";

const { Option } = Select;

interface Service {
  _id: string;
  service_name: string;
  service_price: number;
  description?: string;
  duration?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentType {
  _id: string;
  payment_type_name: string;
}

interface PetFormData {
  estimatedPrice?: number;
  estimatedDuration?: string;
}

interface CartState {
  userId: string | null;
}

const SpaBookingForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userId } = useSelector((state: { cart: CartState }) => state.cart);
  const [petForms, setPetForms] = useState<number[]>([0]);
  const [services, setServices] = useState<Service[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentType[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [petFormData, setPetFormData] = useState<PetFormData[]>([
    { estimatedPrice: undefined, estimatedDuration: undefined },
  ]);
  const [selectedDates, setSelectedDates] = useState<(moment.Moment | null)[]>([
    null,
  ]);
  const [currentDateTime, setCurrentDateTime] = useState(
    moment().tz("Asia/Ho_Chi_Minh")
  );
  const [slotAvailability, setSlotAvailability] = useState<{
    [key: string]: { [key: string]: number };
  }>({});

  const availableTimeSlots = [
    "8h",
    "9h",
    "10h",
    "11h",
    "13h",
    "14h",
    "15h",
    "16h",
    "17h",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(moment().tz("Asia/Ho_Chi_Minh"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInfoClick = () => {
    navigate("/info");
  };

  const addPetForm = () => {
    if (petForms.length < 2) {
      setPetForms([...petForms, petForms.length]);
      setPetFormData([
        ...petFormData,
        { estimatedPrice: undefined, estimatedDuration: undefined },
      ]);
      setSelectedDates([...selectedDates, null]);
    } else {
      message.warning("Pet Heaven chỉ nhận tối đa 2 thú cưng cho 1 lịch hẹn!");
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const serviceResponse = await serviceApi.getAllActive();
        const serviceData = serviceResponse.data.data;
        if (Array.isArray(serviceData)) setServices(serviceData);
        else setServices([]);
      } catch (error) {
        console.log("Error fetching services:", error);
        setServices([]);
      }
    };

    const fetchPaymentMethods = async () => {
      try {
        const paymentResponse = await paymentTypeApi.getAllPayment();
        const methods = paymentResponse.data.data || [];
        setPaymentMethods(methods);
        if (methods.length > 0) setSelectedPayment(methods[0]._id);
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        setPaymentMethods([]);
      }
    };

    fetchServices();
    fetchPaymentMethods();
  }, []);

  const removePetForm = (indexToRemove: number) => {
    if (petForms.length > 1) {
      setPetForms(petForms.filter((_, index) => index !== indexToRemove));
      setPetFormData(petFormData.filter((_, index) => index !== indexToRemove));
      setSelectedDates(
        selectedDates.filter((_, index) => index !== indexToRemove)
      );
      setSlotAvailability((prev) => {
        const newAvailability = { ...prev };
        delete newAvailability[indexToRemove];
        return newAvailability;
      });
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

  const fetchAvailableSlots = async (
    date: moment.Moment | null,
    index: number
  ) => {
    if (!date) {
      setSlotAvailability((prev) => {
        const newAvailability = { ...prev };
        delete newAvailability[index];
        return newAvailability;
      });
      return;
    }
    try {
      const dateStr = date.format("YYYY-MM-DD");
      const response = await orderApi.getAvailableSlots(dateStr);
      console.log(
        `Fetched slots for ${dateStr} (pet ${index}):`,
        response.data
      );
      setSlotAvailability((prev) => ({
        ...prev,
        [index]: response.data,
      }));
    } catch (error) {
      console.error(
        `Error fetching slots for ${date?.format(
          "YYYY-MM-DD"
        )} (pet ${index}):`,
        error
      );
      message.error("Không thể tải danh sách khung giờ, vui lòng thử lại!");
      setSlotAvailability((prev) => {
        const newAvailability = { ...prev };
        delete newAvailability[index];
        return newAvailability;
      });
    }
  };

  const onFinish = async (values: any) => {
    console.log("Form values:", values);

    const totalPrice = petFormData.reduce(
      (sum, pet) => sum + (pet.estimatedPrice || 0),
      0
    );

    if (!userId) {
      message.error("Vui lòng đăng nhập để đặt lịch!");
      return;
    }
    if (totalPrice <= 0) {
      message.error("Vui lòng chọn ít nhất một dịch vụ để đặt lịch!");
      return;
    }

    // Đếm số pet trong từng slot từ request
    const slotUsage: { [key: string]: number } = {};
    for (let index = 0; index < petForms.length; index++) {
      const selectedDate = selectedDates[index];
      const selectedTime = values.pets[index]?.time;

      if (!selectedDate) {
        message.error(`Vui lòng chọn ngày hẹn cho pet ${index + 1}!`);
        return;
      }
      if (!selectedTime) {
        message.error(`Vui lòng chọn giờ hẹn cho pet ${index + 1}!`);
        return;
      }

      const selectedServiceId = values.pets[index].service;
      const selectedService = services.find((s) => s._id === selectedServiceId);
      const duration = selectedService?.duration
        ? parseInt(selectedService.duration)
        : 60;
      const slotsNeeded = Math.ceil(duration / 60);
      const hour = parseInt(selectedTime.replace("h", ""), 10);
      const dateStr = selectedDate.format("YYYY-MM-DD");

      // Tính slotUsage cho tất cả khung giờ bị ảnh hưởng
      for (let i = 0; i < slotsNeeded; i++) {
        const checkHour = hour + i;
        const checkTime = `${checkHour}h`;
        const slotKey = `${dateStr}-${checkTime}`;
        slotUsage[slotKey] = (slotUsage[slotKey] || 0) + 1;

        const slotsAvailable = slotAvailability[index]?.[checkTime] || 0;
        if (slotUsage[slotKey] > slotsAvailable) {
          message.error(
            `Không đủ slot cho khung giờ ${checkTime} ngày ${selectedDate.format(
              "DD/MM/YYYY"
            )}! Chỉ còn ${slotsAvailable} slot.`
          );
          return;
        }
      }
    }

    const orderDetails = petForms.map((index) => {
      const selectedDate = selectedDates[index];
      const selectedTime = values.pets[index].time;
      const hour = parseInt(selectedTime.replace("h", ""), 10);

      if (!selectedDate) {
        throw new Error(`Selected date is null for pet ${index + 1}`);
      }
      const serviceTime = selectedDate.clone().set({
        hour,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      const serviceTimeString = serviceTime.format(
        "YYYY-MM-DDTHH:00:00.000+07:00"
      );

      return {
        productID: null,
        serviceID: values.pets[index].service,
        quantity: 1,
        product_price: petFormData[index].estimatedPrice || 0,
        booking_date: serviceTimeString,
      };
    });

    const orderData = {
      userID: userId,
      payment_typeID: null,
      deliveryID: null,
      couponID: null,
      orderdate: moment()
        .tz("Asia/Ho_Chi_Minh")
        .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      total_price: totalPrice,
      shipping_address: null,
      transaction_id: `TRANS_${Date.now()}`,
      orderDetails,
      inforUserGuest: {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
      },
      note: values.note,
    };

    try {
      console.log("Order data:", JSON.stringify(orderData, null, 2));
      const response = await orderApi.create(orderData);
      console.log("Order created:", response.data);
      message.success("Đặt lịch thành công!");
      form.resetFields();
      setPetFormData(
        petForms.map(() => ({
          estimatedPrice: undefined,
          estimatedDuration: undefined,
        }))
      );
      const previousDates = [...selectedDates];
      setSelectedDates(petForms.map(() => null));
      setPetForms([0]);
      previousDates.forEach((date, index) => {
        if (date) fetchAvailableSlots(date, index);
      });
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch!";
      message.error(errorMessage);
    }
  };

  const parseDuration = (duration: string | undefined): string => {
    if (!duration) return "Chưa chọn dịch vụ";
    const minutes = parseInt(duration, 10);
    return isNaN(minutes) ? "Chưa chọn dịch vụ" : `${minutes} phút`;
  };

  const handleServiceChange = (value: string, index: number) => {
    const selectedService = services.find((service) => service._id === value);
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
          time: undefined, // Reset khung giờ khi thay đổi dịch vụ
        },
      },
    });
    if (selectedDates[index]) {
      fetchAvailableSlots(selectedDates[index], index);
    }
  };

  const disabledDate = (current: any) => {
    return current && current.isBefore(moment().tz("Asia/Ho_Chi_Minh").startOf("day"));
  };

  const getAvailableTimeSlots = (index: number) => {
    const selectedDate = selectedDates[index];
    if (!selectedDate) {
      console.log(`No date selected for pet ${index}, showing all slots`);
      return availableTimeSlots;
    }

    const isToday = selectedDate.isSame(moment().tz("Asia/Ho_Chi_Minh"), "day");
    let baseSlots = availableTimeSlots;

    if (isToday) {
      const currentHour = currentDateTime.hour();
      baseSlots = availableTimeSlots.filter((time) => {
        const hour = parseInt(time.replace("h", ""), 10);
        return hour > currentHour;
      });
    }

    const slotsForDate = slotAvailability[index] || {};
    console.log(
      `Slots for pet ${index} on ${selectedDate.format("YYYY-MM-DD")}:`,
      slotsForDate
    );

    const selectedServiceId = form.getFieldValue(["pets", index, "service"]);
    const selectedService = services.find((s) => s._id === selectedServiceId);
    const duration = selectedService?.duration
      ? parseInt(selectedService.duration)
      : 60;
    const slotsNeeded = Math.ceil(duration / 60);

    if (Object.keys(slotsForDate).length === 0) {
      return baseSlots;
    }

    const availableSlots = baseSlots.filter((time) => {
      const hour = parseInt(time.replace("h", ""), 10);
      // Kiểm tra tất cả slot cần thiết
      for (let i = 0; i < slotsNeeded; i++) {
        const checkHour = hour + i;
        const checkTime = `${checkHour}h`;
        const slotsAvailable = slotsForDate[checkTime] || 0;
        if (slotsAvailable <= 0 || !availableTimeSlots.includes(checkTime)) {
          return false;
        }
      }
      return true;
    });

    console.log(`Available slots for pet ${index}:`, availableSlots);
    return availableSlots;
  };

  const handleDateChange = (date: moment.Moment | null, index: number) => {
    const updatedDates = [...selectedDates];
    if (date) {
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
        "Asia/Ho_Chi_Minh"
      );
      updatedDates[index] = newDate;
      fetchAvailableSlots(newDate, index);
    } else {
      updatedDates[index] = null;
      fetchAvailableSlots(null, index);
    }
    setSelectedDates(updatedDates);
    form.setFieldsValue({ pets: { [index]: { time: undefined } } });
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
              label={
                <span>
                  Họ và tên <span className="text-red-500">*</span>
                </span>
              }
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input placeholder="Nhập họ và tên" className="w-full" />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Số điện thoại <span className="text-red-500">*</span>
                </span>
              }
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" className="w-full" />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Email <span className="text-red-500">*</span>
                </span>
              }
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input placeholder="Nhập email" className="w-full" />
            </Form.Item>
            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea
                placeholder="Nhập ghi chú"
                rows={3}
                className="w-full"
              />
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
                  label={
                    <span>
                      Tên thú cưng <span className="text-red-500">*</span>
                    </span>
                  }
                  name={["pets", index, "petName"]}
                  rules={[
                    { required: true, message: "Vui lòng nhập tên thú cưng!" },
                  ]}
                >
                  <Input placeholder="Nhập tên thú cưng" className="w-full" />
                </Form.Item>
                <div className="flex mb-4 space-x-4">
                  <Form.Item
                    label={
                      <span>
                        Thú cưng của bạn là{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    name={["pets", index, "petType"]}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại thú cưng!",
                      },
                    ]}
                    className="w-1/2"
                  >
                    <Radio.Group>
                      <Radio value="dog">Chó</Radio>
                      <Radio value="cat">Mèo</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    label={
                      <span>
                        Chọn dịch vụ <span className="text-red-500">*</span>
                      </span>
                    }
                    name={["pets", index, "service"]}
                    rules={[
                      { required: true, message: "Vui lòng chọn dịch vụ!" },
                    ]}
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
                      ? `${petFormData[index].estimatedPrice.toLocaleString(
                          "vi-VN"
                        )} VNĐ`
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
                    label={
                      <span>
                        Chọn ngày hẹn <span className="text-red-500">*</span>
                      </span>
                    }
                    name={["pets", index, "date"]}
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày hẹn!" },
                    ]}
                    className="w-1/2"
                  >
                    <DatePicker
                      suffixIcon={<CalendarOutlined />}
                      className="w-full"
                      placeholder="21/01/2025"
                      disabledDate={disabledDate}
                      onChange={(date) => handleDateChange(date, index)}
                      value={selectedDates[index]}
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span>
                        Chọn giờ hẹn <span className="text-red-500">*</span>
                      </span>
                    }
                    name={["pets", index, "time"]}
                    rules={[
                      { required: true, message: "Vui lòng chọn giờ hẹn!" },
                    ]}
                    className="w-1/2"
                  >
                    <Select
                      placeholder="Vui lòng chọn ngày trước"
                      className="w-full"
                      disabled={!selectedDates[index]}
                    >
                      {getAvailableTimeSlots(index).map((time) => (
                        <Option key={time} value={time}>
                          {time} ({slotAvailability[index]?.[time] || 0} slot
                          còn lại)
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
