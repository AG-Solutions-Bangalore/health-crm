import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Base_Url } from "@/config/BaseUrl";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  const loadingMessages = [
    "Processing request...",
    "Sending password...",
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("username", username);

    try {
      const res = await axios.post(
        `${Base_Url}/api/panel-send-password`,
        formData
      );

      if (res.status === 200) {
        const response = res.data;

        if (response.code === 200) {
          toast.success(response.msg);
        } else if (response.code === 400) {
          toast.error(response.msg);
        } else {
          toast.error(response.msg);
        }
      } else {
        toast.error("Unexpected response from the server.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Please try again later.");
    } finally {
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
              Forgot Password
            </CardTitle>
            <p className="text-sm text-gray-500">
              Enter your username and email to reset password
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                Mobile Number
                </Label>
                <Input
    id="username"
    type="tel"
    inputMode="numeric"
    pattern="\d*"
    minLength={10}
    maxLength={10}
    placeholder="Enter your 10-digit mobile number"
    value={username}
    onChange={(e) => {
      const onlyNumbers = e.target.value.replace(/\D/g, '');
      setUserName(onlyNumbers);
    }}
    className="h-10"
    required
  />

              </div>
              
              <Button
                type="submit"
                className="w-full h-10 bg-gray-900 hover:bg-gray-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    {loadingMessage}
                  </span>
                ) : "Reset Password"}
              </Button>
              
              <div className="text-right">
                <button 
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}