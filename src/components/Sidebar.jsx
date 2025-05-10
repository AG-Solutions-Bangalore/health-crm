import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookmarkCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  House,
  LayoutDashboard, 
  Cpu, 
  User, 
  ClipboardList, 
  Users, 
  UserCog,
  UserCheck, 
  Building,
} from "lucide-react";

import { Upgrade } from "./upgrade/Upgrade";

const isItemAllowed = (item, pageControl, userId) => {
  const itemUrl = item.path?.replace(/^\//, "");
  return pageControl.some(
    (control) =>
      control.page === item.name &&
      control.url === itemUrl &&
      control.userIds.includes(userId) &&
      control.status === "Active"
  );
};

const filterMenuItems = (items, pageControl, userId) => {
  if (!items) return [];

  return items.reduce((acc, item) => {
    if (item.subitems) {
      const filteredItems = filterMenuItems(item.subitems, pageControl, userId);
      if (filteredItems.length > 0) {
        acc.push({
          ...item,
          subitems: filteredItems,
        });
      }
    } else if (isItemAllowed(item, pageControl, userId)) {
      acc.push(item);
    }
    return acc;
  }, []);
};

const getSidebarColors = (userPosition) => {
  switch(userPosition) {
    case "Hospital":
      return {
        background: "bg-blue-50",
        border: "border-blue-100",
        activeBg: "bg-blue-600",
        activeText: "text-white",
        hoverBg: "hover:bg-blue-100",
        text: "text-blue-800",
        submenuActiveBg: "bg-blue-100",
        submenuActiveText: "text-blue-700",
        submenuHover: "hover:bg-blue-50",
        submenuText: "text-blue-600",
        userBg: "bg-blue-200",
        userText: "text-blue-700"
      };
    case "Doctor":
      return {
        background: "bg-green-50",
        border: "border-green-100",
        activeBg: "bg-green-600",
        activeText: "text-white",
        hoverBg: "hover:bg-green-100",
        text: "text-green-800",
        submenuActiveBg: "bg-green-100",
        submenuActiveText: "text-green-700",
        submenuHover: "hover:bg-green-50",
        submenuText: "text-green-600",
        userBg: "bg-green-200",
        userText: "text-green-700"
      };
    default:
      return {
        background: "bg-gray-50",
        border: "border-gray-200",
        activeBg: "bg-black",
        activeText: "text-white",
        hoverBg: "hover:bg-gray-100",
        text: "text-gray-700",
        submenuActiveBg: "bg-accent-50",
        submenuActiveText: "text-accent-600",
        submenuHover: "hover:bg-gray-100",
        submenuText: "text-gray-600",
        userBg: "bg-gray-200",
        userText: "text-gray-700"
      };
  }
};

const Sidebar = ({ isOpen, setIsOpen, isCollapsed }) => {
  const [openSubmenu, setOpenSubmenu] = useState("");
  const location = useLocation();
  const userId = localStorage.getItem("id");
  const userPosition = localStorage.getItem("user_position");
  const pageControl = JSON.parse(localStorage.getItem("pageControl")) || [];
  const userName = localStorage.getItem("name");
  const userEmail = localStorage.getItem("email");

  const colors = getSidebarColors(userPosition);

  const allMenuItems = [
    {
      name: "Dashboard",
      path: "/home",
      icon: LayoutDashboard,
    },
    {
      name: "Hospital",
      path: "/hospital",
      icon: Building,
    },
    {
      name: "Device",
      path: "/device-user",
      icon: Building,
    },
    {
      name: "Device-S",
      path: "/device",
      icon: Cpu,
    },
    {
      name: "Doctors",
      path: "/doctors",
      icon: User,
    },
    {
      name: "Patient",
      path: "/patient",
      icon: User,
    },
    {
      name: "Summary",
      path: "/summary",
      icon: ClipboardList,
    },
    {
      name: "Hospital Report",
      path: "/hospital-report",
      icon: Building2,
    },
    {
      name: "User Management",
      path: "/userManagement",
      icon: UserCog,
    },
    {
      name: "UserType",
      path: "/user-type",
      icon: UserCheck,
    },
  ];

  const menuItems = filterMenuItems(allMenuItems, pageControl, userId);

  useEffect(() => {
    const currentSubmenu = menuItems.find((item) =>
      item.subitems?.some((subitem) => subitem.path === location.pathname)
    );

    if (currentSubmenu) {
      setOpenSubmenu(currentSubmenu.name);
    }
  }, [location.pathname, menuItems]);

  const handleSubmenuClick = (itemName) => {
    setOpenSubmenu(openSubmenu === itemName ? "" : itemName);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] ${colors.background} ${colors.border} transition-all duration-300 ease-in-out flex flex-col
             ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
             ${isCollapsed ? "lg:w-16" : "lg:w-64"}
             w-64 z-40`}
      >
        <div className="flex-1 overflow-y-auto p-4">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.subitems ? (
                <div
                  onClick={() => handleSubmenuClick(item.name)}
                  className={`mb-1 cursor-pointer p-2 rounded-lg ${colors.hoverBg} ${colors.text}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <span className="text-sm font-medium">{item.name}</span>
                        {openSubmenu === item.name ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `
                       mb-1 flex items-center gap-3 p-2 rounded-lg transition-colors
                       ${
                         isActive
                           ? `${colors.activeBg} ${colors.activeText}`
                           : `${colors.text} ${colors.hoverBg}`
                       }
                     `}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </NavLink>
              )}

              {!isCollapsed && item.subitems && openSubmenu === item.name && (
                <div className="ml-9 mb-2">
                  {item.subitems.map((subItem) => (
                    <NavLink
                      key={subItem.name}
                      to={subItem.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) => `
                           py-2 px-3 text-sm rounded-lg block transition-colors
                           ${
                             isActive
                               ? `${colors.submenuActiveBg} ${colors.submenuActiveText}`
                               : `${colors.submenuText} ${colors.submenuHover}`
                           }
                         `}
                    >
                      {subItem.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Info and Upgrade Section */}
        <div className={`p-3 border-t ${colors.border}`}>
          {!isCollapsed && (
            <div className="mb-1">
              <div className="flex items-center gap-3 p-2">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${colors.userBg} ${colors.userText} font-medium`}>
                  {userName?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className={`text-sm font-medium truncate ${colors.text}`}>{userName}</p>
                  <p className={`text-xs ${colors.submenuText} truncate`}>{userEmail}</p>
                </div>
              </div>
            </div>
          )}
          <Upgrade isCollapsed={isCollapsed} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;