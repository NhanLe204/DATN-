import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment, { Moment } from "moment-timezone";

interface PetFormData {
  estimatedPrice?: number;
  estimatedDuration?: string;
}

interface SpaBookingState {
  formData: any; // Dữ liệu từ Form Antd
  petForms: number[];
  petFormData: PetFormData[];
  selectedDates: (string | null)[]; // Lưu dưới dạng ISO string để serialize
}

const initialState: SpaBookingState = {
  formData: {},
  petForms: [0],
  petFormData: [{ estimatedPrice: undefined, estimatedDuration: undefined }],
  selectedDates: [null],
};

const spaBookingSlice = createSlice({
  name: "spaBooking",
  initialState,
  reducers: {
    setFormData(state, action: PayloadAction<any>) {
      state.formData = action.payload;
    },
    setPetForms(state, action: PayloadAction<number[]>) {
      state.petForms = action.payload;
    },
    setPetFormData(state, action: PayloadAction<PetFormData[]>) {
      state.petFormData = action.payload;
    },
    setSelectedDates(state, action: PayloadAction<(string | null)[]>) {
      state.selectedDates = action.payload;
    },
    resetForm(state) {
      state.formData = initialState.formData;
      state.petForms = initialState.petForms;
      state.petFormData = initialState.petFormData;
      state.selectedDates = initialState.selectedDates;
    },
  },
});

export const { setFormData, setPetForms, setPetFormData, setSelectedDates, resetForm } =
  spaBookingSlice.actions;
export default spaBookingSlice.reducer;