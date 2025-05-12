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
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, ChevronDown, ExternalLink, Loader2, Search, SquarePlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";





import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Base_Url } from "@/config/BaseUrl";
import Layout from "@/components/Layout";

import TeamStatusToggle from "@/components/statusToggle/TeamStatusToggle";
import CreateTeam from "./CreateTeam";
import EditTeam from "./EditTeam";

const TeamList = () => {
  
  const {
    data: teams,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Base_Url}/api/panel-fetch-team-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.team;
    },
  });

  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();
  const handleOpenDashboard = (userId) => {
    window.open(`/management-dashboard/${userId}`, "_blank");
  };
  // Define columns for the table
  const columns = [
    {
      id: "sl_no",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   cell: ({ row }) => <div>{row.getValue("id")}</div>,
    // },
    {
      accessorKey: "company_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Company Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("company_name")}</div>,
    },
    {
      accessorKey: "hospital_names",
      header: "Hospital",
      cell: ({ row }) => {
        const hospitals = row.getValue("hospital_names")?.split(",") || [];
        return (
          <div className="flex flex-wrap gap-1">
          {hospitals.map((name, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
            >
              {name.trim()}
            
            </span>
          ))}
        </div>
        
        );
      },
    },
    
  
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "user_type",
      header: "User Type",
      cell: ({ row }) => <div>{row.getValue("user_type")}</div>,
    },
    {
      accessorKey: "user_position",
      header: "User Position",
      cell: ({ row }) => <div>{row.getValue("user_position")}</div>,
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const teamId = row.original.id;

        return (
          <TeamStatusToggle
            initialStatus={status}
            teamId={teamId}
            onStatusChange={() => {
              refetch();
            }}
          />
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const teamId = row.original.id;

        return (
          <div className="flex flex-row">
            <EditTeam teamId={teamId} />
            <button
              onClick={() => handleOpenDashboard(teamId)}
              className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Dashboard
            </button>
          </div>
        );
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: teams || [],
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

  // Render loading state
  if (isLoading) {
    return (
        <Layout>
          <div className="flex justify-center items-center h-full">
            <Button disabled>
              <Loader2 className=" h-4 w-4 animate-spin" />
              Loading Team List Data
            </Button>
          </div>
        </Layout>
      );
  }

  // Render error state
  if (isError) {
    <Layout>
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-destructive">
          Error Fetching Team List Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </CardContent>
    </Card>
  </Layout>
  }

  return (
    <Layout>
        <div className="w-full p-4">
      <div className="flex text-left text-2xl text-gray-800 font-[400]">
        Team List
      </div>

      {/* searching and column filter  */}
      <div className="flex items-center py-4">
       
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search team..."
            value={table.getState().globalFilter || ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto ">
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

        <CreateTeam />
        {/* <Button
          onClick={() => navigate("/page-management")}
          className={`ml-2 `}
        >
          <SquarePlus className="h-4 w-4" /> Page
        </Button>
        <Button
          onClick={() => navigate("/button-management")}
          className={`ml-2 `}
        >
           <SquarePlus className="h-4 w-4" /> Button
        </Button> */}
      </div>
      {/* table  */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className=""
                    >
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
          Total Team : &nbsp;
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

export default TeamList;
