import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Base_Url } from "@/config/BaseUrl";

const Logout = ({ open, handleOpen }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token")

  const handleLogout = async () => {
    try {
      const res = await axios.post(`${Base_Url}/api/panel-logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.data.code === 200) {
        toast.success(res.data.msg);
        localStorage.clear();
        navigate("/");
      } else {
        toast.error(res.data.msg);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      handleOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Confirm Logout</DialogTitle>
          <DialogDescription className="text-center">
          You're about to log out. Would
          you like to continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            variant="outline"
            onClick={() => handleOpen(false)}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 font-bold"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Logout;