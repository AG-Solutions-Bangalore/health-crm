import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { Loader2, SquarePlus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  useFetchCompanies,
  useFetchUserType,
  useFetchHospitals,
} from "@/hooks/useApi";
import { toast } from "sonner";
import { Base_Url } from "@/config/BaseUrl";
import ReactSelect from "react-select";
import { getNavbarColors } from "@/components/buttonColors/ButtonColors";
import { DoctorCreate } from "@/components/buttonIndex/ButtonComponents";

const CreateTeam = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDevices, setIsFetchingDevices] = useState(false);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const userPosition = localStorage.getItem("user_position");

  const colors = getNavbarColors(userPosition);
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("id");
  const companyID = localStorage.getItem("companyID");

  const [formData, setFormData] = useState({
    company_id: userId === "5" ? "" : companyID,
    name: "",
    email: "",
    mobile: "",
    user_type: userId === "5" ? "" : "1",
    user_position: userId === "5" ? "" : "Doctor",
    user_hospital_ids: "",
    user_device_ids: [],
  });

  const { data: companiesData } = useFetchCompanies({
    enabled: userId === "5",
  });

  const { data: userTypeData } = useFetchUserType();

  // const { data: hospitalsData } = useFetchHospitals();

  const {
    data: hospitalsData,
   
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-hospital`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onError: (error) => {
      toast.error("Failed to fetch hospital data");
      console.error("Create hospital error:", error);
    },
  });

  const fetchDevicesByHospital = async (hospitalId) => {
    if (!hospitalId) return;
    setIsFetchingDevices(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-device-user/${hospitalId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const devices = response.data.device || [];
      const options = devices.map((device) => ({
        value: device.id.toString(),
        label: `${device.deviceNameOrId}`,
      }));
      setDeviceOptions(options);
    } catch (error) {
      toast.error("Failed to fetch devices");
    } finally {
      setIsFetchingDevices(false);
    }
  };

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

  const handleSelectChange = (value, name) => {
    if (name === "user_position") {
      const selectedPosition = userTypeData?.userType?.find(
        (pos) => pos.user_position === value
      );
      setFormData((prev) => ({
        ...prev,
        user_position: value,
        user_type: selectedPosition
          ? selectedPosition.user_type.toString()
          : "",
      }));
    } else if (name === "user_hospital_ids") {
      setFormData((prev) => ({
        ...prev,
        user_hospital_ids: value,
        user_device_ids: [],
      }));
      fetchDevicesByHospital(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDeviceChange = (selectedOptions) => {
    const deviceIds = selectedOptions.map((option) => option.value);
    setFormData((prev) => ({
      ...prev,
      user_device_ids: deviceIds,
    }));
  };
  useEffect(() => {
    if (!open) {
      setFormData({
        company_id: userId === "5" ? "" : companyID,
        name: "",
        email: "",
        mobile: "",
        user_type: userId === "5" ? "" : "1",
        user_position: userId === "5" ? "" : "Doctor",
        user_hospital_ids: "",
        user_device_ids: [],
      });
    }
  }, [open]);
  
  const handleSubmit = async () => {
    console.log("formdata", formData);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !formData.company_id ||
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.user_type ||
      !formData.user_position ||
      !formData.user_hospital_ids
    ) {
      toast.error("Please fill all fields");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.mobile.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${Base_Url}/api/panel-create-team`,
        {
          ...formData,
          user_device_ids: formData.user_device_ids.join(","),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code === 200) {
        toast.success(response.data.msg);

        setFormData({
          company_id: userId === "5" ? "" : companyID,
          name: "",
          email: "",
          mobile: "",
          user_type: userId === "5" ? "" : "1",
          user_position: userId === "5" ? "" : "Doctor",
          user_hospital_ids: "",
          user_device_ids: [],
        });
        await queryClient.invalidateQueries(["teams"]);
        setOpen(false);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create Team");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {pathname === "/team" || pathname === "/userManagement" ? (
          <Button variant="default" className={`ml-2`}>
            <SquarePlus className="h-4 w-4" /> Team
          </Button>
        ) : pathname === "/doctors" ? (
          // <Button
          //   variant="default"
          //   className={`ml-2 ${colors.buttonBg} ${colors.buttonHover} text-white`}
          // >
          //   <SquarePlus className="h-4 w-4" /> Doctor
          // </Button>
          <DoctorCreate
            className={`ml-2 ${colors.buttonBg} ${colors.buttonHover} text-white`}
          />
        ) : null}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Create New {`${pathname === "/doctors" ? "Doctor" : "Team"}`}
          </SheetTitle>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          {userId === "5" && (
            <div className="grid gap-2">
              <Label htmlFor="company_id">Company</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange(value, "company_id")
                }
                value={formData.company_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companiesData?.company?.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.company_name}
                    </SelectItem>
                  )) || <p>Loading...</p>}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="user_hospital_ids">Hospital</Label>
            <Select
              onValueChange={(value) =>
                handleSelectChange(value, "user_hospital_ids")
              }
              value={formData.user_hospital_ids}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitalsData?.hospital?.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id.toString()}>
                    {hospital.hospitalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
               maxLength="50"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                maxLength="100"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter mobile number"
              pattern="^\d{10}$"
              maxLength="10"
            />
          </div>
          {userId === "5" ? (
            <div className="grid gap-2">
              <Label htmlFor="user_position">User Position</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange(value, "user_position")
                }
                value={formData.user_position}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {userTypeData?.userType?.length > 0 ? (
                    userTypeData.userType.map((position, index) => (
                      <SelectItem key={index} value={position.user_position}>
                        {position.user_position}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-2">Loading...</p>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <input type="hidden" name="user_position" value="Doctor" />
              <input type="hidden" name="user_type" value="1" />
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="user_device_ids">Devices</Label>
            {isFetchingDevices ? (
              <div className="flex items-center justify-center h-10">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <ReactSelect
                isMulti
                options={deviceOptions}
                value={deviceOptions.filter((option) =>
                  formData.user_device_ids.includes(option.value)
                )}
                onChange={handleDeviceChange}
                placeholder="Select devices"
                className="react-select-container"
                classNamePrefix="react-select"
                isDisabled={!formData.user_hospital_ids || isFetchingDevices}
              />
            )}
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
              `Create ${pathname === "/doctors" ? "Doctor" : "Team"}`
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CreateTeam;
