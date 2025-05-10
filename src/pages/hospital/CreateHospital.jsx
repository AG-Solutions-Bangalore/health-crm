import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { Loader2, SquarePlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Base_Url } from "@/config/Baseurl";
import { Textarea } from "@/components/ui/textarea";
import { HospitalCreate } from "@/components/buttonIndex/ButtonComponents";
import { getNavbarColors } from "@/components/buttonColors/ButtonColors";

const CreateHospital = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userPosition = localStorage.getItem("user_position");
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const colors = getNavbarColors(userPosition);
  
  const [formData, setFormData] = useState({
    hospitalName: "",
    hospitalArea: "",
    hospitalAdd: "",
    hospitalCreationDate: "",
    hospitalMobile: "",
    hospitalEmail: ""
  });

  const [errors, setErrors] = useState({
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate mobile number
    if (name === "hospitalMobile") {
      if (value && !validateMobile(value)) {
        setErrors(prev => ({...prev, hospitalMobile: "Mobile number must be 10 digits"}));
      } else {
        setErrors(prev => ({...prev, hospitalMobile: ""}));
      }
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

  const handleSubmit = async () => {
    // Check all required fields
    if (!formData.hospitalName || 
        !formData.hospitalArea || 
        !formData.hospitalCreationDate ||
        !formData.hospitalMobile ||
        !formData.hospitalEmail) {
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

      const response = await axios.post(
        `${Base_Url}/api/panel-create-hospital`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code === 200) {
        toast.success(response.data.msg);

        setFormData({
          hospitalName: "",
          hospitalArea: "",
          hospitalAdd: "",
          hospitalCreationDate: "",
          hospitalMobile: "",
          hospitalEmail: ""
        });
        await queryClient.invalidateQueries(["hospital"]);
        setOpen(false);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create hospital");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {pathname === "/hospital" ? (
          <HospitalCreate
            className={`${colors.buttonBg} ${colors.buttonHover} text-white ml-2`}
          />
        ) : pathname === "/create-contract" ? (
          <p className="text-xs text-yellow-700 ml-2 mt-1 w-32 hover:text-red-800 cursor-pointer">
            Create Hospital
          </p>
        ) : null}
      </SheetTrigger>
      
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Hospital</SheetTitle>
        </SheetHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="hospitalName">Hospital Name*</Label>
            <Input
              id="hospitalName"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleInputChange}
              placeholder="Enter hospital name"
              required
            />
          </div>
            <div className="grid gap-2">
            <Label htmlFor="hospitalMobile">Mobile Number*</Label>
            <Input
              type="tel"
              id="hospitalMobile"
              name="hospitalMobile"
              value={formData.hospitalMobile}
              onChange={handleInputChange}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              required
            />
            {errors.hospitalMobile && (
              <p className="text-sm text-red-500">{errors.hospitalMobile}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="hospitalEmail">Email*</Label>
            <Input
              type="email"
              id="hospitalEmail"
              name="hospitalEmail"
              value={formData.hospitalEmail}
              onChange={handleInputChange}
              placeholder="Enter hospital email"
              required
            />
            {errors.hospitalEmail && (
              <p className="text-sm text-red-500">{errors.hospitalEmail}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="hospitalArea">Area*</Label>
            <Input
              id="hospitalArea"
              name="hospitalArea"
              value={formData.hospitalArea}
              onChange={handleInputChange}
              placeholder="Enter hospital area"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="hospitalAdd">Address</Label>
            <Textarea
              id="hospitalAdd"
              name="hospitalAdd"
              value={formData.hospitalAdd}
              onChange={handleInputChange}
              placeholder="Enter hospital address"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="hospitalCreationDate">Date*</Label>
            <Input
              type="date"
              id="hospitalCreationDate"
              name="hospitalCreationDate"
              value={formData.hospitalCreationDate}
              onChange={handleInputChange}
              required
            />
          </div>
          
        
        </div>
        
        <SheetFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="mt-4">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Hospital"
            )}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="mt-4">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CreateHospital;