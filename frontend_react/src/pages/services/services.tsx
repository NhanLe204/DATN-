import React, { useEffect, useState } from "react";
import { Form, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment-timezone";
import serviceApi from "../../api/serviceApi";
import orderApi from "../../api/orderApi";
import CustomerInfoForm from "../../components/booking/CustomerInfoForm";
import PetFormContainer from "../../components/booking/PetFormContainer";
import {
  setFormData,
  setPetForms,
  setPetFormData,
  setSelectedDates,
  resetForm,
} from "../../redux/slices/spaBookingSlice";

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

interface SpaBookingState {
  formData: any;
  petForms: number[];
  petFormData: { estimatedPrice?: number; estimatedDuration?: string }[];
  selectedDates: (string | null)[];
}

const SpaBookingForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useSelector((state: { cart: CartState }) => state.cart);
  const spaBooking = useSelector((state: { spaBooking: SpaBookingState }) => state.spaBooking);

  const [services, setServices] = useState<Service[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(moment().tz("Asia/Ho_Chi_Minh"));
  const [slotAvailability, setSlotAvailability] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [userData, setUserData] = useState<User | null>(null);

  const availableTimeSlots = ["8h", "9h", "10h", "11h", "13h", "14h", "15h", "16h", "17h"];

  // Khôi phục dữ liệu từ Redux khi mount
  useEffect(() => {
    form.setFieldsValue(spaBooking.formData);
    const restoredDates = spaBooking.selectedDates.map((date) =>
      date ? moment(date) : null
    );
    setSelectedDates(restoredDates);
    restoredDates.forEach((date, index) => {
      if (date) fetchAvailableSlots(date, index);
    });
  }, [form, spaBooking.formData, spaBooking.selectedDates]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(moment().tz("Asia/Ho_Chi_Minh"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
  }, []);

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

  const fetchAvailableSlots = async (date: moment.Moment | null, index: number) => {
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
      console.log(`Available slots for ${dateStr}:`, response.data);
      setSlotAvailability((prev) => ({
        ...prev,
        [index]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching slots:", error);
      message.error("Không thể tải danh sách khung giờ, vui lòng thử lại!");
    }
  };

  const onFinish = async (values: any) => {
    console.log("Form values on submit:", values);

    const totalPrice = spaBooking.petFormData.reduce(
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
    for (let index = 0; index < spaBooking.petForms.length; index++) {
      const selectedDate = moment(spaBooking.selectedDates[index]);
      const selectedTime = values.pets[index]?.time;

      if (!selectedDate || !selectedTime) {
        message.error(`Vui lòng chọn ngày và giờ hẹn cho pet ${index + 1}!`);
        return;
      }

      const selectedServiceId = values.pets[index].service;
      const selectedService = services.find((s) => s._id === selectedServiceId);
      const duration = selectedService?.duration ? parseInt(selectedService.duration) : 60;
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
            `Không đủ slot cho khung giờ ${checkTime} ngày ${selectedDate.format("DD/MM/YYYY")}!`
          );
          return;
        }
      }
    }

    const orderDetails = spaBooking.petForms.map((index) => {
      const selectedDate = moment(spaBooking.selectedDates[index]);
      const selectedTime = values.pets[index].time;
      const hour = parseInt(selectedTime.replace("h", ""), 10);
      const serviceTime = selectedDate.clone().set({
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
        product_price: spaBooking.petFormData[index].estimatedPrice || 0,
        booking_date: serviceTimeString,
        petName: values.pets[index].petName || "",
        petType: values.pets[index].petType || "",
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
      console.log("test",response);
      
      message.success("Đặt lịch thành công!");
      form.resetFields();
      dispatch(resetForm());
      navigate("/userprofile/bookings");
    } catch (error) {
      console.error("API Error Details:", error.response?.data);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch!";
      message.error(errorMessage);
    }
  };

  const handleServiceChange = (value: string, index: number) => {
    const selectedService = services.find((service) => service._id === value);
    const updatedPetFormData = [...spaBooking.petFormData];
    updatedPetFormData[index] = {
      estimatedPrice: selectedService?.service_price || 0,
      estimatedDuration: selectedService?.duration,
    };
    dispatch(setPetFormData(updatedPetFormData));
    form.setFieldsValue({
      pets: {
        [index]: {
          estimatedPrice: selectedService?.service_price || 0,
          estimatedDuration: selectedService?.duration,
          time: form.getFieldValue(["pets", index, "time"]), 
        },
      },
    });
    const selectedDate = spaBooking.selectedDates[index] ? moment(spaBooking.selectedDates[index]) : null;
    if (selectedDate) fetchAvailableSlots(selectedDate, index);
    dispatch(setFormData(form.getFieldsValue()));
  };

  const handleDateChange = (date: moment.Moment | null, index: number) => {
    const updatedDates = [...spaBooking.selectedDates];
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
      updatedDates[index] = newDate.toISOString();
      fetchAvailableSlots(newDate, index);
    } else {
      updatedDates[index] = null;
      fetchAvailableSlots(null, index);
    }
    dispatch(setSelectedDates(updatedDates));
    form.setFieldsValue({ pets: { [index]: { time: undefined } } });
    dispatch(setFormData(form.getFieldsValue()));
  };

  const handleTimeChange = (time: string, index: number) => {
    form.setFieldsValue({
      pets: {
        [index]: {
          time,
        },
      },
    });
    dispatch(setFormData(form.getFieldsValue())); 
  };

  const getAvailableTimeSlots = (index: number) => {
    const selectedDate = spaBooking.selectedDates[index]
      ? moment(spaBooking.selectedDates[index])
      : null;
    if (!selectedDate) return availableTimeSlots;

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
    const selectedServiceId = form.getFieldValue(["pets", index, "service"]);
    const selectedService = services.find((s) => s._id === selectedServiceId);
    const duration = selectedService?.duration ? parseInt(selectedService.duration) : 60;
    const slotsNeeded = Math.ceil(duration / 60);

    if (Object.keys(slotsForDate).length === 0) return baseSlots;

    return baseSlots.filter((time) => {
      const hour = parseInt(time.replace("h", ""), 10);
      for (let i = 0; i < slotsNeeded; i++) {
        const checkHour = hour + i;
        const checkTime = `${checkHour}h`;
        const slotsAvailable = slotsForDate[checkTime] || 0;
        if (slotsAvailable <= 0 || !availableTimeSlots.includes(checkTime)) return false;
      }
      return true;
    });
  };

  const handleViewPriceClick = () => {
    navigate("/info");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold text-center">ĐẶT LỊCH SPA CHO THÚ CƯNG</h1>
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
            petForms={spaBooking.petForms}
            services={services}
            petFormData={spaBooking.petFormData}
            selectedDates={spaBooking.selectedDates.map((date) => (date ? moment(date) : null))}
            slotAvailability={slotAvailability}
            setPetForms={(newPetForms) => dispatch(setPetForms(newPetForms))}
            setPetFormData={(newPetFormData) => dispatch(setPetFormData(newPetFormData))}
            setSelectedDates={(newDates) =>
              dispatch(setSelectedDates(newDates.map((date) => (date ? date.toISOString() : null))))
            }
            setSlotAvailability={setSlotAvailability}
            handleServiceChange={handleServiceChange}
            handleDateChange={handleDateChange}
            handleTimeChange={handleTimeChange}
            getAvailableTimeSlots={getAvailableTimeSlots}
            onViewPriceClick={handleViewPriceClick}
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