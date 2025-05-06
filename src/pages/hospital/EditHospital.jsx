import { Base_Url } from "@/config/BaseUrl";
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
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const EditHospital = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    hospitalName: "",
    hospitalArea: "",
    hospitalAdd: "",
    hospitalStatus: "",
  });

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
      !formData.hospitalAdd ||
      !formData.hospitalStatus
    ) {
      toast.error("Please fill all fields");
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
            <p>Edit Hospital</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Hospital</DialogTitle>
          <DialogDescription>
            Update hospital information below
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label htmlFor="hospitalName">Hospital</Label>
            <Input
              id="hospitalName"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleInputChange}
              placeholder="Enter hospital name"
            />
          </div>
         <div className="grid grid-cols-1 md:grid-cols-2  gap-2">
         <div className="grid gap-2">
            <Label htmlFor="hospitalArea">Area</Label>
            <Input
              id="hospitalArea"
              name="hospitalArea"
              value={formData.hospitalArea}
              onChange={handleInputChange}
              placeholder="Enter hospital area"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hospitalStatus">Status</Label>
            <Select
              value={formData.hospitalStatus}
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
          <div className="grid gap-2">
            <Label htmlFor="hospitalAdd">Address</Label>
            <Textarea
              id="hospitalAdd"
              name="hospitalAdd"
              value={formData.hospitalAdd}
              onChange={handleInputChange}
              placeholder="Enter hospital address"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditHospital;
