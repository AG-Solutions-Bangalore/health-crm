import { useToast } from "@/hooks/use-toast";
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

import { useLocation } from "react-router-dom";
import { Base_Url } from "@/config/BaseUrl";

const CreateUserDialog = ({onSuccess}) => {
     const [open, setOpen] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const { toast } = useToast();
      const { pathname } = useLocation();
 
      const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
       
      });
    
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
    
      const handleSubmit = async () => {
        if (
          !formData.name ||
          !formData.mobile ||
          !formData.email 

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
          const response = await axios.post(
            `${Base_Url}/api/panel-create-user`,
            formData,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
    
          if (response?.data.code == 200) {
            toast({
              title: "Success",
              description: response.data.msg,
            });
    
            setFormData({
                name: "",
                mobile: "",
                email: "",
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
            description: error.response?.data?.message || "Failed to Create User",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
  return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            
    
            {pathname.startsWith("/company/view")
 || pathname === "/user" ? (
              <Button
                variant="default"
                className={`ml-2 `}
              >
                <SquarePlus className="h-4 w-4" /> User
              </Button>
             
            ) : pathname === "/create-contract" || pathname === "/create-invoice" ? (
                <p className="text-xs text-blue-600  hover:text-red-800 cursor-pointer">
                                   <span className="flex items-center flex-row gap-1">
                                     <SquarePlus className="w-4 h-4" /> <span>Add</span>
                                   </span>
                                 </p>
            ) : null}
          </DialogTrigger>
    
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
    
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                />
              </div>
    
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter Mobile"
                  onKeyPress={(e) => {
                    if (!/[0-9.]/.test(e.key) && e.key !== "Backspace") {
                      e.preventDefault();
                    }
                  }}
                  maxLength={10}
                />
              </div>
    
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  type="email"
                
                />
              </div>
             
            </div>
    
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                // className="bg-yellow-500 text-black hover:bg-yellow-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  )
}

export default CreateUserDialog