import { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaExpand,
  FaCompress,
  FaChevronRight,
  FaChevronLeft,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDevice, fetchDevices } from "@/redux/slices/DeviceSlice";
import Logout from "./logOut/Logout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const Navbar = ({
  toggleSidebar,
  isSidebarOpen,
  toggleCollapse,
  isCollapsed,
}) => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { devices, selectedDevice, status, error ,lastFetched} = useSelector((state) => state.device);

  useEffect(() => {
    if (status === 'succeeded') {
      const selectedExists = devices.find(device => device.macid === selectedDevice?.macid);
      if (!selectedExists && devices.length > 0) {
        dispatch(setSelectedDevice(devices[0].macid));
      }
    }
  }, [status, devices, selectedDevice, dispatch]);

  
  useEffect(() => {
    
    if (!lastFetched || Date.now() - lastFetched > 300000) {
      dispatch(fetchDevices());
    }
  }, [dispatch, lastFetched]);

  useEffect(() => {
    if (status === 'failed' && error) {
      toast.error("Failed to load devices: " + error);
    }
  }, [status, error]);

  // Loading animation effect
  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(0);
    }
  }, [status]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        toast.error(`Fullscreen error: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleDeviceChange = (macid) => {
    dispatch(setSelectedDevice(macid));
    toast.success(`Device ${devices.find(d => d.macid === macid)?.deviceid} selected`);
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-semibold flex items-center space-x-2">
            <div className="flex items-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-yellow-800"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-yellow-900 leading-tight">
              Qurithealthcare
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors block lg:hidden"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <button
            onClick={toggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:inline-block"
            aria-label="Collapse sidebar"
          >
            {isCollapsed ? (
              <FaChevronRight size={20} />
            ) : (
              <FaChevronLeft size={20} />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">
            {status === 'loading' ? (
              <div className="w-[180px] h-10 flex items-center justify-center relative">
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <span className="absolute text-xs text-blue-600">
                  {loadingProgress}%
                </span>
              </div>
            ) : (
              <Select
                value={selectedDevice?.macid || ""}
                onValueChange={handleDeviceChange}
                disabled={status !== 'succeeded'}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue 
                    placeholder={
                      status === 'failed' ? "Error loading devices" : 
                      devices.length === 0 ? "No devices" :
                      selectedDevice ? selectedDevice.deviceid : "Select a device"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.macid} value={device.macid}>
                      {device.deviceid}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

<TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className={`p-2 hover:bg-gray-100rounded-lg transition-colors`}
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


          </div>

          <div className="relative lg:hidden">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle dropdown"
            >
              <FaUserCircle className="text-blue-700" size={20} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 p-2 flex flex-col items-center gap-4 bg-white border border-gray-200 rounded-lg shadow-lg">
                {status === 'loading' ? (
                  <div className="w-[180px] h-10 flex items-center justify-center relative">
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                    <span className="absolute text-xs text-blue-600">
                      {loadingProgress}%
                    </span>
                  </div>
                ) : (
                  <Select
                    value={selectedDevice?.macid || ""}
                    onValueChange={(value) => {
                      handleDeviceChange(value);
                      setIsDropdownOpen(false);
                    }}
                    disabled={status !== 'succeeded'}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue 
                        placeholder={
                          status === 'failed' ? "Error" : 
                          devices.length === 0 ? "No devices" :
                          selectedDevice ? selectedDevice.deviceid : "Select device"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem key={device.macid} value={device.macid}>
                          {device.deviceid}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                  className="w-full   px-4 py-2 text-sm hover:bg-gray-100 text-left"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <Button 
              onClick={() => setIsLogoutDialogOpen(true)}
              variant="default"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <Logout open={isLogoutDialogOpen} handleOpen={setIsLogoutDialogOpen} />
    </nav>
  );
};

export default Navbar;


//sajid 