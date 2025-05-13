import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { toast } from "sonner";
import ReactSelect from "react-select";
import { Base_Url } from "@/config/BaseUrl";
import { useLocation } from "react-router-dom";

const EditTeam = ({ teamId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const { pathname } = useLocation();

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    mobile: "",
    email: "",
    name: "",
    status: "Active",
    user_device_ids: [],
  });

  const fetchTeamData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-team-by-id/${teamId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const teamData = response.data.team;
      const devices = response.data.device || [];

      // Prepare device options
      const options = devices.map((device) => ({
        value: device.id.toString(),
        label: `${device.deviceNameOrId} (${device.deviceMacAddress})`,
      }));
      setDeviceOptions(options);

      // Convert comma-separated device IDs to array
      const deviceIds = teamData.user_device_ids
        ? teamData.user_device_ids.split(",")
        : [];

      setFormData({
        mobile: teamData.mobile,
        email: teamData.email,
        status: teamData.status,
        name: teamData.name,
        user_device_ids: deviceIds,
      });
    } catch (error) {
      toast.error("Failed to fetch team data");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTeamData();
    }
  }, [open]);

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    let formattedValue = value;

    if (type === "tel") {
      formattedValue = value.replace(/\D/g, "");
    }

    if (type === "email") {
      formattedValue = value.toLowerCase().trim();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleDeviceChange = (selectedOptions) => {
    const deviceIds = selectedOptions.map((option) => option.value);
    setFormData((prev) => ({
      ...prev,
      user_device_ids: deviceIds,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.mobile || !formData.email || !formData.status) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        user_device_ids: formData.user_device_ids.join(","), // Convert array to comma-separated string
      };

      const response = await axios.put(
        `${Base_Url}/api/panel-update-team/${teamId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 200) {
        toast.success(response.data.msg);

        await queryClient.invalidateQueries(["teams"]);
        setOpen(false);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update Team");
    } finally {
      setIsLoading(false);
    }
  };

  // Get currently selected devices for the select component
  const selectedDevices = formData.user_device_ids
    .map((id) => {
      const device = deviceOptions.find((d) => d.value === id);
      return device
        ? {
            value: device.value,
            label: device.label.split(" (")[0], // Remove the MAC address part
          }
        : null;
    })
    .filter(Boolean);

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
            <p>Edit {`${pathname === "/doctors" ? "Doctor" : "Team"}`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit {`${pathname === "/doctors" ? "Doctor" : "Team"}`} -{" "}
            <span className="text-2xl">{formData.name}</span>
          </DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter mobile"
                pattern="^\d{10}$"
                maxLength="10"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email "
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                    maxLength="100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user_device_ids">Devices</Label>
              <ReactSelect
                isMulti
                options={deviceOptions}
                value={selectedDevices}
                onChange={handleDeviceChange}
                placeholder="Select devices"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
            className={``}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              `Update ${pathname === "/doctors" ? "Doctor" : "Team"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeam;
