import React, { useState, useEffect } from "react";
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
  Laptop,
  ChevronLeft,
  ChevronRight,
  Clock,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Layout from "@/components/Layout";
import { Base_Url } from "@/config/BaseUrl";
import { toast } from "sonner";
import moment from "moment";
import { getNavbarColors } from "@/components/buttonColors/ButtonColors";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DeviceUser = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
const userPosition = localStorage.getItem("user_position");

    const colors = getNavbarColors(userPosition);
  const queryClient = useQueryClient();

  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
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
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries(["dashboard"]);
      toast.success("Device Assigned data refreshed");
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
      id: "Device Name/ID",
      header: "Device Name/ID",
      cell: ({ row }) => (
        <div className="font-medium text-slate-800 flex items-center">
          <Laptop className="h-3 w-3 mr-2 text-slate-400" />
          {row.getValue("Device Name/ID")}
        </div>
      ),
    },
    {
      accessorKey: "deviceMacAddress",
      id: "MAC Address",
      header: "MAC Address",
      cell: ({ row }) => (
        <div className="text-slate-600 font-mono text-xs">
          {row.getValue("MAC Address")}
        </div>
      ),
    },

    {
      accessorKey: "devicelatestdate",
      id: "Last Sync",
      header: "Last Sync",
      cell: ({ row }) => {
        const value = row.getValue("Last Sync");
        const formatted = value
          ? moment(value, "YYYY-MM-DD HH:mm:ss").format("DD MMM YYYY, HH:mm A")
          : "-";
        return (
          <div className="text-slate-600 font-mono text-xs">{formatted}</div>
        );
      },
    },

    {
      accessorKey: "patient_count",
      id: "Patients",
      header: "Patients",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("Patients") > 0 ? "default" : "secondary"}
          className="font-normal"
        >
          {row.getValue("Patients")}
        </Badge>
      ),
    },
    {
      accessorKey: "patientTest_count",
      id: "Tests",
      header: "Tests",
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue("Tests") > 0 ? "default" : "outline"
          }
          className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100"
        >
          {row.getValue("Tests")}
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
            <h2 className="text-xl font-semibold text-slate-800">
              Dashboard Overview
            </h2>
            <Button disabled variant="outline" size="sm" className="text-sm">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading...
            </Button>
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
              <CardTitle className="text-red-500 text-sm">
                Error Fetching Dashboard Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="text-sm"
              >
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
            <h2 className="text-xl font-semibold text-slate-800">
              Device Assigned List
            </h2>
          </div>

          <div className="flex gap-2 flex-wrap">
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleRefresh} 
                    variant="outline" 
                    size="sm"
                    className={`h-9 px-3 text-sm ${colors.buttonBg} ${colors.buttonHover} text-white`}
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
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex items-center text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Last updated: {moment(new Date()).format("D MMM YYYY, h:mm A")}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          
          </div>
        </div>

  
            <div className="flex flex-col md:flex-row items-center justify-between py-1 gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search devices..."
                  value={table.getState().globalFilter || ""}
                  onChange={(event) =>
                    table.setGlobalFilter(event.target.value)
                  }
                  className="pl-8 h-9 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-sm bg-white flex-shrink-0"
                    >
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
                    <TableRow
                      key={headerGroup.id}
                      className={` ${colors.cardHeaderBg}  ${colors.cardHeaderText} `}
                    >
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
                                asc: (
                                  <ChevronDown className="ml-1 h-3 w-3 rotate-180" />
                                ),
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
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={index} className="h-11">
                          {Array(6)
                            .fill(0)
                            .map((_, cellIndex) => (
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
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => table.setGlobalFilter("")}
                          >
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
              {/* <div className="flex items-center text-xs text-slate-500">
                Showing page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()} (
                {dashboardData?.totalDeviceCount?.length || 0} total devices)
              </div> */}
              <div className="flex items-center text-xs text-slate-500">
  Showing page {table.getState().pagination.pageIndex + 1} of{" "}
  {table.getPageCount()} (
  {table.getFilteredRowModel().rows.length || 0}  Devices)
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
                  {Array.from(
                    { length: Math.min(5, Math.max(table.getPageCount(), 1)) },
                    (_, i) => {
                      const pageIndex = i;
                      const isCurrentPage =
                        pageIndex === table.getState().pagination.pageIndex;

                      return (
                        <Button
                          key={i}
                          variant={isCurrentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => table.setPageIndex(pageIndex)}
                          className={`h-8 w-8 p-0 ${
                            isCurrentPage ? "bg-blue-600" : "bg-white"
                          }`}
                        >
                          {pageIndex + 1}
                        </Button>
                      );
                    }
                  )}
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
        
      </div>
    </Layout>
  );
};

export default DeviceUser;
