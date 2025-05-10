import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const getLayoutColors = (userPosition) => {
  switch(userPosition) {
    case "Hospital":
      return {
        background: "bg-blue-50/20",
        overlay: "bg-black bg-opacity-50"
      };
    case "Doctor":
      return {
        background: "bg-green-50/20",
        overlay: "bg-black bg-opacity-50"
      };
    default:
      return {
        background: "bg-white",
        overlay: "bg-black bg-opacity-50"
      };
  }
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userPosition = localStorage.getItem("user_position");
  const colors = getLayoutColors(userPosition);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Navbar
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        toggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
      />
      <main
        className={`transition-all duration-300 pt-16 ${
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {isSidebarOpen && (
          <div
            className={`fixed inset-0 ${colors.overlay} lg:hidden z-20`}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="p-6 relative">{children}</div>
      </main>
    </div>
  );
};

export default Layout;