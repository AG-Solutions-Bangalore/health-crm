import Layout from "@/components/Layout";
import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, RefreshCw, Loader2, ChevronDown } from "lucide-react";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
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
const readingTypeMappings = {
  Pressure: ["BPSITL"],
  Glucose: ["GLF", "GL", "GLR", "GLFMM", "GLRMM", "GLMM"],
  Oxygen: ["OXY"],
  TempF: ["T"],
  TempC: ["TC"],
  ECG: ["ECG"],
  Heartrate: ["BPM"],
  Weight: ["WT", "WTKG"],
  Height: ["H", "HCM"],
};

const readingUnits = {
  Pressure: "mmHg",
  Glucose: "mg/dL",
  Oxygen: "%",
  TempF: "°F",
  TempC: "°C",
  Heartrate: "bpm",
  Weight: "kg",
  Height: "cm",
};

const PatientSummary = () => {
  const { selectedDevice } = useSelector((state) => state.device);
  const deviceId = selectedDevice?.macid;
  const containerRef = useRef();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    Object.keys(readingTypeMappings).reduce((acc, column) => {
      acc[column] = true;
      return acc;
    }, {})
  );

  // Query to get patient list
  const {
    data: patientList,
    isLoading: isLoadingPatients,
    isError: isErrorPatients,
    refetch: refetchPatients,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["patientList", deviceId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/hc09/api/patient/ls?did=${deviceId}&by&since&size=100&sort=1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.l.reverse();
    },
    enabled: !!deviceId,
  });

  // Query to get readings for all patients
  const {
    data: allReadings,
    isLoading: isLoadingReadings,
    isError: isErrorReadings,
    refetch: refetchReadings,
  } = useQuery({
    queryKey: ["allPatientReadings", patientList],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!patientList) return {};

      const readingPromises = patientList.map((patient) =>
        axios
          .get(
            `/api/hc09/api/test/ls?patientID=${patient.patientID}&by&since&size=100&sort=1`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => ({
            patientID: patient.patientID,
            readings: res.data.l || [],
          }))
      );

      const results = await Promise.all(readingPromises);
      return results.reduce((acc, { patientID, readings }) => {
        acc[patientID] = readings;
        return acc;
      }, {});
    },
    enabled: !!patientList && patientList.length > 0,
  });

  const formatReadingValue = (reading) => {
    if (reading.readingType === "ECG") {
      return "ECG Done";
    }

    if (reading.readingType === "T" || reading.readingType === "TC") {
      return `${Number(reading.readingValue).toFixed(2)} ${
        readingUnits[reading.readingType] || ""
      }`;
    }

    return `${reading.readingValue} ${readingUnits[reading.readingType] || ""}`;
  };

  // Get latest readings for each patient and each category -- see report view for more understanding
  const patientSummaryData = useMemo(() => {
    if (!patientList || !allReadings) return [];

    return patientList.map((patient) => {
      const readings = allReadings[patient.patientID] || [];

      const latestReadings = {};
      readings.forEach((reading) => {
        for (const [category, types] of Object.entries(readingTypeMappings)) {
          if (types.includes(reading.readingType)) {
            if (
              !latestReadings[category] ||
              new Date(reading.readingTimeUTC) >
                new Date(latestReadings[category].readingTimeUTC)
            ) {
              latestReadings[category] = reading;
            }
            break;
          }
        }
      });

      return {
        patient,
        latestReadings,
      };
    });
  }, [patientList, allReadings]);
  const downloadExcel = async () => {
    if (!patientSummaryData || patientSummaryData.length === 0) {
      console.warn("No data available to export");
      return;
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Patient Summary");
  
 

    const headers = ["Sl No", "Patient Name", "Pressure", "Glucose", "Heartrate", "Time"];
  
    // Add headers to worksheet
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true ,color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "6A9AD0" },
      };
    
      cell.alignment = { horizontal: "center" };
    });
  
    // Add data rows
    patientSummaryData.forEach(({ patient, latestReadings }, index) => {
      const row = worksheet.addRow([
        index + 1,
        `${patient.firstName} ${patient.lastName}`,
        latestReadings.Pressure ? formatReadingValue(latestReadings.Pressure) : "-",
        latestReadings.Glucose ? formatReadingValue(latestReadings.Glucose) : "-",
        latestReadings.Heartrate ? formatReadingValue(latestReadings.Heartrate) : "-",
        latestReadings.Pressure 
          ? moment(latestReadings.Pressure.readingTimeUTC).format("h:mm A") 
          : ""
      ]);
  
     
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber === 1) { // Sl No
          cell.alignment = { horizontal: 'center' };
        } else if (colNumber === 2) { // Patient Name
          cell.alignment = { horizontal: 'left' };
        } else if (colNumber >= 3 && colNumber <= 5) { // Pressure, Glucose, Heartrate
          cell.alignment = { horizontal: 'center' };
        } else if (colNumber === 6) { // Time
          cell.alignment = { horizontal: 'right' ,};
          cell.font = { size: 9 };
        }
      });
    });
  
    // Auto-fit columns
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
  
    // Generate and download Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `patient_report_${moment().format("DD-MMM-YYYY")}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "patient-summary",
    pageStyle: `
      @page {
        size: A4 landscape;
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
      await Promise.all([refetchPatients(), refetchReadings()]);
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

  const isLoading = isLoadingPatients || isLoadingReadings;
  const isError = isErrorPatients || isErrorReadings;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Patient Summary
          </Button>
        </div>
      </Layout>
    );
  }
  // #6A9AD0
  if (isError) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-500">
          Error loading patient summary
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
          <h1 className="text-xl font-bold">Patients Summary</h1>
          <div className="print:hidden flex items-center gap-4">
            <div className=" flex items-center text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-0.5">
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
                  {Object.keys(readingTypeMappings).map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      className="capitalize"
                      checked={visibleColumns[column]}
                      onCheckedChange={() => toggleColumnVisibility(column)}
                    >
                      {column}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="print-hide" onClick={handlPrintPdf}>
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button className="print-hide" onClick={downloadExcel}>
              <RiFileExcel2Line className="h-3 w-3 mr-1" /> Excel

              </Button>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-center border-b">Sl No</th>
                <th className="p-2 text-left border-b">Patient Name</th>
                {Object.keys(readingTypeMappings).map(
                  (category) =>
                    visibleColumns[category] && (
                      <th key={category} className="p-2 text-left border-b">
                        {category}
                      </th>
                    )
                )}
              </tr>
            </thead>
            <tbody>
              {patientSummaryData.map(({ patient, latestReadings }, index) => (
                <tr key={patient.patientID} className="hover:bg-gray-50">
                  <td className="p-2 text-center border-b">{index + 1}</td>
                  <td className="p-2 border-b">
                    {patient.firstName} {patient.lastName}
                  </td>

                  {Object.keys(readingTypeMappings).map(
                    (category) =>
                      visibleColumns[category] && (
                        <td key={category} className="p-2 border-b">
                          {latestReadings[category] ? (
                            <div>
                              <div className="font-medium">
                                {formatReadingValue(latestReadings[category])}
                              </div>
                              <div className="text-xs text-gray-500">
                                {moment(
                                  latestReadings[category].readingTimeUTC
                                ).format("h:mm A")}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default PatientSummary;