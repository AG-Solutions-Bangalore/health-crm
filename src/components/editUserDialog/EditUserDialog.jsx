import { Base_Url } from '@/config/BaseUrl';
import { useToast } from "@/hooks/use-toast";
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

const EditUserDialog = ({onSuccess,userId}) => {
     const [open, setOpen] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const [isHovered, setIsHovered] = useState(false);
      const [isFetching, setIsFetching] = useState(false);
      const { toast } = useToast();
      const queryClient = useQueryClient();
      const [formData, setFormData] = useState({
        mobile: '',
        email: '',
        status: '',
      });
    
      const fetchCustomerData = async () => {
        setIsFetching(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${Base_Url}/api/panel-fetch-user-by-id/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const userData = response.data.user;
          setFormData({
            mobile: userData.mobile,
            email: userData.email,
            status: userData.status,
    
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch country data",
            variant: "destructive",
          });
        } finally {
          setIsFetching(false);
        }
      };
    
      useEffect(() => {
        if (open) {
          fetchCustomerData();
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
          status: value, 
        }));
      };
    
      const handleSubmit = async () => {
        if (
          !formData.email ||
          !formData.mobile ||
          !formData.status 
        ) {
          toast({
            title: "Error",
            description: "Please fill all fields",
            variant: "destructive",
          });
          return;
        }
    
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.put(
            `${Base_Url}/api/panel-update-user/${userId}`,
            formData,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
    
         
        if (response?.data.code == 200) {
        
          toast({
            title: "Success",
            description: response.data.msg
          });
    
         
          if (onSuccess) onSuccess();
          setOpen(false);
        } else {
         
          toast({
            title: "Error",
            description: response.data.msg,
            variant: "destructive",
          });
        }
        } catch (error) {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to update Bank",
            variant: "destructive",
          });
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
            <p>Edit User</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>
          Update user information below
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="mobile" className="text-right">
            Mobile
          </label>
          <Input
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className="col-span-3"
            maxLength={10}
            onKeyPress={(e) => {
              if (!/[0-9.]/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="email" className="text-right">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="status" className="text-right">
            Status
          </label>
          <Select
            value={formData.status}
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
              "Update User"
            )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
}

export default EditUserDialog