"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "./table";
import { Button } from "./button";
import { Input } from "./input";

interface DataTableProps {
    data: Record<string, any>[];
    itemsPerPage?: number;
}

export function DataTable({ data, itemsPerPage = 5 }: DataTableProps) {
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedFilters, setSelectedFilters] = React.useState<Record<string, string>>({});

    const filteredData = React.useMemo(() => {
        return data.filter(row => 
            Object.entries(selectedFilters).every(([key, value]) => 
                value ? String(row[key]).toLowerCase() === value.toLowerCase() : true
            ) &&
            (!searchTerm || Object.values(row).some(value => 
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            ))
        );
    }, [data, searchTerm, selectedFilters]);

    const columns = React.useMemo<ColumnDef<Record<string, any>>[]>(() => {
        if (filteredData.length === 0) return [];
        return Object.keys(filteredData[0]).map(key => ({
            accessorKey: key,
            header: key,
            cell: (info: any) => (
                <span 
                    className="cursor-pointer text-blue-500 underline" 
                    onClick={() => setSelectedFilters(prev => ({ ...prev, [key]: info.getValue() }))}
                >
                    {info.getValue()}
                </span>
            ),
        }));
    }, [filteredData]);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        initialState: { pagination: { pageSize: itemsPerPage } },
        state: { columnVisibility },
    });

    return (
        <div className="overflow-x-auto w-4/5">
            <Input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSearchTerm(e.target.value)} 
                className="mb-4 p-2 border rounded"
            />
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedFilters({})} 
                className="ml-2"
            >
                Reset Filters
            </Button>
            <div className="rounded-md border mt-4">
                <Table>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableCell key={header.id}>
                                        {typeof header.column.columnDef.header === 'function'
                                            ? header.column.columnDef.header(header.getContext())
                                            : header.column.columnDef.header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </thead>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
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
    );
}
