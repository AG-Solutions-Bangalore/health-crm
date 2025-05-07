import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Base_Url } from "@/config/BaseUrl";
import { Loader2 } from "lucide-react";

const CreateAssignHospital = ({ hospitalId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

 
  const [deviceAssignments, setDeviceAssignments] = useState([
    { deviceNameOrId: "", deviceMacAddress: "", hospitalDeviceCreatedDate: "" },
  ]);


  const { data: pendingDevices } = useQuery({
    queryKey: ["pendingDevices"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-pending-device`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response?.data?.device || [];
    },
    enabled: open, 
  });

 
  const addDeviceRow = () => {
    setDeviceAssignments([
      ...deviceAssignments,
      { deviceNameOrId: "", deviceMacAddress: "", hospitalDeviceCreatedDate: "" },
    ]);
  };

 
  const removeDeviceRow = (index) => {
    if (deviceAssignments.length === 1) return;
    const newAssignments = [...deviceAssignments];
    newAssignments.splice(index, 1);
    setDeviceAssignments(newAssignments);
  };

 
  const handleDeviceChange = (index, value) => {
    const newAssignments = [...deviceAssignments];
    newAssignments[index].deviceNameOrId = value;
    
    
    const selectedDevice = pendingDevices.find(device => device.deviceNameOrId === value);
    if (selectedDevice) {
      newAssignments[index].deviceMacAddress = selectedDevice.deviceMacAddress;
    }
    
    setDeviceAssignments(newAssignments);
  };

  
  const handleDateChange = (index, value) => {
    const newAssignments = [...deviceAssignments];
    newAssignments[index].hospitalDeviceCreatedDate = value;
    setDeviceAssignments(newAssignments);
  };


  const handleSubmit = async () => {
   
    const isValid = deviceAssignments.every(
      (assignment) =>
        assignment.deviceNameOrId &&
        assignment.deviceMacAddress &&
        assignment.hospitalDeviceCreatedDate
    );

    if (!isValid) {
      toast.error("Please fill all fields in all rows");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${Base_Url}/api/panel-create-hospital-device`,
        {
          hospitalid: hospitalId,
          hospital_data: deviceAssignments,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.code === 200) {
        toast.success(response.data.msg);
        queryClient.invalidateQueries(["hospitalDevice"]);
        setOpen(false);
   
        setDeviceAssignments([
          { deviceNameOrId: "", deviceMacAddress: "", hospitalDeviceCreatedDate: "" },
        ]);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign devices");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="ml-2">
          <PlusCircle className="h-4 w-4 " /> Assign Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Devices to Hospital</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="font-semibold">Device Assignments *</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Name</TableHead>
                  <TableHead>MAC Address</TableHead>
                  <TableHead>Assign Date</TableHead>
                  <TableHead className="w-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deviceAssignments.map((assignment, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={assignment.deviceNameOrId}
                        onValueChange={(value) => handleDeviceChange(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                        <SelectContent>
                          {pendingDevices?.map((device) => (
                            <SelectItem
                              key={device.deviceNameOrId}
                              value={device.deviceNameOrId}
                            >
                              {device.deviceNameOrId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={assignment.deviceMacAddress}
                        readOnly
                        placeholder="Auto-filled from device selection"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={assignment.hospitalDeviceCreatedDate}
                        onChange={(e) =>
                          handleDateChange(index, e.target.value)
                        }
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDeviceRow(index)}
                        disabled={deviceAssignments.length === 1}
                        type="button"
                      >
                        <MinusCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-2">
              <Button
                type="button"
                onClick={addDeviceRow}
                variant="outline"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning Devices...
              </>
            ) : (
              "Assign Devices"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignHospital;