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
  UserCheck ,
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

const Sidebar = ({ isOpen, setIsOpen, isCollapsed }) => {
  const [openSubmenu, setOpenSubmenu] = useState("");
  const location = useLocation();
  const userId = localStorage.getItem("id");
  const pageControl = JSON.parse(localStorage.getItem("pageControl")) || [];
  const userName = localStorage.getItem("name");
  const userEmail = localStorage.getItem("email");

  const allMenuItems = [
    {
      name: "Dashboard",
      path: "/home",
      icon: LayoutDashboard,
    },
    {
      name: "Hospital",
      path: "/hospital",
      icon: Cpu,
    },
    {
      name: "Device",
      path: "/device",
      icon: Cpu,
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
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col
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
                  className="mb-1 cursor-pointer p-2 rounded-lg hover:bg-gray-100 text-gray-700"
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
                           ? "bg-black text-white"
                           : "text-gray-700 hover:bg-gray-100"
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
                               ? "bg-accent-50 text-accent-600"
                               : "text-gray-600 hover:bg-gray-100"
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
        <div className="p-3 border-t border-gray-200">
          {!isCollapsed && (
            <div className="mb-1">
              <div className="flex items-center gap-3 p-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-700 font-medium">
                  {userName?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
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

//sajids
