import { useEffect } from "react";
import { toast } from "sonner";

const DisableInspect = () => {
  useEffect(() => {
    const handleRightClick = (e) => {
      e.preventDefault();
      toast.warning("Right click is disabled.");
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) || 
        (e.metaKey && e.altKey && key === "i") 
      ) {
        e.preventDefault();
        toast.warning("Developer tools are disabled on this page.");
        return false;
      }
    };

    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
};

export default DisableInspect;
