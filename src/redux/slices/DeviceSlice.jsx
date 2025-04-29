import { Base_Url } from '@/config/Baseurl';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDevices = createAsyncThunk(
  'device/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Base_Url}/api/panel-fetch-device`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.device;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
    devices: [],
    selectedDevice: null,
    status: 'idle',
    error: null,
    lastFetched: null 
};

const DeviceSlice = createSlice({
    name: 'device',
    initialState,
    reducers: {
      setSelectedDevice: (state, action) => {
        const device = state.devices.find(d => d.macid === action.payload);
        if (device) {
          state.selectedDevice = device;
        }
      },
      
      refreshDevices: (state) => {
        state.lastFetched = null;
      }
    },
    extraReducers(builder) {
      builder
        .addCase(fetchDevices.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchDevices.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.lastFetched = Date.now();
          state.devices = action.payload.map(device => ({
            name: device.deviceNameOrId,
            deviceid: device.deviceNameOrId,
            macid: device.deviceMacAddress
          }));
          
          if (!state.selectedDevice && action.payload.length > 0) {
            state.selectedDevice = {
              name: action.payload[0].deviceNameOrId,
              deviceid: action.payload[0].deviceNameOrId,
              macid: action.payload[0].deviceMacAddress
            };
          }
        })
        .addCase(fetchDevices.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload?.message || 'Failed to fetch devices';
        });
    }
});

export const { setSelectedDevice, refreshDevices } = DeviceSlice.actions;
export default DeviceSlice.reducer;