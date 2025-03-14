import { createSlice } from "@reduxjs/toolkit";

// Hàm helper để lấy accountID từ localStorage
const getUserIdFromLocal = () => {
  return localStorage.getItem("accountID") || null;
};

// Lấy toàn bộ cart từ localStorage, nếu không có thì trả về object rỗng
const getAllCartsFromLocal = () => {
  const savedCarts = localStorage.getItem("carts");
  return savedCarts ? JSON.parse(savedCarts) : {};
};

// Lấy cart của userId hiện tại
const getCartForUser = (userId) => {
  const allCarts = getAllCartsFromLocal();
  return allCarts[userId] || [];
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: getCartForUser(getUserIdFromLocal()), // Chỉ lấy cart của userId hiện tại
    userId: getUserIdFromLocal(),
  },
  reducers: {
    setUserId: (state, action) => {
      const newUserId = action.payload;
      state.userId = newUserId;

      if (newUserId) {
        // Khi đăng nhập: lưu userId mới
        localStorage.setItem("accountID", newUserId);
        // Cập nhật state.items với cart của userId mới
        state.items = getCartForUser(newUserId);
      } else {
        // Khi đăng xuất: chỉ xóa accountID, giữ lại carts của các user khác
        localStorage.removeItem("accountID");
        state.userId = null;
        state.items = []; // Reset cart trong state, nhưng không xóa localStorage.carts
      }
    },

    addToCart: (state, action) => {
      if (!state.userId) {
        console.log("User must be logged in to add items to cart");
        return;
      }
      const { item, quantity } = action.payload;
      const existingItem = state.items.find(
        (cartItem) => cartItem.id === item.id
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ ...item, quantity });
      }
      // Lưu lại toàn bộ carts vào localStorage
      saveCartsToLocal(state.userId, state.items);
    },

    increaseQuantity: (state, action) => {
      if (!state.userId) return;
      const item = state.items.find((cartItem) => cartItem.id === action.payload.id);
      if (item) {
        item.quantity += 1;
        saveCartsToLocal(state.userId, state.items);
      }
    },

    decreaseQuantity: (state, action) => {
      if (!state.userId) return;
      const item = state.items.find((cartItem) => cartItem.id === action.payload.id);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveCartsToLocal(state.userId, state.items);
      }
    },

    removeProduct: (state, action) => {
      if (!state.userId) return;
      state.items = state.items.filter((cartItem) => cartItem.id !== action.payload.id);
      saveCartsToLocal(state.userId, state.items);
    },

    clearProduct: (state) => {
      if (!state.userId) return;
      state.items = [];
      saveCartsToLocal(state.userId, state.items);
    },
  },
});

// Hàm helper để lưu carts vào localStorage
const saveCartsToLocal = (userId, items) => {
  const allCarts = getAllCartsFromLocal();
  allCarts[userId] = items;
  localStorage.setItem("carts", JSON.stringify(allCarts));
};

export const { addToCart, increaseQuantity, decreaseQuantity, removeProduct, clearProduct, setUserId } = cartSlice.actions;
export default cartSlice;