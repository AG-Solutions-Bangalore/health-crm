import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CryptoJS from "crypto-js";

const CLIENT_ID = "e5dcaeec70fb4eed89cb987abfd84422";
const CLIENT_SECRET = "d53197c4061b4441a716f6fa5ee5a89d";

const SignIn = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const genToken = (clientId, seed, secret) => {
    try {
      const parsedSeed = CryptoJS.enc.Base64.parse(seed);

      let keyBytes;
      const secretUtf8 = CryptoJS.enc.Utf8.parse(secret);
      if (secretUtf8.sigBytes > 16) {
        keyBytes = CryptoJS.enc.Utf8.parse(secret.substring(0, 16));
      } else {
        keyBytes = CryptoJS.enc.Utf8.parse(secret.padEnd(16, "\0"));
      }

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: parsedSeed },
        keyBytes,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }
      );

      const decryptedBytes = decrypted.toString(CryptoJS.enc.Hex);
      const md5Hash = CryptoJS.MD5(decrypted).toString(CryptoJS.enc.Base64);

      return `${clientId}.${seed}.${md5Hash}`.replace(/\n/g, "");
    } catch (error) {
      console.error("Error generating token:", error);
      return "";
    }
  };

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/hc09/api/auth/new`, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        params: { client_id: CLIENT_ID },
      });

      if (response.data?.seed) {
        const token = genToken(CLIENT_ID, response.data.seed, CLIENT_SECRET);
        localStorage.setItem("token", token);
        localStorage.setItem("company", "Ag-Solution");
        navigate("/patient");
      } else {
        toast.error("Failed to generate authentication token");
      }
    } catch (error) {
      console.error("Error fetching auth token:", error);
      toast.error("Failed to generate authentication token");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="relative flex flex-col justify-center items-center min-h-[100svh] bg-gradient-to-br from-gray-50 to-gray-200 px-4"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="w-full max-w-md flex flex-col items-center gap-8"
        initial={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          y: -50,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        <div className="text-center space-y-2">
          <motion.h1 
            className="text-3xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Welcome to Ag-Solution
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Health Care Mannagement System
          </motion.p>
        </div>

        <motion.div
          className="w-56"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleGetStarted}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              "Get Started"
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SignIn;