import React, { useEffect, useState, useRef } from "react";
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
  setGuestUserInfo,
  resetForm,
} from "../../redux/slices/spaBookingSlice";
import debounce from "lodash/debounce";

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
  guestUserInfo: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
}

const SpaBookingForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useSelector((state: { cart: CartState }) => state.cart);
  const spaBooking = useSelector(
    (state: { spaBooking: SpaBookingState }) => state.spaBooking
  );

  const [services, setServices] = useState<Service[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(
    moment().tz("Asia/Ho_Chi_Minh")
  );
  const [slotAvailability, setSlotAvailability] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

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

  const debouncedSetGuestUserInfo = debounce((guestInfo) => {
    dispatch(setGuestUserInfo(guestInfo));
  }, 500);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    const serializedValues = {
      ...allValues,
      pets: allValues.pets?.map((pet: any) => ({
        ...pet,
        date: pet.date ? moment(pet.date).toISOString() : null,
      })),
    };

    const guestInfo = {
      fullName: allValues.fullName,
      phone: allValues.phone,
      email: allValues.email,
    };
    debouncedSetGuestUserInfo(guestInfo);
    dispatch(setFormData(serializedValues));
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (Object.keys(spaBooking.formData).length > 0) {
        const deserializedFormData = {
          ...spaBooking.formData,
          pets: spaBooking.formData.pets?.map((pet: any) => ({
            ...pet,
            date: pet.date ? moment(pet.date) : null,
          })),
        };
        form.setFieldsValue(deserializedFormData);
      }
      const restoredDates = spaBooking.selectedDates.map((date) =>
        date ? moment(date) : null
      );
      dispatch(
        setSelectedDates(
          restoredDates.map((date) => (date ? date.toISOString() : null))
        )
      );
      restoredDates.forEach((date, index) => {
        if (date) fetchAvailableSlots(date, index);
      });
    }
    // Loại bỏ phần cập nhật form khi spaBooking.formData thay đổi
  }, [form, dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(moment().tz("Asia/Ho_Chi_Minh"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserDataFromLocalStorage = () => {
      if (userId) {
        const userDataFromStorage = localStorage.getItem("userData");
        if (userDataFromStorage) {
          const parsedUserData = JSON.parse(userDataFromStorage);
          setUserData({
            _id: parsedUserData._id,
            fullname: parsedUserData.fullname || "",
            phone_number: parsedUserData.phone_number || "",
            email: parsedUserData.email || "",
          });
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    };
    fetchUserDataFromLocalStorage();
  }, [userId]);

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
      console.error("Error fetching slots:", error);
      message.error("Không thể tải danh sách khung giờ, vui lòng thử lại!");
    }
  };

  const onFinish = async (values: any) => {
    console.log("Form values on submit:", values);
    // Kiểm tra thông tin khách hàng
    if (!values.fullName?.trim()) {
      message.error("Vui lòng nhập họ và tên!");
      return;
    }
    if (!values.phone?.trim()) {
      message.error("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!values.email?.trim()) {
      message.error("Vui lòng nhập email!");
      return;
    }

    // Kiểm tra từng pet: phải có ngày, giờ, phút, dịch vụ
    for (let index = 0; index < spaBooking.petForms.length; index++) {
      const pet = values.pets?.[index];

      if (!pet) {
        message.error(`Thiếu thông tin thú cưng ${index + 1}!`);
        return;
      }

      if (!pet.date) {
        message.error(`Vui lòng chọn ngày hẹn cho thú cưng ${index + 1}!`);
        return;
      }

      if (pet.hour === undefined || pet.hour === null) {
        message.error(`Vui lòng chọn giờ hẹn cho thú cưng ${index + 1}!`);
        return;
      }

      if (pet.minute === undefined || pet.minute === null) {
        message.error(`Vui lòng chọn phút cho thú cưng ${index + 1}!`);
        return;
      }

      if (!pet.service) {
        message.error(`Vui lòng chọn dịch vụ cho thú cưng ${index + 1}!`);
        return;
      }
    }

    // === KIỂM TRA SLOT CÓ CÒN TRỐNG KHÔNG (nếu cần) ===
    // (Bạn có thể bỏ qua nếu không muốn check kỹ, vì backend đã check rồi)
    // Nhưng nếu muốn giữ, sửa lại như sau:

    for (let index = 0; index < spaBooking.petForms.length; index++) {
      const pet = values.pets[index];
      const selectedDate = moment(pet.date); // đã là moment từ DatePicker
      const hour = pet.hour; // số: 8,9,14,...
      const minute = pet.minute || 0;

      const selectedService = services.find(s => s._id === pet.service);
      const duration = selectedService?.duration ? parseInt(selectedService.duration) : 60;
      const slotsNeeded = Math.ceil(duration / 60); // thường là 1

      const dateStr = selectedDate.format("YYYY-MM-DD");

      for (let i = 0; i < slotsNeeded; i++) {
        const checkHour = hour + i;
        const checkTimeKey = `${checkHour}h`;

        const availableInThisHour = slotAvailability[index]?.[checkTimeKey] ?? 0;

        // Đếm số pet đang cố book vào cùng giờ này
        let bookedByCurrentBooking = 0;
        for (let j = 0; j < spaBooking.petForms.length; j++) {
          const otherPet = values.pets[j];
          const otherHour = otherPet.hour;
          if (moment(otherPet.date).isSame(selectedDate, 'day') && (otherHour + Math.floor((otherPet.minute || 0) / 60)) === (hour + i)) {
            bookedByCurrentBooking++;
          }
        }

        if (bookedByCurrentBooking > availableInThisHour) {
          message.error(`Khung giờ ${checkHour}h ngày ${selectedDate.format("DD/MM/YYYY")} đã hết chỗ!`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      const guestInfo = {
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      };
      dispatch(setGuestUserInfo(guestInfo));

      const orderDetails = spaBooking.petForms.map((_, index) => {
        const pet = values.pets[index];
        const selectedDate = moment(pet.date);
        const startLocal = selectedDate.clone().set({
          hour: pet.hour,
          minute: pet.minute || 0,
          second: 0,
          millisecond: 0
        });

        const booking_date = startLocal.tz("Asia/Ho_Chi_Minh").utc().toDate().toISOString();

        return {
          productID: null,
          serviceID: pet.service,
          quantity: 1,
          product_price: spaBooking.petFormData[index]?.estimatedPrice || 0,
          booking_date: booking_date,
          petName: pet.petName?.trim() || "",
          petType: pet.petType || "",
          booking_note: values.note?.trim() || null,
        };
      });

      const orderData = {
        userID: userId || null,
        payment_typeID: null,
        deliveryID: null,
        couponID: null,
        orderdate: moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss"),
        shipping_address: null,
        orderDetails,
        infoUserGuest: guestInfo,
        booking_note: values.note?.trim() || null,
      };


      const response = await orderApi.create(orderData);

      message.success("Đặt lịch thành công! Chúng tôi sẽ gửi email xác nhận ngay.");

      if (userId) {
        localStorage.setItem("userData", JSON.stringify({
          ...userData,
          fullname: values.fullName.trim(),
        }));
      }

      form.resetFields();
      dispatch(resetForm());
      navigate(userId ? "/userprofile/bookings" : "/success-booking");

    } catch (error: any) {
      console.error("Booking failed:", error);
      const msg = error.response?.data?.message || "Đặt lịch thất bại, vui lòng thử lại!";
      message.error(msg);
    } finally {
      setLoading(false);
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
    const selectedDate = spaBooking.selectedDates[index]
      ? moment(spaBooking.selectedDates[index])
      : null;
    if (selectedDate) fetchAvailableSlots(selectedDate, index);
    const formValues = form.getFieldsValue();
    const serializedValues = {
      ...formValues,
      pets: formValues.pets?.map((pet: any) => ({
        ...pet,
        date: pet.date ? moment(pet.date).toISOString() : null,
      })),
    };
    dispatch(setFormData(serializedValues));
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
    const formValues = form.getFieldsValue();
    const serializedValues = {
      ...formValues,
      pets: formValues.pets?.map((pet: any) => ({
        ...pet,
        date: pet.date ? moment(pet.date).toISOString() : null,
      })),
    };
    form.setFieldsValue({ pets: { [index]: { time: undefined } } });
    dispatch(setFormData(serializedValues));
  };

  const handleTimeChange = (time: string, index: number) => {
    form.setFieldsValue({
      pets: {
        [index]: {
          time,
        },
      },
    });
    const formValues = form.getFieldsValue();
    const serializedValues = {
      ...formValues,
      pets: formValues.pets?.map((pet: any) => ({
        ...pet,
        date: pet.date ? moment(pet.date).toISOString() : null,
      })),
    };
    dispatch(setFormData(serializedValues));
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

  const handleViewPriceClick = () => {
    navigate("/info");
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
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
        >
          <CustomerInfoForm
            form={form}
            initialData={{
              fullName:
                userData?.fullname || spaBooking.guestUserInfo.fullName || "",
              phone:
                userData?.phone_number &&
                  /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(userData.phone_number)
                  ? userData.phone_number
                  : spaBooking.guestUserInfo.phone || "",
              email: userData?.email || spaBooking.guestUserInfo.email || "",
            }}
          />
          <PetFormContainer
            form={form}
            petForms={spaBooking.petForms}
            services={services}
            petFormData={spaBooking.petFormData}
            selectedDates={spaBooking.selectedDates.map((date) =>
              date ? moment(date) : null
            )}
            slotAvailability={slotAvailability}
            setPetForms={(newPetForms) => dispatch(setPetForms(newPetForms))}
            setPetFormData={(newPetFormData) =>
              dispatch(setPetFormData(newPetFormData))
            }
            setSelectedDates={(newDates) =>
              dispatch(
                setSelectedDates(
                  newDates.map((date) => (date ? date.toISOString() : null))
                )
              )
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
              loading={loading}
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
