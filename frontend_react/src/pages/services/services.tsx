import React, { useEffect, useState } from "react";
import { Form, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import serviceApi from "../../api/serviceApi";
import orderApi from "../../api/orderApi";
import CustomerInfoForm from "../../components/booking/CustomerInfoForm";
import PetFormContainer from "../../components/booking/PetFormContainer";

interface Service {
  _id: string;
  service_name: string;
  service_price: number;
  duration?: string;
}

interface CartState {
  userId: string | null;
}

interface User {
  _id: string;
  fullname: string;
  phone_number: string;
  email: string;
}

const SpaBookingForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userId } = useSelector((state: { cart: CartState }) => state.cart);
  const [petForms, setPetForms] = useState<number[]>([0]);
  const [services, setServices] = useState<Service[]>([]);
  const [petFormData, setPetFormData] = useState<
    { estimatedPrice?: number; estimatedDuration?: string }[]
  >([{ estimatedPrice: undefined, estimatedDuration: undefined }]);
  const [selectedDates, setSelectedDates] = useState<(moment.Moment | null)[]>([
    null,
  ]);
  const [currentDateTime, setCurrentDateTime] = useState(
    moment().tz("Asia/Ho_Chi_Minh")
  );
  const [slotAvailability, setSlotAvailability] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [userData, setUserData] = useState<User | null>(null); 

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

  // Lấy dữ liệu người dùng từ localStorage
  useEffect(() => {
    const fetchUserDataFromLocalStorage = () => {
      const userDataFromStorage = localStorage.getItem("userData");
      if (userDataFromStorage) {
        const parsedUserData = JSON.parse(userDataFromStorage);
        setUserData({
          _id: parsedUserData._id,
          fullname: parsedUserData.fullname,
          phone_number: parsedUserData.phone_number,
          email: parsedUserData.email,
        });
      } else {
        console.warn("Không tìm thấy userData trong localStorage");
      }
    };

    fetchUserDataFromLocalStorage();
  }, []); // Chỉ chạy một lần khi component mount

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
    fetchServices();
  }, []);

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
      setSlotAvailability((prev) => ({
        ...prev,
        [index]: response.data,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách khung giờ, vui lòng thử lại!");
    }
  };

  const onFinish = async (values: any) => {
    console.log("Form values on submit:", values);
  
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
  
    const slotUsage: { [key: string]: number } = {};
    for (let index = 0; index < petForms.length; index++) {
      const selectedDate = selectedDates[index];
      const selectedTime = values.pets[index]?.time;
  
      if (!selectedDate || !selectedTime) {
        message.error(`Vui lòng chọn ngày và giờ hẹn cho pet ${index + 1}!`);
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
            )}!`
          );
          return;
        }
      }
    }
  
    const orderDetails = petForms.map((index) => {
      const selectedDate = selectedDates[index];
      const selectedTime = values.pets[index].time;
      const hour = parseInt(selectedTime.replace("h", ""), 10);
      const serviceTime = selectedDate!.clone().set({
        hour,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      const serviceTimeString = serviceTime.format("YYYY-MM-DDTHH:00:00.000+07:00");
  
      return {
        productID: null,
        serviceID: values.pets[index].service,
        quantity: 1,
        product_price: petFormData[index].estimatedPrice || 0,
        booking_date: serviceTimeString,
        petName: values.pets[index].petName || "", // Thêm petName
        petType: values.pets[index].petType || "", // Thêm petType
      };
    });
  
    const orderData = {
      userID: userId,
      payment_typeID: null,
      deliveryID: null,
      couponID: null,
      orderdate: moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss"),
      total_price: totalPrice,
      shipping_address: null,
      transaction_id: `TRANS_${Date.now()}`,
      orderDetails,
      inforUserGuest: {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
      },
      note: values.note || "",
    };
  
    console.log("Order data being sent:", orderData);
  
    try {
      const response = await orderApi.create(orderData);
      message.success("Đặt lịch thành công!");
      form.resetFields();
      setPetFormData(
        petForms.map(() => ({
          estimatedPrice: undefined,
          estimatedDuration: undefined,
        }))
      );
      setSelectedDates(petForms.map(() => null));
      setPetForms([0]);
      navigate("/userprofile/bookings")
    } catch (error) {
      console.error("API Error Details:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch!";
      message.error(errorMessage);
    }
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
          time: undefined,
        },
      },
    });
    if (selectedDates[index]) fetchAvailableSlots(selectedDates[index], index);
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

  const getAvailableTimeSlots = (index: number) => {
    const selectedDate = selectedDates[index];
    if (!selectedDate) return availableTimeSlots;

    const isToday = selectedDate.isSame(
      moment().tz("Asia/Ho_Chi_Minh"),
      "day"
    );
    let baseSlots = availableTimeSlots;

    if (isToday) {
      const currentHour = currentDateTime.hour();
      baseSlots = availableTimeSlots.filter((time) => {
        const hour = parseInt(time.replace("h", ""), 10);
        return hour > currentHour;
      });
    }

    const slotsForDate = slotAvailability[index] || {};
    const selectedServiceId = form.getFieldValue(["pets", index, "service"]);
    const selectedService = services.find((s) => s._id === selectedServiceId);
    const duration = selectedService?.duration
      ? parseInt(selectedService.duration)
      : 60;
    const slotsNeeded = Math.ceil(duration / 60);

    if (Object.keys(slotsForDate).length === 0) return baseSlots;

    return baseSlots.filter((time) => {
      const hour = parseInt(time.replace("h", ""), 10);
      for (let i = 0; i < slotsNeeded; i++) {
        const checkHour = hour + i;
        const checkTime = `${checkHour}h`;
        const slotsAvailable = slotsForDate[checkTime] || 0;
        if (slotsAvailable <= 0 || !availableTimeSlots.includes(checkTime))
          return false;
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold text-center">
        ĐẶT LỊCH SPA CHO THÚ CƯNG
      </h1>
      <p
        className="text-[#22A6DF] text-center mb-6 cursor-pointer hover:underline"
        onClick={() => navigate("/info")}
      >
        Thông tin cần biết về dịch vụ chăm sóc thú cưng tại Pet Heaven
      </p>
      <div className="max-w-2xl p-6 mx-auto bg-white rounded-lg shadow-md">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <CustomerInfoForm
            form={form}
            initialData={{
              fullName: userData?.fullname || "",
              phone: userData?.phone_number || "",
              email: userData?.email || "",
              note: "",
            }}
          />
          <PetFormContainer
            form={form}
            petForms={petForms}
            services={services}
            petFormData={petFormData}
            selectedDates={selectedDates}
            slotAvailability={slotAvailability}
            setPetForms={setPetForms}
            setPetFormData={setPetFormData}
            setSelectedDates={setSelectedDates}
            setSlotAvailability={setSlotAvailability}
            handleServiceChange={handleServiceChange}
            handleDateChange={handleDateChange}
            getAvailableTimeSlots={getAvailableTimeSlots}
          />
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