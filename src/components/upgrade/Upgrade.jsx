import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useContext } from "react";
import { ContextPanel } from "@/lib/ContextPanel";
import { Base_Url } from "@/config/BaseUrl";

export const Upgrade = ({ isCollapsed }) => {
      const { isPanelUp } = useContext(ContextPanel);
  const [showUpdateBadge, setShowUpdateBadge] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const navigate = useNavigate();
  

  useEffect(() => {
    const verCon = localStorage.getItem("verCon");
 
    
    if (verCon && isPanelUp?.version?.version_panel && verCon !== isPanelUp?.version?.version_panel) {
      setShowUpdateBadge(true);
      setShowDot(true);
      const dotTimer = setTimeout(() => {
        setShowDot(false);
        setOpenDialog(true);
      }, 5000);
      return () => clearTimeout(dotTimer);
    }
  }, [isPanelUp]);

  const handleUpdate = async () => {
    try {
      const res = await axios.post(`${Base_Url}/api/panel-logout`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (res.data.code === 200) {
        toast.success(res.data.msg);
        localStorage.clear();
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      toast.error("Update failed. Please try again.");
      console.error("Update failed:", error);
    }
  };

  if (isCollapsed) return null;

  return (
    <div className="mt-auto relative">
      {/* Version Display */}
      {!showUpdateBadge ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-3 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white">
              v{localStorage.getItem("verCon")}
            </span>
            {showDot && (
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </div>
          <div className="text-xs font-medium text-white/90">
            Updated: 15/05/2025
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-3 shadow-sm cursor-pointer"
          onClick={() => setOpenDialog(true)}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">
              New Update Available!
            </span>
            {showDot && (
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </div>
          <div className="text-[11px] text-white/80 mt-1">
            Current: v{localStorage.getItem("verCon")} → New: v{isPanelUp?.version?.version_panel}
          </div>
        </motion.div>
      )}

      {/* Update Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
            <DialogTitle className="text-center">Version Update Available</DialogTitle>
            <DialogDescription className="text-center">
              A new version <span className="font-medium">v{isPanelUp?.version?.version_panel}</span> is ready to install.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex gap-3">
              <Button
                variant="default"
                className="w-full"
                onClick={handleUpdate}
              >
                Update Now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOpenDialog(false)}
              >
                Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};