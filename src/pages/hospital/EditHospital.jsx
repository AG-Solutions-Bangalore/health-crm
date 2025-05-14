import { Base_Url } from "@/config/BaseUrl";
import React, { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const EditHospital = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({
    hospitalMobile: "",
    hospitalEmail: ""
  });

  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    hospitalName: "",
    hospitalArea: "",
    hospitalAdd: "",
    hospitalStatus: "",
    hospitalMobile: "",
    hospitalEmail: ""
  });

  const validateMobile = (mobile) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(mobile);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const fetchHospitalData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-hospital-by-id/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const hospitalData = response.data.hospital;
      setFormData({
        hospitalName: hospitalData.hospitalName,
        hospitalArea: hospitalData.hospitalArea,
        hospitalAdd: hospitalData.hospitalAdd,
        hospitalStatus: hospitalData.hospitalStatus,
        hospitalMobile: hospitalData.hospitalMobile || "",
        hospitalEmail: hospitalData.hospitalEmail || ""
      });
    } catch (error) {
      toast.error("Failed to fetch hospital data");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchHospitalData();
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate mobile number
    if (name === "hospitalMobile") {
      const digitsOnly = value.replace(/\D/g, ""); 
      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
    
      if (digitsOnly && digitsOnly.length !== 10) {
        setErrors((prev) => ({
          ...prev,
          hospitalMobile: "Mobile number must be 10 digits",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          hospitalMobile: "",
        }));
      }
      return;
    }

    // Validate email
    if (name === "hospitalEmail") {
      if (value && !validateEmail(value)) {
        setErrors(prev => ({...prev, hospitalEmail: "Please enter a valid email"}));
      } else {
        setErrors(prev => ({...prev, hospitalEmail: ""}));
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      hospitalStatus: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.hospitalName ||
      !formData.hospitalArea ||
      !formData.hospitalStatus ||
      !formData.hospitalMobile ||
      !formData.hospitalEmail
    ) {
      toast.error("Please fill all fields");
      return;
    }

    // Validate mobile
    if (!validateMobile(formData.hospitalMobile)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    // Validate email
    if (!validateEmail(formData.hospitalEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${Base_Url}/api/panel-update-hospital/${userId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 200) {
        toast.success(response.data.msg);
        setOpen(false);
        await queryClient.invalidateQueries(["hospital"]);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update hospital");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
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
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Hospital</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Hospital</SheetTitle>
          <SheetDescription>
            Update hospital information below
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="hospitalName">Hospital Name</Label>
            <Input
              id="hospitalName"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleInputChange}
              placeholder="Enter hospital name"
                maxLength="50"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="hospitalArea">Area</Label>
              <Input
                id="hospitalArea"
                name="hospitalArea"
                value={formData.hospitalArea}
                onChange={handleInputChange}
                placeholder="Enter hospital area"
                  maxLength="50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hospitalStatus">Status</Label>
              <Select
                value={formData.hospitalStatus}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="hospitalMobile">Mobile Number</Label>
              <Input
                type="tel"
                id="hospitalMobile"
                name="hospitalMobile"
                value={formData.hospitalMobile}
                onChange={handleInputChange}
                placeholder="Enter 10-digit mobile number"
             
                maxLength={10}
               inputMode="numeric"
              pattern="\d*"
              />
              {errors.hospitalMobile && (
                <p className="text-sm text-red-500">{errors.hospitalMobile}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hospitalEmail">Email</Label>
              <Input
                type="email"
                id="hospitalEmail"
                name="hospitalEmail"
                value={formData.hospitalEmail}
                onChange={handleInputChange}
                placeholder="Enter hospital email"
                maxLength="100"
              />
              {errors.hospitalEmail && (
                <p className="text-sm text-red-500">{errors.hospitalEmail}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hospitalAdd">Address</Label>
            <Textarea
              id="hospitalAdd"
              name="hospitalAdd"
              value={formData.hospitalAdd}
              onChange={handleInputChange}
              placeholder="Enter hospital address"
              maxLength="250"
            />
          </div>
        </div>
        <SheetFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
            className="mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Hospital"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditHospital;