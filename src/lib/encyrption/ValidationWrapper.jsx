import { Base_Url } from "@/config/BaseUrl";
import axios from "axios";
import CryptoJS from "crypto-js";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const secretKey = import.meta.env.VITE_SECRET_KEY;
const validationKey = import.meta.env.VITE_SECRET_VALIDATION;

const ValidationWrapper = ({ children }) => {
  const [status, setStatus] = useState("pending");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();
  const location = useLocation();

 
  const handleLogout = async () => {
    try {
      if (token) {
        const res = await axios.post(
          `${Base_Url}/api/panel-logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data?.code === 200) {
          toast.success(res.data.msg || "You have been logged out.");

          localStorage.clear();

          navigate("/");
        }
      } else {
        toast.error(res.data.msg || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error(error.response?.data?.message ||
        "Something went wrong. Please try again later.");
    }
  };




  useEffect(() => {
    const validateEnvironment = async () => {
      try {
        const statusRes = await axios.get(`${Base_Url}/api/panel-check-status`);
      
        if (statusRes.data?.msg !== "success") {
          throw new Error("Panel status check failed");
        }

        const dotenvRes = await axios.get(`${Base_Url}/api/panel-fetch-dotenv`);
        const dynamicValidationKey = dotenvRes.data?.hashKey;

        if (!dynamicValidationKey) {
          throw new Error("Validation key missing from response");
        }

        const computedHash = validationKey
          ? CryptoJS.MD5(validationKey).toString()
          : "";

        if (!secretKey || computedHash !== dynamicValidationKey) {
          throw new Error("Unauthorized environment file detected");
        }

        setStatus("valid");
        if (location.pathname === "/maintenance") {
          navigate("/");
        }
      } catch (error) {
        console.error("❌ Validation Error:", error.message);
        if (status != "valid") {
          handleLogout();
        }
        toast.error("Environment validation failed. Redirecting...");

        setStatus("invalid");

        if (location.pathname !== "/maintenance") {
          navigate("/maintenance");
        }
      }
    };

    validateEnvironment();
  }, [navigate, location]);

  return children;
};

export default ValidationWrapper;
