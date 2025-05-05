import React from "react";
import PetInfoForm from "./PetInfoForm";
import { message } from "antd";
import moment from "moment-timezone";

interface PetFormContainerProps {
  form: any;
  petForms: number[];
  services: any[];
  petFormData: { estimatedPrice?: number; estimatedDuration?: string }[];
  selectedDates: (moment.Moment | null)[];
  slotAvailability: { [key: string]: { [key: string]: number } };
  setPetForms: (forms: number[]) => void;
  setPetFormData: (data: any[]) => void;
  setSelectedDates: (dates: (moment.Moment | null)[]) => void;
  setSlotAvailability: (availability: any) => void;
  handleServiceChange: (value: string, index: number) => void;
  handleDateChange: (date: moment.Moment | null, index: number) => void;
  handleTimeChange: (time: string, index: number) => void;
  getAvailableTimeSlots: (index: number) => string[];
  onViewPriceClick?: () => void;
}

const PetFormContainer: React.FC<PetFormContainerProps> = ({
  form,
  petForms,
  services,
  petFormData,
  selectedDates,
  slotAvailability,
  setPetForms,
  setPetFormData,
  setSelectedDates,
  setSlotAvailability,
  handleServiceChange,
  handleDateChange,
  handleTimeChange,
  getAvailableTimeSlots,
  onViewPriceClick,
}) => {
  const addPetForm = () => {
    if (petForms.length < 5) {
      // Kiểm tra xem có slot khả dụng cho ít nhất một ngày trong tương lai
      const hasAvailableSlots = Object.values(slotAvailability).some(
        (slots) =>
          Object.values(slots).some((count) => count > petForms.length)
      );

      if (!hasAvailableSlots && petForms.length > 0) {
        message.warning(
          "Không còn khung giờ nào đủ slot để thêm thú cưng mới!"
        );
        return;
      }

      setPetForms([...petForms, petForms.length]);
      setPetFormData([
        ...petFormData,
        { estimatedPrice: undefined, estimatedDuration: undefined },
      ]);
      setSelectedDates([...selectedDates, null]);
    } else {
      message.warning("Pet Heaven chỉ nhận tối đa 5 thú cưng cho 1 lịch hẹn!");
    }
  };

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

  return (
    <div className="p-6 mb-6 border border-gray-200 rounded-md">
      <h2 className="mb-4 text-lg font-semibold text-center">
        THÔNG TIN THÚ CƯNG
      </h2>
      {petForms.map((index) => (
        <PetInfoForm
          key={index}
          index={index}
          form={form}
          services={services}
          petFormData={petFormData[index]}
          selectedDate={selectedDates[index]}
          availableTimeSlots={getAvailableTimeSlots(index)}
          slotAvailability={slotAvailability[index] || {}}
          handleServiceChange={handleServiceChange}
          handleDateChange={handleDateChange}
          handleTimeChange={handleTimeChange}
          removePetForm={petForms.length > 1 && index > 0 ? removePetForm : undefined}
          isRemovable={petForms.length > 1 && index > 0}
          onViewPriceClick={onViewPriceClick}
        />
      ))}
      {petForms.length < 5 && (
        <div
          className="text-[#22A6DF] cursor-pointer mb-4"
          onClick={addPetForm}
        >
          + Thêm thú cưng
        </div>
      )}
    </div>
  );
};

export default PetFormContainer;