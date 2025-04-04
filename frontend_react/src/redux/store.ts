import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./slices/cartslice";
import spaBookingSlice from "./slices/spaBookingSlice";

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer, 
    spaBooking: spaBookingSlice,
  },
});

// Định nghĩa type cho RootState và AppDispatch để dùng trong TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;