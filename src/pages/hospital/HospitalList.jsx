import React, { useState } from "react";

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
  ChevronDown,
  Eye,
  Loader2,
  RefreshCw,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useNavigate } from "react-router-dom";

import Layout from "@/components/Layout";

import { Base_Url } from "@/config/BaseUrl";
import { cn } from "@/lib/utils";
import CreateHospital from "./CreateHospital";
import EditHospital from "./EditHospital";
import HospitalToggle from "@/components/statusToggle/HospitalToggle";
import moment from "moment";
import { getNavbarColors } from "@/components/buttonColors/ButtonColors";


const HospitalList = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
  const userPosition = localStorage.getItem("user_position");
  const colors = getNavbarColors(userPosition);
    const {
      data: hospital,
      isLoading,
      isError,
      refetch,
      dataUpdatedAt,
    } = useQuery({
      queryKey: ["hospital"],
      queryFn: async () => {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${Base_Url}/api/panel-fetch-hospital-list`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response?.data?.hospital;
      },
    });
  
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const navigate = useNavigate();
  
    // Define columns for the table
    const columns = [
      {
        accessorKey: "hospitalName",
        id: "Hospital Name",
        header: "Hospital Name",
        cell: ({ row }) => <div>{row.getValue("Hospital Name")}</div>,
      },
    
      {
        accessorKey: "hospitalMobile",
        id: "Mobile",
        header: "Mobile",
        cell: ({ row }) => <div>{row.getValue("Mobile")}</div>,
      },
      {
        accessorKey: "hospitalEmail",
        id: "Email",
        header: "Email",
        cell: ({ row }) => {
          const email = row.getValue("Email")
          return (
            <span className="block  max-w-[200px] break-words">
        {email}
      </span>
          )
        },
      },
      {
        accessorKey: "hospitalArea",
        id: "Area",
        header: "Area",
        cell: ({ row }) => <div>{row.getValue("Area")}</div>,
      },
      {
        accessorKey: "hospitalCreationDate",
        id: "Creation Date",
        header: "Creation Date",
        cell: ({ row }) => <div>{moment(row.getValue("Creation Date")).format("DD MMM YYYY")}</div>,
      },
      // {
      //   accessorKey: "hospitalStatus",
      //   header: "Status",
      //   cell: ({ row }) => {
      //     const status = row.getValue("hospitalStatus");
  
      //     return (
      //       <div className="flex items-center gap-2">
      //         <span
      //           className={cn(
      //             "px-2 py-1 rounded-full text-xs",
      //             status === "Active"
      //               ? "bg-green-100 text-green-800"
      //               : status === "Inactive"
      //               ? "bg-yellow-100 text-yellow-800"
      //               : "bg-red-100 text-red-800"
      //           )}
      //         >
      //           {status}
      //         </span>
      //       </div>
      //     );
      //   },
      // },
      {
            accessorKey: "hospitalStatus",
            id: "Status",
            header: "Status",
            cell: ({ row }) => {
              const status = row.getValue("Status");
              const hospitalId = row.original.id;
      
              return (
                <HospitalToggle
                  initialStatus={status}
                  hospitalId={hospitalId}
                  onStatusChange={() => {
                    refetch();
                  }}
                />
              );
            },
          },
      {
        accessorKey: "id",
        id: "Action",
        header: "Action",
        cell: ({ row }) => {
          
          const rowId = row.original.id;
  
          return (
            <>
            <EditHospital userId={rowId}/>     
               <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate(`/hospital/assign-device/${rowId}`)
                    }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Device Assign List</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            </>
          );
        },
      },
    ];
  
    // Create the table instance
    const table = useReactTable({
      data: hospital || [],
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
              Loading Hospital List Data
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
                Error Fetching Hospital List Data
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
        <div className="w-full p-4 ">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl text-gray-800">Hospital List</h1>
          {/* <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1">
                    <span>
                      Last updated:{" "}
                      {new Date(dataUpdatedAt).toLocaleTimeString()}
                    </span>
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
          </div> */}
        </div>
        {/* searching and column filter  */}
        <div className="flex items-center py-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search hospital..."
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
          <CreateHospital />
        </div>
        {/* table  */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}     className={` ${colors.cardHeaderBg}  ${colors.cardHeaderText} `}>
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
        {/* row slection and pagintaion button  */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Total Hospitals : &nbsp;
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
  )
}

export default HospitalList