import { Base_Url } from '@/config/BaseUrl';
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { Edit, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const EditDevice = ({userId}) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        device_status: '',
        deviceRemark: '',
    });
  
    const fetchDeviceData = async () => {
      setIsFetching(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${Base_Url}/api/panel-fetch-device-by-id/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const deviceData = response.data.device;
        setFormData({
            device_status: deviceData.device_status,
            deviceRemark: deviceData.deviceRemark,
  
        });
      } catch (error) {
        toast.error("Failed to fetch device data");
      } finally {
        setIsFetching(false);
      }
    };
  
    useEffect(() => {
      if (open) {
        fetchDeviceData();
      }
    }, [open]);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleStatusChange = (value) => {
      setFormData((prev) => ({
        ...prev,
        device_status: value, 
      }));
    };
  
    const handleSubmit = async () => {
      if (
        !formData.device_status 
      ) {
        toast.error("Please fill all fields");
        return;
      }
  
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `${Base_Url}/api/panel-update-device/${userId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
       
      if (response?.data.code == 200) {
      
        toast.success(response.data.msg);
  
       
        await queryClient.invalidateQueries(["device"]);
      } else {
       
        toast.error(response.data.msg);
      }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update device");
      } finally {
        setIsLoading(false);
      }
    };
  return (
       <Dialog open={open} onOpenChange={setOpen}>
           <TooltipProvider>
           <Tooltip>
             <TooltipTrigger asChild>
               <DialogTrigger asChild>
                 <Button
                   variant="ghost"
                   size="icon"
                   className={`transition-all duration-200 ${
                     isHovered ? "bg-blue-50" : ""
                   }`}
                   onMouseEnter={() => setIsHovered(true)}
                   onMouseLeave={() => setIsHovered(false)}
                 >
                   <Edit
                     className={`h-4 w-4 transition-all duration-200 ${
                       isHovered ? "text-blue-500" : ""
                     }`}
                   />
                 </Button>
               
               </DialogTrigger>
             </TooltipTrigger>
             <TooltipContent>
               <p>Edit Device</p>
             </TooltipContent>
           </Tooltip>
         </TooltipProvider>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle>Edit Device</DialogTitle>
           <DialogDescription>
             Update device information below
           </DialogDescription>
         </DialogHeader>
       <div className="grid gap-4 py-4">
               
                <div className="grid gap-2">
                  <Label htmlFor="device_status">Status</Label>
                  <Select
    value={formData.device_status}
    onValueChange={handleStatusChange}
  >
    <SelectTrigger className="col-span-3">
      <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Active">Active</SelectItem>
      <SelectItem value="Inactive">Inactive</SelectItem>
    </SelectContent>
  </Select>
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
      
           <Button type="submit"   onClick={handleSubmit}
               disabled={isLoading || isFetching}>
             {isLoading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Updating...
                 </>
               ) : (
                 "Update Device"
               )}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
  )
}

export default EditDevice