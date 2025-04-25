import { Button } from "@/components/ui/button";
import {
    ClipboardList,
  Download,
  Edit,
  Eye,
  FilePlus2,
  MinusCircle,
  Printer,
  SquarePlus,
  Trash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { checkPermission } from "./checkPermission";
import React, { forwardRef } from "react";

const getStaticPermissions = () => {
  const buttonPermissions = localStorage.getItem("buttonControl");
  try {
    return buttonPermissions ? JSON.parse(buttonPermissions) : [];
  } catch (error) {
    console.error(
      "Error parsing StaticPermission data from localStorage",
      error
    );
    return [];
  }
};

/*-----------------------------Patient list------------------------- */
export const DeviceCreate = ({ onClick, className }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("id") || "";
  const staticPermissions = getStaticPermissions();
  if (!checkPermission(userId, "DeviceCreate", staticPermissions)) {
    return null;
  }

  return (
    <Button variant="default" className={className} onClick={onClick}>
      <SquarePlus className="h-4 w-4" /> Device
    </Button>
  );
};
DeviceCreate.page = "Device";




export const PatientReport = forwardRef(({ onClick, className }, ref) => {
  const userId = localStorage.getItem("id") || "";
  const staticPermissions = getStaticPermissions();

  if (!checkPermission(userId, "PatientReport", staticPermissions)) {
    return null;
  }

  return (
    <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
    <Button
      ref={ref}
      onClick={onClick}
      className={className}
      variant="ghost"
      size="icon"
    >
      <ClipboardList className="h-4 w-4 " />
    </Button>
    </TooltipTrigger>
          <TooltipContent>Patient Report</TooltipContent>
        </Tooltip>
      </TooltipProvider>
  );
});
PatientReport.page = "Patient";

export const PatientHistory = forwardRef(({ onClick, className }, ref) => {
  const userId = localStorage.getItem("id") || "";
  const staticPermissions = getStaticPermissions();

  if (!checkPermission(userId, "PatientHistory", staticPermissions)) {
    return null;
  }

  return (
    <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
    <Button
      ref={ref}
      onClick={onClick}
      className={className}
      
      variant="ghost"
      size="icon"
    >
      <Eye className="h-4 w-4" />
    </Button>
    </TooltipTrigger>
          <TooltipContent>Patient History</TooltipContent>
        </Tooltip>
      </TooltipProvider>
  );
});
PatientHistory.page = "Patient";

// ===================== InvoiceDocument =====================
// export const InvoiceDocument = forwardRef(({ onClick, className }, ref) => {
//   const userId = localStorage.getItem("id") || "";
//   const staticPermissions = getStaticPermissions();

//   if (!checkPermission(userId, "InvoiceDocument", staticPermissions)) {
//     return null;
//   }

//   return (
//     <Button
//       ref={ref}
//       onClick={onClick}
//       className={className}
//       title="Invoice Document"
//       variant="ghost"
//       size="icon"
//     >
//       <FilePlus2 className="h-4 w-4 text-black" />
//     </Button>
//   );
// });
// InvoiceDocument.page = "Invoice";

// ===================== InvoiceDelete =====================
// export const InvoiceDelete = forwardRef(({ onClick, className }, ref) => {
//   const userId = localStorage.getItem("id") || "";
//   const staticPermissions = getStaticPermissions();

//   if (!checkPermission(userId, "InvoiceDelete", staticPermissions)) {
//     return null;
//   }

//   return (
//     <Button
//       ref={ref}
//       onClick={onClick}
//       className={className}
//       title="Invoice Delete"
//       variant="ghost"
//       size="icon"
//     >
//       <Trash className="h-4 w-4 text-red-500" />
//     </Button>
//   );
// });
// InvoiceDelete.page = "Invoice";

export default {
    PatientReport,
    PatientHistory,
    DeviceCreate,
 
 
};
