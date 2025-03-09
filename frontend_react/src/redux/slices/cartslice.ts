import { createSlice } from "@reduxjs/toolkit";

const saveCart = JSON.parse(localStorage.getItem("cart") || "[]");

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: saveCart,
  },
  reducers: {
    addToCart: (state, action) => {
      const { item, quantity } = action.payload;
      const existingItem = state.items.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ ...item, quantity });
      }
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((cartItem) => cartItem.id === action.payload.id);
      if (item) {
        item.quantity += 1;
      }
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((cartItem) => cartItem.id === action.payload.id);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    removeProduct: (state, action) => {
      state.items = state.items.filter((cartItem) => cartItem.id !== action.payload.id);
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    clearProduct: (state) => {
      state.items = [];
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
  },
});

export const { addToCart, increaseQuantity, decreaseQuantity, removeProduct, clearProduct } =
  cartSlice.actions;
export default cartSlice;