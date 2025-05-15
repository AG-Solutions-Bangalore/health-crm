import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Base_Url } from "@/config/BaseUrl";
import { ContextPanel } from "@/lib/ContextPanel";
import { useDispatch } from "react-redux";
import { fetchDevices } from "@/redux/slices/DeviceSlice";
import { Eye, EyeOff } from "lucide-react";

export default function LoginAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { fetchPagePermission, fetchPermissions } = useContext(ContextPanel);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loadingMessages = [
    "Authenticating...",
    "Loading dashboard...",
    "Finalizing...",
  ];

  useEffect(() => {
    let intervalId;
    if (isLoading) {
      let index = 0;
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 800);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const { data } = await axios.post(
        `${Base_Url}/api/panel-login`,
        formData
      );

      if (!data?.UserInfo?.token) {
        throw new Error("No token received");
      }

      const { UserInfo, userN, company_detils, version } = data;

      // Store user data
      localStorage.setItem("token", UserInfo.token);
      localStorage.setItem("allUsers", JSON.stringify(userN));
      localStorage.setItem("id", UserInfo.user.id);
      localStorage.setItem("name", UserInfo.user.name);
      localStorage.setItem("mobile", UserInfo.user.mobile);
      localStorage.setItem("userType", UserInfo.user.user_type);
      localStorage.setItem("email", UserInfo.user.email);
      localStorage.setItem("user_position", UserInfo.user.user_position);
      localStorage.setItem("companyID", UserInfo.user.company_id);
      localStorage.setItem("token-expire-time", UserInfo.token_expires_at);
      localStorage.setItem("companyName", company_detils?.company_name);
      localStorage.setItem("companyEmail", company_detils?.company_email);
      localStorage.setItem("verCon", version?.version_panel);

      if (UserInfo.token) {
        await fetchPermissions();
        await fetchPagePermission();
        await dispatch(fetchDevices()).unwrap();
        navigate("/patient");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Authentication failed");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-[100svh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full max-w-sm"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl font-medium text-gray-800">
              Qurit-HealthCare
            </CardTitle>
            <p className="text-sm text-gray-500">
              Health Care Management System
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Mobile Number
                </Label>
                <Input
                  id="email"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d*"
                  minLength={10}
                  maxLength={10}
                  value={email}
                  placeholder="Enter your 10-digit mobile number"
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    setEmail(numericValue);
                  }}
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-10"
                    maxLength={16}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gray-900 hover:bg-gray-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="opacity-25"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {loadingMessage}
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
