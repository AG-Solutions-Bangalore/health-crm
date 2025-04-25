import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import axios from "axios";
import { Base_Url } from "@/config/BaseUrl";
import { toast } from "sonner";


const StatusToggle = ({ initialStatus, deviceId, onStatusChange }) => {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);


  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = status === "Active" ? "Inactive" : "Active";

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${Base_Url}/api/panel-update-device/${deviceId}`,
        { device_status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      toast.success(`Team status changed to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded 
        ${
          status === "Active"
            ? "text-green-800 hover:bg-green-100"
            : "text-gray-800 hover:bg-gray-100"
        } transition-colors`}
    >
      <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      <span>{status}</span>
    </button>
  );
};

export default StatusToggle;