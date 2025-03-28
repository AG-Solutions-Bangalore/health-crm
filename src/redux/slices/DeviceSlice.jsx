import { createSlice } from '@reduxjs/toolkit';


const  devices= [
    {
      name: "device 5",
      deviceid: "test(1056)",
      macid: "64:f6:bb:83:7b:d9"
    },
    {
      name: "device1",
      deviceid: "LT22CG1137",
      macid: "64:f6:bb:83:78:70"
    },
    {
      name: "device2",
      deviceid: "LT22CG1090",
      macid: "64:f6:bb:83:78:0c"
    },
    {
      name: "device3",
      deviceid: "LT22CG1092",
      macid: "64:f6:bb:83:75:d9"
    },
    {
      name: "device4",
      deviceid: "LT22CG1094",
      macid: "64:f6:bb:83:7a:3d"
    }
  ]


const initialState = {
    devices,
    selectedDevice: devices[0]
 
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
      }
    }
  });

export const { setSelectedDevice } = DeviceSlice.actions;
export default DeviceSlice.reducer;