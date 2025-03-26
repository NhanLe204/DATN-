import { createSlice } from "@reduxjs/toolkit";
// Lấy userId từ localStorage, đảm bảo trả về chuỗi hoặc null
const getUserIdFromLocal = () => {
  const userId = localStorage.getItem("accountID");
  if (!userId) return null;

  try {
    // Nếu userId là chuỗi dạng JSON (ví dụ: "[...]" hoặc "{...}"), parse và lấy giá trị
    const parsed = JSON.parse(userId);
    if (Array.isArray(parsed)) {
      return parsed[0]; // Lấy phần tử đầu tiên nếu là mảng
    }
    return parsed; // Nếu không phải mảng, trả về giá trị đã parse
  } catch (e) {
    // Nếu không parse được (tức là userId đã là chuỗi bình thường), trả về nguyên giá trị
    return userId;
  }
};

// Lấy toàn bộ cart từ localStorage, nếu không có thì trả về object rỗng
const getAllCartsFromLocal = (): Record<
  string,
  { id: string; quantity: number }[]
> => {
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
        // Khi đăng xuất: xóa accountID và toàn bộ carts
        localStorage.removeItem("accountID");
        // localStorage.removeItem("carts"); // Xóa toàn bộ carts khi đăng xuất
        state.userId = null;
        state.items = [];
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
      saveCartsToLocal(state.userId, state.items);
    },
    increaseQuantity: (state, action) => {
      if (!state.userId) return;
      const item = state.items.find(
        (cartItem) => cartItem.id === action.payload.id
      );
      if (item) {
        item.quantity += 1;
        saveCartsToLocal(state.userId, state.items);
      }
    },
    decreaseQuantity: (state, action) => {
      if (!state.userId) return;
      const item = state.items.find(
        (cartItem) => cartItem.id === action.payload.id
      );
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveCartsToLocal(state.userId, state.items);
      }
    },
    removeProduct: (state, action) => {
      if (!state.userId) return;
      state.items = state.items.filter(
        (cartItem) => cartItem.id !== action.payload.id
      );
      saveCartsToLocal(state.userId, state.items);
    },
    clearProduct: (state) => {
      if (!state.userId) return;
      state.items = [];
      // Xóa giỏ hàng của userId hiện tại khỏi localStorage
      const allCarts = getAllCartsFromLocal();
      delete allCarts[state.userId];
      // Nếu không còn user nào trong allCarts, xóa key "carts"
      if (Object.keys(allCarts).length === 0) {
        localStorage.removeItem("carts");
      } else {
        localStorage.setItem("carts", JSON.stringify(allCarts));
      }
    },
  },
});
// Hàm helper để lưu carts vào localStorage
const saveCartsToLocal = (userId, items) => {
  const allCarts = getAllCartsFromLocal();
  allCarts[userId] = items;

  // Nếu không có sản phẩm nào trong allCarts, xóa key "carts"
  const hasItems = Object.values(allCarts).some(
    (cart: { id: string; quantity: number }[]) => cart.length > 0
  );
  if (!hasItems) {
    localStorage.removeItem("carts");
  } else {
    localStorage.setItem("carts", JSON.stringify(allCarts));
  }
};

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeProduct,
  clearProduct,
  setUserId,
} = cartSlice.actions;
export default cartSlice;
