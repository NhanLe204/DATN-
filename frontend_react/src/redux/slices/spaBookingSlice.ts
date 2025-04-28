import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment, { Moment } from "moment-timezone";

interface PetFormData {
  estimatedPrice?: number;
  estimatedDuration?: string;
}

interface GuestUserInfo {
  fullName?: string;
  phone?: string;
  email?: string;
  note?: string;
}

interface SpaBookingState {
  formData: any;
  petForms: number[];
  petFormData: PetFormData[];
  selectedDates: (string | null)[];
  guestUserInfo: GuestUserInfo;
}

// Initialize guestUserInfo from localStorage if available
const loadGuestUserInfo = (): GuestUserInfo => {
  const savedGuestInfo = localStorage.getItem("guestUserInfo");
  return savedGuestInfo ? JSON.parse(savedGuestInfo) : {};
};

const initialState: SpaBookingState = {
  formData: {},
  petForms: [0],
  petFormData: [{ estimatedPrice: undefined, estimatedDuration: undefined }],
  selectedDates: [null],
  guestUserInfo: loadGuestUserInfo(),
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
    setGuestUserInfo(state, action: PayloadAction<GuestUserInfo>) {
      state.guestUserInfo = action.payload;
      localStorage.setItem("guestUserInfo", JSON.stringify(action.payload));
    },
    resetForm(state) {
      state.formData = initialState.formData;
      state.petForms = initialState.petForms;
      state.petFormData = initialState.petFormData;
      state.selectedDates = initialState.selectedDates;
      state.guestUserInfo = initialState.guestUserInfo;
      localStorage.removeItem("guestUserInfo");
    },
  },
});

export const {
  setFormData,
  setPetForms,
  setPetFormData,
  setSelectedDates,
  setGuestUserInfo,
  resetForm,
} = spaBookingSlice.actions;
export default spaBookingSlice.reducer;