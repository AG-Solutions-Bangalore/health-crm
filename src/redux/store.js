import { configureStore } from "@reduxjs/toolkit";
import DeviceSlice from "./slices/DeviceSlice"

const Store = configureStore({
  reducer: {
    device: DeviceSlice
  },
});
export default Store;