import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import React, { useRef, useState, useMemo, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import html2pdf from 'html2pdf.js';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, Download, Loader2, Printer, RefreshCw } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Base_Url } from "@/config/BaseUrl";
import { getNavbarColors } from "@/components/buttonColors/ButtonColors";
import { toast } from "sonner";

const readingIcons = {
  Pressure: (
    <img
      src="/icon/pressure-icon.png"
      alt="Pressure"
      className="w-16 h-16 print:w-16 print:h-16"
    />
  ),
  Glucose: (
    <img
      src="/icon/glucose-icon.png"
      alt="Glucose"
      className="w-16 h-16 print:w-16 print:h-16"
    />
  ),
  Oxygen: (
    <img
      src="/icon/bloodspo2-200x197.png"
      alt="Oxygen"
      className="w-16 h-16 print:w-16 print:h-16"
    />
  ),
  TempF: (
    <img
      src="/icon/temperatute-icon.png"
      alt="Temperature"
      className="w-16 h-16 print:w-16 print:h-16"
    />
  ),
  TempC: (
    <img
      src="/icon/temperatute-icon.png"
      alt="Temperature"
      className="w-16 h-16 print:w-16 print:h-16"
    />
  ),
 ECG: (
  <span className="text-[4rem] w-16 h-16 print:text-[4rem] print:w-16 print:h-16 flex items-center justify-center">
    📈
  </span>
),

  Heartrate: (
    <img
      src="/icon/rate-icon.png"
      alt="Heartrate"
      className="w-16 h-16 print:w-16 print:h-16"
    />
  ),
  Weight: <span className="text-[4rem] w-16 h-16 print:text-[4rem] print:w-16 print:h-16 flex items-center justify-center">⚖️</span>,
  Height: <span className="text-[4rem] w-16 h-16 print:text-[4rem] print:w-16 print:h-16 flex items-center justify-center">📏</span>,
};

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

const ReportView = () => {
  const { id } = useParams();
  const location = useLocation();
  const containerRef = useRef();
const userPosition = localStorage.getItem("user_position");
  
      const colors = getNavbarColors(userPosition);
  // Date state
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-patient-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    enabled: !!id,
  });


  const patientData = useMemo(() => {
    if (!responseData || !responseData.patient || responseData.patient.length === 0) {
      return null;
    }
    return responseData.patient[0];
  }, [responseData]);

  const patientReadings = useMemo(() => {
    if (!patientData || !patientData.patient_test) {
      return { l: [] };
    }
    return { l: patientData.patient_test };
  }, [patientData]);

  const { availableDates, mostRecentDate } = useMemo(() => {
    if (!patientReadings || !patientReadings.l)
      return { availableDates: [], mostRecentDate: null };

    const dates = new Set();
    let latestDate = null;

    patientReadings.l.forEach((reading) => {
      const dateStr = moment(reading.readingTimeUTC).format("YYYY-MM-DD");
      dates.add(dateStr);

      const currentDate = new Date(reading.readingTimeUTC);
      if (!latestDate || currentDate > latestDate) {
        latestDate = currentDate;
      }
    });

    const sortedDates = Array.from(dates).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    return {
      availableDates: sortedDates,
      mostRecentDate: latestDate
        ? moment(latestDate).format("YYYY-MM-DD")
        : null,
    };
  }, [patientReadings]);

  useEffect(() => {
    if (mostRecentDate && selectedDate === null) {
      setSelectedDate(mostRecentDate);
    }
  }, [mostRecentDate, selectedDate]);

  useEffect(() => {
    if (patientReadings) {
      if (patientReadings.l && patientReadings.l.length === 0) {
        setSelectedDate("all");
      } else if (mostRecentDate && selectedDate === null) {
        setSelectedDate(mostRecentDate);
      }
    }
  }, [patientReadings, mostRecentDate, selectedDate]);

  const organizedReadings = useMemo(() => {
    if (!patientReadings || !patientReadings.l) return {};

    const organized = {};

    patientReadings.l.forEach((reading) => {
      const readingDate = new Date(reading.readingTimeUTC);
      const readingDateStr = moment(readingDate).format("YYYY-MM-DD");

      if (
        selectedDate &&
        selectedDate !== "all" &&
        readingDateStr !== selectedDate
      ) {
        return;
      }

      for (const [displayType, typeArray] of Object.entries(
        readingTypeMappings
      )) {
        if (typeArray.includes(reading.readingType)) {
          if (!organized[displayType]) {
            organized[displayType] = [];
          }
          organized[displayType].push(reading);
          break;
        }
      }
    });

    return organized;
  }, [patientReadings, selectedDate]);
  const generatePdf = () => {
    const element = containerRef.current;
    
   
    const style = document.createElement('style');
    style.textContent = `
      @page {
        size: A4 portrait;
        margin: 5mm;
      }
      body {
        font-size: 10px !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .print-hide {
        display: none !important;
      }
      .patient-details {
        padding: 6px !important;
        margin-bottom: 8px !important;
      }
      .vital-card {
        page-break-inside: avoid;
        break-inside: avoid;
        padding: 6px !important;
        margin-bottom: 6px !important;
      }
      h1 {
        font-size: 16px !important;
        margin-bottom: 4px !important;
      }
      h2, h3 {
        font-size: 14px !important;
        margin-bottom: 3px !important;
      }
      .text-2xl {
        font-size: 18px !important;
      }
      .text-lg {
        font-size: 14px !important;
      }
      .text-sm {
        font-size: 12px !important;
      }
      .text-xs {
        font-size: 10px !important;
      }
      .grid {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 6px !important;
      }
      .gap-4 {
        gap: 6px !important;
      }
      .p-4 {
        padding: 8px !important;
      }
      .border {
        border-width: 1px !important;
      }
      input[type="checkbox"] {
        -webkit-appearance: checkbox !important;
        appearance: checkbox !important;
        width: 12px !important;
        height: 12px !important;
      }
    `;
    document.head.appendChild(style);
  
    const options = {
      margin: [5, 5, 5, 5],
      filename: `${firstName || 'Patient'}_${lastName || ''}_Medical_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
  
   
    const printButtons = document.querySelectorAll('.print-hide');
    printButtons.forEach(btn => {
      btn.style.display = 'none';
    });
  
    html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        
        // Add page numbers to each page
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() - 20,
            pdf.internal.pageSize.getHeight() - 10
          );
        }
        
        // Save the PDF
        pdf.save();
        
        // Restore print buttons after PDF generation
        printButtons.forEach(btn => {
          btn.style.display = '';
        });
        
        // Clean up the style element
        document.head.removeChild(style);
      });
  };
  const handleSendMail = async () => {
   
    if (!email) {
      toast.error("Email address not available. Please add email first.");
      return;
    }
  
    setIsSendingEmail(true);
    try {
     
      toast.info("Generating PDF for email...");
      
      const element = containerRef.current;
        // Add print styles
      const style = document.createElement('style');
      style.textContent = `
        @page {
          size: A4 portrait;
          margin: 5mm;
        }
        body {
          font-size: 10px !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-hide {
          display: none !important;
        }
        .patient-details {
          padding: 6px !important;
          margin-bottom: 8px !important;
        }
        .vital-card {
          page-break-inside: avoid;
          break-inside: avoid;
          padding: 6px !important;
          margin-bottom: 6px !important;
        }
        h1 {
          font-size: 16px !important;
          margin-bottom: 4px !important;
        }
        h2, h3 {
          font-size: 14px !important;
          margin-bottom: 3px !important;
        }
        .text-2xl {
          font-size: 18px !important;
        }
        .text-lg {
          font-size: 14px !important;
        }
        .text-sm {
          font-size: 12px !important;
        }
        .text-xs {
          font-size: 10px !important;
        }
        .grid {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 6px !important;
        }
        .gap-4 {
          gap: 6px !important;
        }
        .p-4 {
          padding: 8px !important;
        }
        .border {
          border-width: 1px !important;
        }
        input[type="checkbox"] {
          -webkit-appearance: checkbox !important;
          appearance: checkbox !important;
          width: 12px !important;
          height: 12px !important;
        }
      `;
      document.head.appendChild(style);
    
      const options = {
        margin: [5, 5, 5, 5],
        filename: `${firstName || 'Patient'}_${lastName || ''}_Medical_Report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
    
      
      const printButtons = document.querySelectorAll('.print-hide');
      printButtons.forEach(btn => {
        btn.style.display = 'none';
      });
    
      
      const pdfBlob = await new Promise((resolve) => {
        html2pdf()
          .set(options)
          .from(element)
          .toPdf()
          .get('pdf')
          .then((pdf) => {
           
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i);
              pdf.setFontSize(10);
              pdf.setTextColor(150);
              pdf.text(
                `Page ${i} of ${totalPages}`,
                pdf.internal.pageSize.getWidth() - 20,
                pdf.internal.pageSize.getHeight() - 10
              );
            }
            
           
            const blob = pdf.output('blob');
            resolve(blob);
            

            printButtons.forEach(btn => {
              btn.style.display = '';
            });
            
           
            document.head.removeChild(style);
          });
      });
  
      toast.success("PDF generated successfully. ");
      toast.success("Preparing to send email... ");
  
     
      const formData = new FormData();
      formData.append('id', id);
      formData.append('to_name', `${firstName || ''} ${lastName || ''}`);
      formData.append('to_email', email);
      formData.append('file_image', pdfBlob);
  
     
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${Base_Url}/api/panel-send-patient-email`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
  
      
      if (response.data.code === 200) {
        toast.success(response.data.msg);
      } else {
        toast.error("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Error sending email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };
  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "patient-report",
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 5mm;
      }
      @media print {
        body {
          font-size: 10px !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-hide {
          display: none !important;
        }
        .patient-details {
          padding: 6px !important;
          margin-bottom: 8px !important;
        }
        .vital-card {
          page-break-inside: avoid;
          break-inside: avoid;
          padding: 6px !important;
          margin-bottom: 6px !important;
        }
        h1 {
          font-size: 16px !important;
          margin-bottom: 4px !important;
        }
        h2, h3 {
          font-size: 14px !important;
          margin-bottom: 3px !important;
        }
        .text-2xl {
          font-size: 18px !important;
        }
        .text-lg {
          font-size: 14px !important;
        }
        .text-sm {
          font-size: 12px !important;
        }
        .text-xs {
          font-size: 10px !important;
        }
        .grid {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 6px !important;
        }
        .gap-4 {
          gap: 6px !important;
        }
        .p-4 {
          padding: 8px !important;
        }
        .border {
          border-width: 1px !important;
        }
        input[type="checkbox"] {
          -webkit-appearance: checkbox !important;
          appearance: checkbox !important;
          width: 12px !important;
          height: 12px !important;
        }
      }
    `,
  });

  const formatReadingValue = (reading) => {
    if (reading.readingType === "ECG") {
      return (
        <div className="flex flex-col items-start print:text-xs">
          <div className="text-sm font-medium text-gray-600 mb-1 print:text-xs print:mb-0.5">
            ECG Done
          </div>
          <div className="flex items-center space-x-4 print:space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`ecg-yes-${reading.uuid}`}
                className="mr-1 print:w-3 print:h-3"
              />
              <label
                htmlFor={`ecg-yes-${reading.uuid}`}
                className="text-xs print:text-xxs"
              >
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`ecg-no-${reading.uuid}`}
                className="mr-1 print:w-3 print:h-3"
              />
              <label
                htmlFor={`ecg-no-${reading.uuid}`}
                className="text-xs print:text-xxs"
              >
                No
              </label>
            </div>
          </div>
        </div>
      );
    }
if (reading.readingType === "T" || reading.readingType === "TC") {
    const numericValue = parseFloat(reading.readingValue);
    if (!isNaN(numericValue)) {
      return Math.round(numericValue * 100) / 100; 
    }
  }

  return reading.readingValue;
    // const formattedValue = reading.readingValue;
    // return formattedValue;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Use patient data from the new API response
  const { firstName, lastName, sex, city, email, address1, dob, cellNumber } = patientData || {};

  return (
    <Layout>
      <div className="p-4 print:p-2" ref={containerRef}>
        {/* Report Header */}
        <div className="flex justify-between items-start mb-6 print:mb-3">
          <div>
            <h1 className="text-2xl font-bold print:text-xl">
              Patient Medical Report
            </h1>
            <div className="text-sm text-gray-600 print:text-xs">
              Generated on: {moment().format("MMMM Do YYYY, h:mm:ss a")}
            </div>
          </div>
          {/* <div className="flex flex-col md:flex-row items-center gap-2">
            
            <Button
              variant="outline"
              size="sm"
                className={`${colors.buttonBg} ${colors.buttonHover} text-white print-hide`}
              onClick={handlPrintPdf}
            >
              <Printer className="h-4 w-4" /> Report
            </Button>
          </div> */}
          <div className="flex flex-col md:flex-row items-center gap-2">
  <Button
    variant="outline"
    size="sm"
    className={`${colors.buttonBg} ${colors.buttonHover} text-white print-hide`}
    onClick={handlPrintPdf}
  >
    <Printer className="h-4 w-4" /> Report
  </Button>
  <Button
    variant="outline"
    size="sm"
    className={`${colors.buttonBg} ${colors.buttonHover} text-white print-hide ml-2`}
    onClick={generatePdf}
  >
    <Download className="h-4 w-4" /> PDF
  </Button>
  <Button
    variant="outline"
    size="sm"
    className={`${colors.buttonBg} ${colors.buttonHover} text-white print-hide `}
    onClick={handleSendMail}
    disabled={!email || isSendingEmail}
  >
    {isSendingEmail ? (
      <Loader2 className="h-4 w-4 animate-spin mr-1" />
       ) : (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      Send Mail
    </>
  )}
</Button>
</div>
        </div>

        {/* Patient Details */}
        <div className="patient-details bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 border-b pb-2">
            Patient Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <strong className="text-gray-700">Name:</strong> {firstName}{" "}
              {lastName}
            </div>
            <div>
              <strong className="text-gray-700">Sex:</strong> {sex}
            </div>
            <div>
              <strong className="text-gray-700">Date of Birth:</strong>{" "}
              {dob ? moment(dob).format("MMMM Do YYYY") : "N/A"}
            </div>
            <div>
              <strong className="text-gray-700">Email:</strong> {email || "N/A"}
            </div>
            <div>
              <strong className="text-gray-700">Phone:</strong>{" "}
              {cellNumber || "N/A"}
            </div>
            <div>
              <strong className="text-gray-700">City:</strong>{" "}
              {city ? city.charAt(0).toUpperCase() + city.slice(1) : "N/A"}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <strong className="text-gray-700">Address:</strong>{" "}
              {address1 || "N/A"}
            </div>
          </div>
        </div>

        {/* Date Filter Dropdown */}
        <div className="print-hide mb-6 flex justify-end print:mb-3">
          <DropdownMenu
            open={isDateDropdownOpen}
            onOpenChange={setIsDateDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                {!selectedDate
                  ? "Loading..."
                  : selectedDate === "all"
                  ? "All Dates"
                  : moment(selectedDate).format("MMM D, YYYY")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-60 overflow-y-auto"
            >
              <DropdownMenuItem onClick={() => setSelectedDate("all")}>
                All Dates
              </DropdownMenuItem>
              {availableDates.map((date) => (
                <DropdownMenuItem
                  key={date}
                  onClick={() => setSelectedDate(date)}
                >
                  {moment(date).format("MMM D, YYYY")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center py-8 print:py-4 print:text-sm">
            Loading patient data...
          </div>
        )}
        {isError && (
          <div className="text-center py-8 text-red-500 print:py-4 print:text-sm">
            Error loading patient data. Please try again.
          </div>
        )}

        {/* Patient Readings - Card Layout */}
        {!isLoading && !isError && selectedDate && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
            {Object.entries(readingTypeMappings).map(([category]) => {
              let readings = organizedReadings[category] || [];

              if (selectedDate !== "all" && readings.length > 0) {
                readings = [...readings].sort(
                  (a, b) =>
                    new Date(b.readingTimeUTC) - new Date(a.readingTimeUTC)
                );
                readings = [readings[0]];
              }

              return (
                <div
                  key={category}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow vital-card print:p-2 print:shadow-none"
                >
                  <div className="flex items-center justify-between print:items-start">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center print:items-start">
                        <span className="text-2xl mr-2 print:text-2xl print:mr-2  ">
                          {readingIcons[category]}
                        </span>

                        <h3 className="text-2xl font-semibold print:text-2xl ">
                          {category}
                        </h3>
                      </div>
                      {readings.length > 0 && (
                        <span className="text-sm text-gray-500 mt-3 print:text-sm  print:ml-0 ">
                          {moment(readings[0].readingTimeUTC).format("D MMM YYYY , h:mm A")}
                        </span>
                      )}
                    </div>
                    
                    {readings.length > 0 && (
                      <div className="text-right print:text-left ">
                        <div className="text-2xl font-semibold print:text-2xl">
                          {formatReadingValue(readings[0])}
                        </div>
                        {readings[0].readingType !== "ECG" && (
                          <div className="text-sm font-medium text-gray-600 print:text-sm">
                            {readings[0].readingType}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {readings.length === 0 && (
                    <div className="text-center py-0 text-gray-400 text-sm print:text-xs">
                      No {category} readings available
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportView;