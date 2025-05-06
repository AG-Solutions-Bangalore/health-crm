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
import { Textarea } from "@/components/ui/textarea";
import { HospitalCreate } from "@/components/buttonIndex/ButtonComponents";

const CreateHospital = () => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  
    const { pathname } = useLocation();
    const queryClient = useQueryClient();
  
    const [formData, setFormData] = useState({
        hospitalName: "",
        hospitalArea: "",
        hospitalAdd: "",
        hospitalCreationDate:"",
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
      if (!formData.hospitalName || !formData.hospitalArea || !formData.hospitalAdd || !formData.hospitalCreationDate) {
        toast.error("Please fill all fields");
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
            hospitalCreationDate:"",
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
    <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
        
   
           {pathname === "/hospital" ? (
            //  <Button variant="default" className={`ml-2 `}>
            //    <SquarePlus className="h-4 w-4" /> Hospital
            //  </Button>
           <HospitalCreate
           className={`ml-2 `}
         />
           ) :
           
           
           pathname === "/create-contract" ? (
             <p className="text-xs text-yellow-700 ml-2 mt-1 w-32 hover:text-red-800 cursor-pointer">
               Create Hospital
             </p>
           ) : null}
         </DialogTrigger>
   
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle>Create New Hospital</DialogTitle>
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
               <Label htmlFor="hospitalAdd">Address</Label>
               <Textarea
                 id="hospitalAdd"
                 name="hospitalAdd"
                 value={formData.hospitalAdd}
                 onChange={handleInputChange}
                 placeholder="Enter hospital address"
                 
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="hospitalCreationDate">Date</Label>
               <Input
               type="date"
                 id="hospitalCreationDate"
                 name="hospitalCreationDate"
                 value={formData.hospitalCreationDate}
                 onChange={handleInputChange}
                 placeholder="Enter hospital area"
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
                 "Create Hospital"
               )}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
  )
}

export default CreateHospital