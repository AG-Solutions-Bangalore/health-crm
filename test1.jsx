import { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaExpand,
  FaCompress,
  FaChevronRight,
  FaChevronLeft,
  FaUserCircle,
  FaSun,
  FaMoon,
  FaBell,
  FaSearch,
  FaCog,
  FaQuestionCircle,
  FaClipboardList
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

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
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { devices, selectedDevice, status, error, lastFetched } = useSelector((state) => state.device);

  // Mock notifications for demonstration
  useEffect(() => {
    const mockNotifications = [
      { id: 1, title: "Patient Alert", message: "New readings for patient #28456", time: "5 min ago", read: false },
      { id: 2, title: "System Update", message: "Software update available", time: "1 hour ago", read: false },
      { id: 3, title: "Appointment", message: "New appointment scheduled", time: "3 hours ago", read: true },
      { id: 4, title: "Device Status", message: "Device maintenance required", time: "1 day ago", read: true },
    ];
    
    setNotifications(mockNotifications);
    setUnreadNotifications(mockNotifications.filter(n => !n.read).length);
  }, []);

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

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(`${!darkMode ? 'Dark' : 'Light'} mode activated`);
  };

  const handleDeviceChange = (macid) => {
    dispatch(setSelectedDevice(macid));
    toast.success(`Device ${devices.find(d => d.macid === macid)?.deviceid} selected`);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadNotifications(0);
    toast.success("All notifications marked as read");
  };

  const handleNotificationClick = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    
    const newUnreadCount = notifications.filter(n => !n.read && n.id !== id).length;
    setUnreadNotifications(newUnreadCount);
    
    // Here you could navigate to a specific page based on notification type
    toast.info("Navigating to notification details");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`);
      // Here you would implement actual search functionality
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const openQuickHelp = () => {
    toast.info("Opening help documentation");
    // Here you would implement navigation to help pages or open a help dialog
  };

  const openSettings = () => {
    toast.info("Opening system settings");
    // Here you would implement navigation to settings page
  };

  const openDashboard = () => {
    navigate("/dashboard");
    toast.success("Navigating to dashboard");
  };

  return (
    <nav className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} fixed w-full top-0 z-50 transition-colors duration-300`}>
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
                className={`${darkMode ? 'text-yellow-500' : 'text-yellow-800'}`}
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
              <span className={`text-sm font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-900'} leading-tight`}>
                Health Care
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors block lg:hidden`}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <button
            onClick={toggleCollapse}
            className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors hidden lg:inline-block`}
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
          {/* Search Bar - Hidden on small screens */}
          <div className="hidden md:block relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <Input
                  type="text"
                  placeholder="Search patients, devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-40 lg:w-60 h-9 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}
                  autoFocus
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  variant="ghost" 
                  className="ml-1"
                >
                  <FaSearch size={16} />
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-1"
                >
                  <FaTimes size={16} />
                </Button>
              </form>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSearchOpen(true)}
                      className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg`}
                    >
                      <FaSearch size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Quick Actions Menu */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openDashboard}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg hidden md:flex`}
                >
                  <FaClipboardList size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Device Selector */}
          <div className="hidden lg:flex items-center gap-2">
            {status === 'loading' ? (
              <div className="w-[180px] h-10 flex items-center justify-center relative">
                <div className={`w-full h-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
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
                <SelectTrigger className={`w-[180px] ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
                  <SelectValue 
                    placeholder={
                      status === 'failed' ? "Error loading devices" : 
                      devices.length === 0 ? "No devices" :
                      selectedDevice ? selectedDevice.deviceid : "Select a device"
                    } 
                  />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                  {devices.map((device) => (
                    <SelectItem key={device.macid} value={device.macid}>
                      {device.deviceid}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Notifications Button */}
          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`relative p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg`}
                    >
                      <FaBell size={18} />
                      {unreadNotifications > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
                        >
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent 
              className={`w-80 p-0 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
              align="end"
            >
              <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <h3 className="font-medium">Notifications</h3>
                {unreadNotifications > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllNotificationsAsRead}
                    className="text-xs"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`p-3 border-b cursor-pointer ${notification.read ? '' : `font-medium ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`} ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between">
                        <span className={`text-sm ${notification.read ? '' : darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {notification.title}
                        </span>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm mt-1">{notification.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Help Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openQuickHelp}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg hidden sm:flex`}
                >
                  <FaQuestionCircle size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Settings Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openSettings}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg hidden sm:flex`}
                >
                  <FaCog size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                  aria-label="Toggle theme"
                >
                  {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{darkMode ? 'Light mode' : 'Dark mode'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Fullscreen Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
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

          {/* Mobile dropdown menu */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              aria-label="Toggle dropdown"
            >
              <FaUserCircle className={darkMode ? 'text-blue-400' : 'text-blue-700'} size={20} />
            </button>

            {isDropdownOpen && (
              <div className={`absolute right-0 mt-2 p-2 flex flex-col items-center gap-4 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'} border rounded-lg shadow-lg`}>
                {status === 'loading' ? (
                  <div className="w-[180px] h-10 flex items-center justify-center relative">
                    <div className={`w-full h-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
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
                    <SelectTrigger className={`w-[180px] ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
                      <SelectValue 
                        placeholder={
                          status === 'failed' ? "Error" : 
                          devices.length === 0 ? "No devices" :
                          selectedDevice ? selectedDevice.deviceid : "Select device"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
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
                  className="w-full"
                  variant={darkMode ? "outline" : "default"}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <Button 
              onClick={() => setIsLogoutDialogOpen(true)}
              variant={darkMode ? "outline" : "default"}
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