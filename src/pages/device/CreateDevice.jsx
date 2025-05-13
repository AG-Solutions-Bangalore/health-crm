import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { Loader2, SquarePlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Base_Url } from "@/config/BaseUrl";
import { DeviceCreate } from "@/components/buttonIndex/ButtonComponents";
import { Textarea } from "@/components/ui/textarea";

const CreateDevice = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    deviceNameOrId: "",
    deviceMacAddress: "",
    deviceRemark: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.deviceNameOrId || !formData.deviceMacAddress) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${Base_Url}/api/panel-create-device`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code === 200) {
        toast.success(response.data.msg);

        setFormData({
          deviceNameOrId: "",
          deviceMacAddress: "",
          deviceRemark: "",
        });
        await queryClient.invalidateQueries(["device"]);
        setOpen(false);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to device Team");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
     

        {pathname === "/device" ? (
        //   <Button variant="default" className={`ml-2 `}>
        //     <SquarePlus className="h-4 w-4" /> Device
        //   </Button>
        <DeviceCreate
        className={`ml-2 `}
      />
        ) :
        
        
        pathname === "/create-contract" ? (
          <p className="text-xs text-yellow-700 ml-2 mt-1 w-32 hover:text-red-800 cursor-pointer">
            Create Device
          </p>
        ) : null}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Device</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="deviceNameOrId">Device</Label>
            <Input
              id="deviceNameOrId"
              name="deviceNameOrId"
              value={formData.deviceNameOrId}
              onChange={handleInputChange}
              placeholder="Enter device name"
              maxLength="50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deviceMacAddress">Mac Address</Label>
            <Input
              id="deviceMacAddress"
              name="deviceMacAddress"
              value={formData.deviceMacAddress}
              onChange={handleInputChange}
              placeholder="Enter mac address name"
                maxLength="50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deviceRemark">Remark</Label>
            <Textarea
              id="deviceRemark"
              name="deviceRemark"
              value={formData.deviceRemark}
              onChange={handleInputChange}
              placeholder="Enter remark"
                maxLength="250"
              
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className={``}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Device"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDevice;
