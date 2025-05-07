import Layout from "@/components/Layout";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, RefreshCw, Loader2, ChevronDown } from "lucide-react";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import ExcelJS from "exceljs";
import { RiFileExcel2Line } from "react-icons/ri";
import { Base_Url } from "@/config/BaseUrl";

const HospitalDeviceReport = () => {
  const containerRef = useRef();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    deviceNameOrId: true,
    deviceMacAddress: true,
    hospitalDeviceCreatedDate: true,
    hospitalDeviceStatus: true,
  });

 
  const {
    data: hospitalsData,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["hospitalDevices"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-report-of-all-hospital-with-device`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.hospital;
    },
  });

  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "hospital-device-report",
    pageStyle: `
      @page {
        size: A4 ;
        margin: 5mm;
      }
      @media print {
        body {
          border: 0px solid #000;
          font-size: 10px; 
          margin: 0mm;
          padding: 0mm;
          min-height: 100vh;
        }
        table {
          font-size: 11px;
        }
        .print-hide {
          display: none;
        }
      }
    `,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const downloadExcel = async () => {
    if (!hospitalsData || hospitalsData.length === 0) {
      console.warn("No data available to export");
      return;
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Hospital Device Report");
  
    const headers = [
      "Hospital Name", 
      "Hospital Area", 
      "Device Name/ID", 
      "MAC Address", 
      "Created Date", 
      "Status"
    ];
  
    // Add headers to worksheet
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "6A9AD0" },
      };
      cell.alignment = { horizontal: "center" };
    });
  

    hospitalsData.forEach((hospital) => {
      if (hospital.hospital_device && hospital.hospital_device.length > 0) {
        hospital.hospital_device.forEach((device) => {
          const row = worksheet.addRow([
            hospital.hospitalName,
            hospital.hospitalArea,
            device.deviceNameOrId,
            device.deviceMacAddress,
            device.hospitalDeviceCreatedDate,
            device.hospitalDeviceStatus,
          ]);
  
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber <= 2) { 
              cell.alignment = { horizontal: 'left' };
            } else if (colNumber >= 3 && colNumber <= 4) { 
              cell.alignment = { horizontal: 'left' };
            } else { 
              cell.alignment = { horizontal: 'center' };
            }
          });
        });
      } else {
     
        const row = worksheet.addRow([
          hospital.hospitalName,
          hospital.hospitalArea,
          "No devices",
          "-",
          "-",
          "-",
        ]);
      }
    });
  
  
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });
  
   
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hospital_device_report_${moment().format("DD-MMM-YYYY")}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Hospital Device Report
          </Button>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-500">
          Error loading hospital device report
          <Button className="mt-4" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div ref={containerRef} className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center p-2 rounded-lg mb-5 bg-gray-200">
          <h1 className="text-xl font-bold">Hospital Device Report</h1>
          <div className="print:hidden flex items-center gap-4">
            <div className="flex items-center text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-0.5">
              <span>
                Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="print-hide">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.keys(visibleColumns).map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      className="capitalize"
                      checked={visibleColumns[column]}
                      onCheckedChange={() => toggleColumnVisibility(column)}
                    >
                      {column === "deviceNameOrId" ? "Device Name/ID" : 
                       column === "deviceMacAddress" ? "MAC Address" : 
                       column === "hospitalDeviceCreatedDate" ? "Created Date" : 
                       column === "hospitalDeviceStatus" ? "Status" : column}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="print-hide" onClick={handlPrintPdf}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button className="print-hide" onClick={downloadExcel}>
                <RiFileExcel2Line className="h-3 w-3 mr-1" /> Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Hospital and Device Tables */}
        {hospitalsData && hospitalsData.map((hospital) => (
          <div key={hospital.id} className="mb-6 border rounded-lg overflow-hidden">
            {/* Hospital Header */}
            <div className="bg-gray-50 p-2 border-b">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{hospital.hospitalName}</h2>
                 
                </div>
                <div className=" flex flex-row gap-4 text-sm text-right">
                <p className="text-sm text-gray-500">Area: {hospital.hospitalArea}</p>
                  {/* <p>Created: {hospital.hospitalCreationDate}</p> */}
                  <p className={`font-medium ${hospital.hospitalStatus === "Active" ? "text-green-600" : "text-red-600"}`}>
                    {hospital.hospitalStatus}
                  </p>
                 
                </div>
              </div>
            </div>

          
            
            
            {/* Devices Table */}
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-center border-b">Sl No</th>
                  {visibleColumns.deviceNameOrId && (
                    <th className="p-2 text-left border-b">Device Name/ID</th>
                  )}
                  {visibleColumns.deviceMacAddress && (
                    <th className="p-2 text-left border-b">MAC Address</th>
                  )}
                  {visibleColumns.hospitalDeviceCreatedDate && (
                    <th className="p-2 text-center border-b">Created Date</th>
                  )}
                  {visibleColumns.hospitalDeviceStatus && (
                    <th className="p-2 text-center border-b">Status</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {hospital.hospital_device && hospital.hospital_device.length > 0 ? (
                  hospital.hospital_device.map((device, index) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="p-2 text-center border-b">{index + 1}</td>
                      {visibleColumns.deviceNameOrId && (
                        <td className="p-2 border-b">{device.deviceNameOrId}</td>
                      )}
                      {visibleColumns.deviceMacAddress && (
                        <td className="p-2 border-b font-mono text-xs">{device.deviceMacAddress}</td>
                      )}
                      {visibleColumns.hospitalDeviceCreatedDate && (
                        <td className="p-2 text-center border-b">{device.hospitalDeviceCreatedDate}</td>
                      )}
                      {visibleColumns.hospitalDeviceStatus && (
                        <td className="p-2 text-center border-b">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            device.hospitalDeviceStatus === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {device.hospitalDeviceStatus}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-gray-500">
                      No devices found for this hospital
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default HospitalDeviceReport;