import { useState } from "react";
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
import { setSelectedDevice } from "@/redux/slices/DeviceSlice";

const Navbar = ({
  toggleSidebar,
  isSidebarOpen,
  toggleCollapse,
  isCollapsed,
}) => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { devices, selectedDevice } = useSelector((state) => state.device);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    toast.success("LogOut Successfully");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.log(`Error attempting to enable fullscreen: ${e.message}`);
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
                Health Care
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
            <Select
              value={selectedDevice?.macid || ""}
              onValueChange={handleDeviceChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.macid} value={device.macid}>
                    {device.deviceid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
            </button>
          </div>

          <div className="relative lg:hidden">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle dropdown"
            >
              <FaUserCircle className="text-blue-700" size={20} />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 p-2 flex flex-col items-center gap-4  bg-white border border-gray-200 rounded-lg shadow-lg">
                <Select
              value={selectedDevice?.macid || ""}
              onValueChange={handleDeviceChange}
            >
              <SelectTrigger >
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.macid} value={device.macid}>
                    {device.deviceid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                <Button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                  className="w-full bg-gray-50 text-black px-4 py-2 text-sm  hover:bg-gray-100 text-left"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <Button onClick={() => setIsLogoutDialogOpen(true)}>Logout</Button>
          </div>
        </div>
      </div>

      {isLogoutDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-700 mb-4">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutDialogOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
