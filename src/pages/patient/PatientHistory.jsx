import React, { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Edit,
  Edit2,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  SquarePlus,
  Trash,
  UserPen,
  View,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Base_Url } from "@/config/BaseUrl";

const PatientHistory = () => {
  const { id } = useParams();
  const location = useLocation();
  const { firstName, lastName } = location.state || {};
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["patientHistory", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-patient-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.patient[0]; // Extract the first patient object
    },
  });

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();

  // reading type code
  const readingTypeMappings = {
    Pressure: ["BPSITL"],
    Glucose: ["GLF", "GL", "GLR", "GLFMM", "GLRMM", "GLMM"],
    Oxygen: ["OXY"],
    TempF: ["T"],
    TempC: ["TC"],
    ECG: ["ECG"],
    Heartrate: ["BPM"],
    Weight: ["WT","WTKG"],
    Height: ["H","HCM"],
  };

  const filteredData = useMemo(() => {
    const dataList = responseData?.patient_test || [];

    if (activeTab === "All") return dataList;

    const typeCodes = readingTypeMappings[activeTab] || [];

    return dataList.filter(
      (item) => item && item.readingType && typeCodes.includes(item.readingType)
    );
  }, [responseData, activeTab]);

  // Define columns for the table
  const columns = [
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => <div>{row.getValue("source")}</div>,
    },
    {
      accessorKey: "readingType",
      header: "Reading Type",
      cell: ({ row }) => <div>{row.getValue("readingType")}</div>,
    },
    {
      accessorKey: "readingValue",
      header: "Reading Value",
      cell: ({ row }) => {
        const value = row.getValue("readingValue");
        const truncatedValue =
          value.length > 30 ? `${value.substring(0, 30)}...` : value;
        return <div className="truncate">{truncatedValue}</div>;
      },
    },
    {
      accessorKey: "readingTimeUTC",
      header: "Reading Time",
      cell: ({ row }) => {
        const date = new Date(row.getValue("readingTimeUTC"));
        return <div>{date.toLocaleString()}</div>;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const reading = row.original;
        if (reading.readingType === "ECG" && reading.e_c_g_parameters?.[0]?.pdfData) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const byteCharacters = atob(reading.e_c_g_parameters[0].pdfData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
               
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ECG_${reading.readingTimeUTC}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              ECG Report
            </Button>
          );
        }
        return null;
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const dataList = responseData?.patient_test || [];
    const counts = {
      All: dataList.length,
    };

    // Calculate counts for each tab
    Object.keys(readingTypeMappings).forEach((tab) => {
      const typeCodes = readingTypeMappings[tab];
      counts[tab] = dataList.filter(
        (item) =>
          item && item.readingType && typeCodes.includes(item.readingType)
      ).length;
    });

    return counts;
  }, [responseData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className=" h-4 w-4 animate-spin" />
            Loading Patient History Data
          </Button>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Patient History Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl text-gray-800">
            Patient History of {firstName} {lastName}
          </h1>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1">
                    <span>Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
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
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* searching and column filter  */}
        <div className="flex items-center py-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search patient history..."
              value={table.getState().globalFilter || ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            />
          </div>
         
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Reading Type Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-4"
        >
          <TabsList className="h-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 w-full shadow-lg">
            {[
              "All",
              "Pressure",
              "Glucose",
              "Oxygen",
              "TempF",
              "TempC",
              "ECG",
              "Heartrate",
              "Weight",
              "Height",
            ].map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab} ({tabCounts[tab] || 0})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {/* table  */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* row selection and pagination button  */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Total Visit : &nbsp;
            {table.getFilteredRowModel().rows.length}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientHistory;