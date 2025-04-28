import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Define columns for the device table
  const columns = [
    {
      accessorKey: "deviceNameOrId",
      header: "Device Name/ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("deviceNameOrId")}</div>,
    },
    {
      accessorKey: "deviceMacAddress",
      header: "MAC Address",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("deviceMacAddress")}</div>,
    },
    {
      accessorKey: "patient_count",
      header: "Patients",
      cell: ({ row }) => (
        <Badge variant={row.getValue("patient_count") > 0 ? "default" : "secondary"}>
          {row.getValue("patient_count")}
        </Badge>
      ),
    },
    {
      accessorKey: "patientTest_count",
      header: "Tests",
      cell: ({ row }) => (
        <Badge variant={row.getValue("patientTest_count") > 0 ? "default" : "secondary"}>
          {row.getValue("patientTest_count")}
        </Badge>
      ),
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: dashboardData?.totalDeviceCount || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  if (isLoading || isRefreshing) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">
              {isRefreshing ? "Refreshing Dashboard Data..." : "Loading Dashboard Data"}
            </h3>
            <p className="text-muted-foreground">
              Please wait while we fetch the latest information
            </p>
          </div>
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
              Error Fetching Dashboard Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full p-4 space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg"></div>
            <div className="absolute h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 top-0 left-0"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Devices
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-blue-500"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData?.totalDevice}</div>
              <p className="text-xs text-muted-foreground">
                All registered devices in the system
              </p>
              <div className="mt-2 h-1 w-full bg-gradient-to-r from-transparent via-blue-200 to-transparent rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg"></div>
            <div className="absolute h-1 w-full bg-gradient-to-r from-purple-500 via-pink-400 to-purple-500 top-0 left-0"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-purple-500"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData?.totalPatient}</div>
              <p className="text-xs text-muted-foreground">
                All registered patients in the database
              </p>
              <div className="mt-2 h-1 w-full bg-gradient-to-r from-transparent via-purple-200 to-transparent rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg"></div>
            <div className="absolute h-1 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 top-0 left-0"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tests
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-amber-500"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData?.totalPatientTest}</div>
              <p className="text-xs text-muted-foreground">
                All tests conducted across devices
              </p>
              <div className="mt-2 h-1 w-full bg-gradient-to-r from-transparent via-amber-200 to-transparent rounded-full"></div>
            </CardContent>
          </Card>
        </div>

        {/* Device Table */}
        <Card className="overflow-hidden border border-slate-200">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Device Statistics</CardTitle>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center py-4">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices..."
                  value={table.getState().globalFilter || ""}
                  onChange={(event) => table.setGlobalFilter(event.target.value)}
                  className="pl-8"
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
            
            <div className="rounded-md border bg-gradient-to-b from-slate-50 to-white">
              <Table>
                <TableHeader className="bg-slate-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="font-medium text-slate-700">
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
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="transition-colors hover:bg-slate-50"
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
            
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} of{" "}
                {dashboardData?.totalDeviceCount?.length} devices
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="hover:bg-slate-100"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="hover:bg-slate-100"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;


// 2 

import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Define columns for the device table
  const columns = [
    {
      accessorKey: "deviceNameOrId",
      header: "Device Name/ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("deviceNameOrId")}</div>,
    },
    {
      accessorKey: "deviceMacAddress",
      header: "MAC Address",
      cell: ({ row }) => <div className="text-gray-800">{row.getValue("deviceMacAddress")}</div>,
    },
    {
      accessorKey: "patient_count",
      header: "Patients",
      cell: ({ row }) => (
        <Badge variant={row.getValue("patient_count") > 0 ? "default" : "secondary"}>
          {row.getValue("patient_count")}
        </Badge>
      ),
    },
    {
      accessorKey: "patientTest_count",
      header: "Tests",
      cell: ({ row }) => (
        <Badge variant={row.getValue("patientTest_count") > 0 ? "default" : "secondary"}>
          {row.getValue("patientTest_count")}
        </Badge>
      ),
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: dashboardData?.totalDeviceCount || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
      <div className="w-full p-4 space-y-3">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center pb-1">
          <h2 className="text-lg font-medium text-slate-800">Dashboard Overview</h2>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="text-sm h-8 bg-white hover:bg-slate-50"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh Data
              </>
            )}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="shadow-sm border-t-2 border-t-blue-400 transition-all duration-200 hover:shadow">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-slate-600 flex justify-between items-center">
                <span>Total Devices</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-3 w-3 text-blue-400"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4 pb-3">
              {isRefreshing ? (
                <Skeleton className="h-7 w-12 mb-1" />
              ) : (
                <div className="text-xl font-semibold text-slate-800">{dashboardData?.totalDevice}</div>
              )}
              <p className="text-sm text-slate-500">Registered devices</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-t-2 border-t-indigo-400 transition-all duration-200 hover:shadow">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-slate-600 flex justify-between items-center">
                <span>Total Patients</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-3 w-3 text-indigo-400"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4 pb-3">
              {isRefreshing ? (
                <Skeleton className="h-7 w-12 mb-1" />
              ) : (
                <div className="text-xl font-semibold text-slate-800">{dashboardData?.totalPatient}</div>
              )}
              <p className="text-sm text-slate-500">Registered patients</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-t-2 border-t-emerald-400 transition-all duration-200 hover:shadow">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-slate-600 flex justify-between items-center">
                <span>Total Tests</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-3 w-3 text-emerald-400"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4 pb-3">
              {isRefreshing ? (
                <Skeleton className="h-7 w-12 mb-1" />
              ) : (
                <div className="text-xl font-semibold text-slate-800">{dashboardData?.totalPatientTest}</div>
              )}
              <p className="text-sm text-slate-500">Tests conducted</p>
            </CardContent>
          </Card>
        </div>

        {/* Device Table */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700">Device Statistics</CardTitle>
              {!isRefreshing && (
                <div className="text-sm text-slate-500">
                  Updated: {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex items-center py-2 gap-2 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
                <Input
                  placeholder="Search devices..."
                  value={table.getState().globalFilter || ""}
                  onChange={(event) => table.setGlobalFilter(event.target.value)}
                  className="pl-7 h-8 text-sm"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-sm bg-white">
                    Columns <ChevronDown className="ml-1 h-3 w-3" />
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
            
            <div className="rounded border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-slate-50">
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="text-sm font-medium text-slate-600 h-8 py-0">
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
                  {isRefreshing ? (
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={index} className="h-10">
                        {Array(4).fill(0).map((_, cellIndex) => (
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
                        className="h-10 text-sm hover:bg-slate-50"
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
                        className="h-20 text-center text-sm text-slate-500"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-end space-x-2 py-3">
              <div className="flex-1 text-sm text-slate-500">
                Showing {table.getRowModel().rows.length} of{" "}
                {dashboardData?.totalDeviceCount?.length} devices
              </div>
              <div className="space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-7 text-sm bg-white"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-7 text-sm bg-white"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;


// 3

import React from 'react';
import { useQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { Base_Url } from "@/config/BaseUrl";
import { toast } from "sonner";

const Dashboard = () => {
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

  // Define columns for the device table
  const columns = [
    {
      accessorKey: "deviceNameOrId",
      header: "Device Name/ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("deviceNameOrId")}</div>,
    },
    {
      accessorKey: "deviceMacAddress",
      header: "MAC Address",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("deviceMacAddress")}</div>,
    },
    {
      accessorKey: "patient_count",
      header: "Patients",
      cell: ({ row }) => (
        <Badge variant={row.getValue("patient_count") > 0 ? "default" : "secondary"}>
          {row.getValue("patient_count")}
        </Badge>
      ),
    },
    {
      accessorKey: "patientTest_count",
      header: "Tests",
      cell: ({ row }) => (
        <Badge variant={row.getValue("patientTest_count") > 0 ? "default" : "secondary"}>
          {row.getValue("patientTest_count")}
        </Badge>
      ),
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: dashboardData?.totalDeviceCount || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading Dashboard Data
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
              Error Fetching Dashboard Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Devices
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalDevice}</div>
              <p className="text-xs text-muted-foreground">
                All registered devices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalPatient}</div>
              <p className="text-xs text-muted-foreground">
                All registered patients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tests
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalPatientTest}</div>
              <p className="text-xs text-muted-foreground">
                All tests conducted
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Device Table */}
        <Card>
          <CardHeader>
            <CardTitle>Device Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center py-4">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices..."
                  value={table.getState().globalFilter || ""}
                  onChange={(event) => table.setGlobalFilter(event.target.value)}
                  className="pl-8"
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
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
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
            
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} of{" "}
                {dashboardData?.totalDeviceCount?.length} devices
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;

//sajid 

//4


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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import { Base_Url } from "@/config/BaseUrl";
import { toast } from "sonner";

const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("today");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["dashboard", timeRange],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-dashboard?timeRange=${timeRange}`,
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
      await queryClient.invalidateQueries(["dashboard", timeRange]);
      toast.success("Dashboard data refreshed");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Calculate growth percentages (mocked for demo)
  const growthData = {
    devices: 12.5,
    patients: 8.3,
    tests: 15.9
  };

  // Mock data for device activity chart
  const mockDeviceActivityData = [
    { day: "Mon", count: 12 },
    { day: "Tue", count: 18 },
    { day: "Wed", count: 15 },
    { day: "Thu", count: 22 },
    { day: "Fri", count: 28 },
    { day: "Sat", count: 16 },
    { day: "Sun", count: 11 },
  ];

  // Mock data for test distribution
  const mockTestTypeDistribution = [
    { name: "ECG", value: 45 },
    { name: "Blood Pressure", value: 30 },
    { name: "Glucose", value: 15 },
    { name: "Other", value: 10 },
  ];

  // Define columns for the device table
  const columns = [
    {
      accessorKey: "deviceNameOrId",
      header: "Device Name/ID",
      cell: ({ row }) => (
        <div className="font-medium text-slate-800 flex items-center">
          <Laptop className="h-3 w-3 mr-2 text-slate-400" />
          {row.getValue("deviceNameOrId")}
        </div>
      ),
    },
    {
      accessorKey: "deviceMacAddress",
      header: "MAC Address",
      cell: ({ row }) => (
        <div className="text-slate-600 font-mono text-xs">
          {row.getValue("deviceMacAddress")}
        </div>
      ),
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({ row }) => {
        // Mock data - would come from API in real implementation
        const lastActive = new Date(Date.now() - Math.random() * 86400000 * 5);
        const isRecent = Date.now() - lastActive.getTime() < 86400000; // 24 hours
        
        return (
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isRecent ? 'bg-green-500' : 'bg-orange-300'}`}></div>
            <span className="text-slate-600 text-sm">
              {lastActive.toLocaleString('en-US', { 
                hour: 'numeric', 
                minute: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "patient_count",
      header: "Patients",
      cell: ({ row }) => (
        <Badge variant={row.getValue("patient_count") > 0 ? "default" : "secondary"} className="font-normal">
          {row.getValue("patient_count")}
        </Badge>
      ),
    },
    {
      accessorKey: "patientTest_count",
      header: "Tests",
      cell: ({ row }) => (
        <Badge variant={row.getValue("patientTest_count") > 0 ? "default" : "outline"} className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100">
          {row.getValue("patientTest_count")}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Info className="h-3.5 w-3.5" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Activity className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Device Activity</DialogTitle>
                <DialogDescription>
                  Recent activity for this device
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-3 border-b pb-3">
                      <div className="bg-blue-50 p-1 rounded-full">
                        <Activity className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Test #{Math.floor(Math.random() * 1000)} completed</div>
                        <div className="text-xs text-slate-500">
                          {new Date(Date.now() - Math.random() * 86400000 * i).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: dashboardData?.totalDeviceCount || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  // Format Statistics
  const formatStatChange = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

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
      <div className="w-full p-4 space-y-4">
        {/* Dashboard Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Dashboard Overview</h2>
            <p className="text-sm text-slate-500">Summary of your medical devices and patient data</p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 h-9 text-sm bg-white">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
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
                Total Devices
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      growthData.devices > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {formatStatChange(growthData.devices)}
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Change since last {timeRange}</p>
                  </TooltipContent>
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
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      growthData.patients > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {formatStatChange(growthData.patients)}
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Change since last {timeRange}</p>
                  </TooltipContent>
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
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      growthData.tests > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {formatStatChange(growthData.tests)}
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Change since last {timeRange}</p>
                  </TooltipContent>
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

        {/* Data Visualization Tabs */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="activity" className="text-xs">Activity Overview</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">Device Performance</TabsTrigger>
            <TabsTrigger value="distribution" className="text-xs">Test Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity">
            <Card className="shadow-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium text-slate-700">Weekly Device Activity</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <div className="h-64 flex items-end justify-between gap-2">
                  {mockDeviceActivityData.map((day) => (
                    <div key={day.day} className="flex flex-col items-center w-full">
                      <div 
                        className="w-full bg-blue-100 hover:bg-blue-200 transition-all rounded-t"
                        style={{ height: `${day.count * 2}px` }}
                      ></div>
                      <div className="text-xs text-slate-500 mt-2">{day.day}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card className="shadow-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium text-slate-700">Device Performance</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-2">Response Time (ms)</h3>
                    <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0ms</span>
                      <span>500ms</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-2">Uptime</h3>
                    <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-2">Battery Status</h3>
                    <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="distribution">
            <Card className="shadow-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium text-slate-700">Test Type Distribution</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="h-48 w-48 relative rounded-full overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center shadow-inner">
                        <span className="text-lg font-bold text-slate-800">{dashboardData?.totalPatientTest || 0}</span>
                      </div>
                    </div>
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="transparent" stroke="#4ade80" strokeWidth="20" 
                        strokeDasharray={`${mockTestTypeDistribution[0].value} ${100 - mockTestTypeDistribution[0].value}`} 
                        strokeDashoffset="25" 
                      />
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="transparent" stroke="#60a5fa" strokeWidth="20" 
                        strokeDasharray={`${mockTestTypeDistribution[1].value} ${100 - mockTestTypeDistribution[1].value}`} 
                        strokeDashoffset={`${100 - mockTestTypeDistribution[0].value + 25}`} 
                      />
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="transparent" stroke="#f59e0b" strokeWidth="20" 
                        strokeDasharray={`${mockTestTypeDistribution[2].value} ${100 - mockTestTypeDistribution[2].value}`} 
                        strokeDashoffset={`${100 - mockTestTypeDistribution[0].value - mockTestTypeDistribution[1].value + 25}`} 
                      />
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="transparent" stroke="#a78bfa" strokeWidth="20" 
                        strokeDasharray={`${mockTestTypeDistribution[3].value} ${100 - mockTestTypeDistribution[3].value}`} 
                        strokeDashoffset={`${100 - mockTestTypeDistribution[0].value - mockTestTypeDistribution[1].value - mockTestTypeDistribution[2].value + 25}`} 
                      />
                    </svg>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {mockTestTypeDistribution.map((item, index) => {
                      const colors = ["bg-green-400", "bg-blue-400", "bg-amber-400", "bg-purple-400"];
                      return (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`h-3 w-3 rounded-full ${colors[index]} mr-2`}></div>
                            <span className="text-sm text-slate-700">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{item.value}%</span>
                            <span className="text-xs text-slate-500">({Math.round(item.value * dashboardData?.totalPatientTest / 100)} tests)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Device Table */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
                <Laptop className="h-4 w-4 mr-2 text-slate-500" />
                Device Statistics
              </CardTitle>
              {!isRefreshing && (
                <div className="text-sm text-slate-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date().toLocaleDateString()} 
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between py-2 gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search devices..."
                  value={table.getState().globalFilter || ""}
                  onChange={(event) => table.setGlobalFilter(event.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 text-sm bg-white flex-shrink-0"
                  onClick={() => setFilterVisible(!filterVisible)}
                >
                  {filterVisible ? (
                    <>
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <Filter className="h-3.5 w-3.5 mr-1.5" />
                      Filter
                    </>
                  )}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 text-sm bg-white flex-shrink-0">Columns <ChevronDown className="ml-1 h-3.5 w-3.5" />
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
                
                <Button variant="default" size="sm" className="h-9 text-sm bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                  Export Data
                </Button>
              </div>
            </div>
            
            {/* Filter options - conditionally rendered */}
            {filterVisible && (
              <div className="bg-slate-50 p-3 mb-3 rounded-lg border flex flex-wrap gap-3">
                <div className="w-full md:w-auto">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Device Type</label>
                  <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                    <SelectTrigger className="h-8 text-xs w-full md:w-40 bg-white">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="ecg">ECG Monitor</SelectItem>
                      <SelectItem value="bp">Blood Pressure</SelectItem>
                      <SelectItem value="glucose">Glucose Monitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-auto">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-8 text-xs w-full md:w-40 bg-white">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-auto">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date Range</label>
                  <div className="flex items-center h-8 px-3 bg-white border rounded-md text-xs w-full md:w-auto">
                    <Calendar className="h-3 w-3 mr-2 text-slate-500" />
                    <span>Last 30 days</span>
                  </div>
                </div>
                
                <div className="w-full md:w-auto mt-auto">
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-white">
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
            
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
                        {Array(6).fill(0).map((_, cellIndex) => (
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
                          No devices matching your filters were found.
                          <Button variant="link" size="sm" onClick={() => table.setGlobalFilter("")}>
                            Clear search
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
              <div className="flex items-center text-xs text-slate-500">
                Showing page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()} ({dashboardData?.totalDeviceCount?.length || 0} total devices)
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0 text-sm bg-white"
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <ChevronLeft className="h-3.5 w-3.5 -ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 text-sm bg-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center text-xs">
                  {Array.from({ length: Math.min(5, Math.max(table.getPageCount(), 1)) }, (_, i) => {
                    const pageIndex = i;
                    const isCurrentPage = pageIndex === table.getState().pagination.pageIndex;
                    
                    return (
                      <Button
                        key={i}
                        variant={isCurrentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => table.setPageIndex(pageIndex)}
                        className={`h-8 w-8 p-0 ${isCurrentPage ? "bg-blue-600" : "bg-white"}`}
                      >
                        {pageIndex + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 text-sm bg-white"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0 text-sm bg-white"
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <ChevronRight className="h-3.5 w-3.5 -ml-2" />
                </Button>
              </div>
              
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 text-xs w-24 bg-white">
                  <SelectValue placeholder="Show" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 30, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      Show {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                Latest Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center border-b pb-2 last:border-b-0 last:pb-0">
                    <div className={`h-2 w-2 rounded-full mr-2 ${['bg-green-500', 'bg-blue-500', 'bg-amber-500'][i-1]}`}></div>
                    <div className="flex-1 truncate">
                      <div className="text-xs font-medium text-slate-800">Device {['ECG-001', 'BP-Monitor-5', 'GLU-2'][i-1]} activity</div>
                      <div className="text-xs text-slate-500">{Math.floor(Math.random() * 60)} minutes ago</div>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs px-1">
                      {['Test', 'Calibration', 'Sync'][i-1]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
                <PieChart className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="text-slate-600">Server Uptime</div>
                  <div className="font-medium">99.9%</div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "99.9%" }}></div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="text-slate-600">Database Status</div>
                  <div className="font-medium">Good</div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "95%" }}></div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="text-slate-600">API Response Time</div>
                  <div className="font-medium">124ms</div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-3">
                {[
                  {
                    title: "System Maintenance",
                    date: "Tomorrow, 2:00 AM",
                    status: "scheduled"
                  },
                  {
                    title: "Quarterly Data Backup",
                    date: "May 5, 2025",
                    status: "pending"
                  },
                  {
                    title: "New Device Update",
                    date: "May 12, 2025",
                    status: "pending"
                  }
                ].map((event, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`h-8 w-1 rounded-full mr-3 ${
                      event.status === 'scheduled' ? 'bg-amber-400' : 'bg-slate-200'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-800">{event.title}</div>
                      <div className="text-xs text-slate-500">{event.date}</div>
                    </div>
                    <Badge variant={event.status === 'scheduled' ? "outline" : "secondary"} className="ml-2 text-xs">
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
