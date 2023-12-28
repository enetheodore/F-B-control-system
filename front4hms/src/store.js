import { createSlice, configureStore } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  role: null,
  open: false,
  notifications: [],
  purchaserNotifications: [],
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.role = null;
    },
    showMenu: (state) => {
      state.open = true;
    },
    showNotification: (state) => {
      state.open = false;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(
        (notification) => notification === action.payload
      );
      if (index !== -1) {
        state.notifications.splice(index, 1);
      }
    },
    removeAllNotifications: (state) => {
      state.notifications = [];
    },

    addPurchaserNotification: (state, action) => {
      state.purchaserNotifications.push(action.payload);
    },
  },
});

const store = configureStore({
  reducer: appSlice.reducer,
});

export const {
  loginSuccess,
  logout,
  showMenu,
  showNotification,
  addNotification,
  removeAllNotifications,
  removeNotification,
  addPurchaserNotification,
} = appSlice.actions;

export default store;
