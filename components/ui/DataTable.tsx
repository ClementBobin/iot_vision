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

    const tableData = React.useMemo(() => {
        return data.filter(row =>
            Object.entries(selectedFilters).every(([key, value]) =>
                value ? String(row[key]).toLowerCase() === value.toLowerCase() ||
                        (Array.isArray(row[key]) && row[key].some((item: any) => String(item).toLowerCase() === value.toLowerCase()))
                        : true
            ) &&
            (!searchTerm || Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            ))
        );
    }, [data, searchTerm, selectedFilters]);

    const groupedColumns = React.useMemo(() => {
        if (tableData.length === 0) return {};
        const columnGroups: Record<string, string[]> = {};
        tableData.forEach(row => {
            Object.keys(row).forEach(key => {
                if (!columnGroups[key]) columnGroups[key] = [];
                const values = Array.isArray(row[key]) ? row[key] : [row[key]];
                values.forEach(value => {
                    if (typeof value === "object" && value !== null) {
                        Object.values(value).forEach(subValue => {
                            if (!columnGroups[key].includes(String(subValue))) {
                                columnGroups[key].push(String(subValue));
                            }
                        });
                    } else {
                        if (!columnGroups[key].includes(String(value))) {
                            columnGroups[key].push(String(value));
                        }
                    }
                });
            });
        });
        return columnGroups;
    }, [tableData]);

    const handleFilter = (key: string, value: string) => {
        setSelectedFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="overflow-x-auto w-4/5">
            <Input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
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
            
            {Object.entries(groupedColumns).map(([key, values]) => (
                <div key={key} className="rounded-md border mt-4">
                    <h2 className="text-lg font-bold p-2">{key}</h2>
                    <Table>
                        <TableBody>
                            {values.map((value, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <span 
                                            className="cursor-pointer text-blue-500 underline" 
                                            onClick={() => handleFilter(key, value)}
                                        >
                                            {value}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ))}
        </div>
    );
}
