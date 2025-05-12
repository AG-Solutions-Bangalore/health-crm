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
import { ChevronDown, Loader2, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
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
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useSelector } from "react-redux";
import { Base_Url } from "@/config/BaseUrl";
import {
  PatientHistory,
  PatientReport,
} from "@/components/buttonIndex/ButtonComponents";
import { toast } from "sonner";
import moment from "moment";

const PatientList = () => {
  const { selectedDevice } = useSelector((state) => state.device);
  const deviceId = selectedDevice?.macid;
  const lastSync = selectedDevice?.lastSync;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusUpdateState, setStatusUpdateState] = useState({
    open: false,
    patientId: null,
    selectedStatus: "",
    currentStatus: "",
  });
  const {
    data: patient,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["patient", deviceId],
    queryFn: async () => {
      if (!deviceId) {
        return [];
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-patient-by-mackid/${deviceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.patient;
      // return response.data.patient.reverse();
    },
    enabled: !!deviceId && !!lastSync,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ patientId, newStatus }) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${Base_Url}/api/panel-update-patient-status/${patientId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (response) => {
      refetch();
      toast.success(response?.msg || "Status updated successfully");
      setStatusUpdateState((prev) => ({
        ...prev,
        open: false,
        patientId: null,
        selectedStatus: "",
        currentStatus: "",
      }));
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error("Error updating status ");
    },
  });

  const handleStatusUpdate = () => {
    if (statusUpdateState.selectedStatus !== statusUpdateState.currentStatus) {
      updateStatus({
        patientId: statusUpdateState.patientId,
        newStatus: statusUpdateState.selectedStatus,
      });
    }
  };

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();

  // Define columns for the table
  const columns = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },

    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => {
        const firstName = row.original.firstName;
        const lastName = row.original.lastName;
        return (
          <div>
            {firstName} {lastName}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const patientId = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2 py-1 rounded-full text-xs",
                status === "Active"
                  ? "bg-green-100 text-green-800"
                  : status === "Inactive"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {status}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {["Active", "Inactive", "Delete"].map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option}
                    checked={status === option}
                    onCheckedChange={() => {
                      if (status !== option) {
                        updateStatus({
                          patientId,
                          newStatus: option,
                        });
                      }
                    }}
                    className="capitalize"
                  >
                    {option}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },


    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const patientId = row.original.patientID;
        const firstName = row.original.firstName;
        const lastName = row.original.lastName;
        const sex = row.original.sex;
        const city = row.original.city;
        const email = row.original.email;
        const address1 = row.original.address1;
        const dob = row.original.dob;
        const cellNumber = row.original.cellNumber;

        return (
          <div className="flex flex-row">
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate(`/patient/history/${patientId}`, {
                        state: { firstName, lastName },
                      })
                    }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Patient History</TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

            <PatientHistory
              onClick={() =>
                navigate(`/patient/history/${patientId}`, {
                  state: { firstName, lastName },
                })
              }
            />

            <PatientReport
              onClick={() =>
                navigate(`/patient/report/${patientId}`, {
                  state: {
                    firstName,
                    lastName,
                    sex,
                    city,
                    email,
                    address1,
                    dob,
                    cellNumber,
                  },
                })
              }
            />
          </div>
        );
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: patient || [],
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
            Loading Patient List Data
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
              Error Fetching Patient List Data
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
          <h1 className="text-2xl text-gray-800">Patient List</h1>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1">
              <span>
                Last Sync:{" "}
                {lastSync
                  ? moment(lastSync, "YYYY-MM-DD HH:mm:ss").format(
                      "DD-MM-YYYY HH:mm:ss"
                    )
                  : "-"}
              </span>
            </div>
          </div>
        </div>
        {/* searching and column filter  */}
        <div className="flex items-center py-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search patient..."
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
        {/* row slection and pagintaion button  */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Total Patients : &nbsp;
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

export default PatientList;
