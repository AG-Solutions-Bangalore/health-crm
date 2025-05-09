import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  ChevronDown,
  Loader2,
  Search,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  BarChart3,
  Activity,
  PieChart,
  Users,
  Laptop,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import { Base_Url } from "@/config/BaseUrl";
import { toast } from "sonner";

const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onError: (error) => {
      toast.error("Failed to fetch dashboard data");
      console.error("Dashboard error:", error);
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries(["dashboard"]);
      toast.success("Dashboard data refreshed");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Define columns for the test data table
  const columns = [
    {
      accessorKey: "patient.firstName",
      header: "Patient Name",
      cell: ({ row }) => (
        <div className="font-medium text-slate-800">
          {row.original.patient?.firstName} {row.original.patient?.lastName}
        </div>
      ),
    },
    {
      accessorKey: "deviceID",
      header: "Device ID",
      cell: ({ row }) => (
        <div className="text-slate-600 font-medium text-sm">
          {row.getValue("deviceID")}
        </div>
      ),
    },
    {
      accessorKey: "patient.deviceMacAddress",
      header: "MAC Address",
      cell: ({ row }) => (
        <div className="text-slate-600 font-mono text-xs">
          {row.original.patient?.deviceMacAddress}
        </div>
      ),
    },
    {
      accessorKey: "readingType",
      header: "Test Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {row.getValue("readingType")}
        </Badge>
      ),
    },
    {
      accessorKey: "readingTimeUTC",
      header: "Test Time",
      cell: ({ row }) => (
        <div className="text-slate-600 text-sm">
          {new Date(row.getValue("readingTimeUTC")).toLocaleString()}
        </div>
      ),
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: dashboardData?.lastTestData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  if (isLoading && !isRefreshing) {
    return (
      <Layout>
        <div className="w-full p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800">Dashboard Overview</h2>
            <Button disabled variant="outline" size="sm" className="text-sm">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading...
            </Button>
          </div>
          
          {/* Skeleton for Summary Cards */}
          <div className="grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden shadow-sm">
                <CardHeader className="py-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="pb-3">
                  <Skeleton className="h-7 w-12 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Skeleton for Table */}
          <Card className="shadow-sm">
            <CardHeader className="py-3">
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex justify-between pb-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="w-full p-4">
          <Card className="shadow-sm border-red-100">
            <CardHeader className="py-3">
              <CardTitle className="text-red-500 text-sm">Error Fetching Dashboard Data</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="text-sm">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full p-0 md:p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Dashboard Overview</h2>
            <p className="text-sm text-slate-500">Summary of medical tests and patient data</p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="h-9 px-3 text-sm bg-white"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Last Updated Info */}
        <div className="flex items-center text-xs text-slate-500">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {new Date().toLocaleString()}
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Device Card */}
          <Card className="overflow-hidden shadow-sm border-t-2 border-t-blue-500 hover:shadow-md transition-all">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
                <Laptop className="h-4 w-4 mr-2 text-blue-500" />
                Devices Assigned
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 bg-green-100 text-green-700">
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="py-3 px-4">
              {isRefreshing ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-slate-800">{dashboardData?.totalDevice}</div>
              )}
              <p className="text-sm text-slate-500">Active devices in your network</p>
            </CardContent>
            <CardFooter className="pt-0 px-4 pb-3">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </CardFooter>
          </Card>

          {/* Patients Card */}
          <Card className="overflow-hidden shadow-sm border-t-2 border-t-indigo-500 hover:shadow-md transition-all">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
                <Users className="h-4 w-4 mr-2 text-indigo-500" />
                Total Patients
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 bg-green-100 text-green-700">
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="py-3 px-4">
              {isRefreshing ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-slate-800">{dashboardData?.totalPatient}</div>
              )}
              <p className="text-sm text-slate-500">Patients in the system</p>
            </CardContent>
            <CardFooter className="pt-0 px-4 pb-3">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </CardFooter>
          </Card>

          {/* Tests Card */}
          <Card className="overflow-hidden shadow-sm border-t-2 border-t-emerald-500 hover:shadow-md transition-all">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-emerald-500" />
                Total Tests
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 bg-green-100 text-green-700">
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="py-3 px-4">
              {isRefreshing ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-slate-800">{dashboardData?.totalPatientTest}</div>
              )}
              <p className="text-sm text-slate-500">Tests conducted</p>
            </CardContent>
            <CardFooter className="pt-0 px-4 pb-3">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Tests Table */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-slate-500" />
                Recent Tests (Last 5)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex flex-col md:flex-row items-center justify-between py-1 gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search tests..."
                  value={table.getState().globalFilter || ""}
                  onChange={(event) => table.setGlobalFilter(event.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 text-sm bg-white flex-shrink-0">
                      Columns <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-sm">
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
            </div>
            
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-slate-50">
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead 
                            key={header.id} 
                            className="text-xs font-medium text-slate-600 h-9 py-0"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <div className="flex items-center">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                              {{
                                asc: <ChevronDown className="ml-1 h-3 w-3 rotate-180" />,
                                desc: <ChevronDown className="ml-1 h-3 w-3" />,
                              }[header.column.getIsSorted()] ?? null}
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isRefreshing ? (
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={index} className="h-11">
                        {Array(5).fill(0).map((_, cellIndex) => (
                          <TableCell key={cellIndex} className="py-2">
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="h-11 text-sm hover:bg-slate-50 cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-2">
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
                        className="h-24 text-center text-sm text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="rounded-full bg-slate-50 p-3 mb-2">
                            <Search className="h-5 w-5 text-slate-300" />
                          </div>
                          No test data available
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;