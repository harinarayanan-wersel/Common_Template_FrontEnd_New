import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    createColumnHelper,
    flexRender,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AirtableToolbar } from "./AirtableToolbar";
import { AirtableCell } from "./AirtableCell";
import { AirtableCardView } from "./AirtableCardView";
import { BulkActionBar } from "./BulkActionBar";
import { useDebounce } from "./hooks/useDebounce";

const columnHelper = createColumnHelper();

// Memoized row component to prevent unnecessary re-renders
const TableRow = React.memo(({ row, rowIndex, density, frozenColumns, getFrozenOffset }) => {
    const isEven = rowIndex % 2 === 0;

    return (
        <tr
            className={cn(
                "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                isEven ? "bg-white" : "bg-gray-50/30",
                row.getIsSelected() && "bg-blue-50",
                density === "compact" && "h-8",
                density === "standard" && "h-10",
                density === "comfortable" && "h-12"
            )}
        >
            {row.getVisibleCells().map((cell, cellIndex) => {
                const column = cell.column;
                const isFrozen = frozenColumns.includes(column.id) || column.id === "select";
                const frozenOffset = isFrozen ? getFrozenOffset(cellIndex) : 0;

                return (
                    <td
                        key={cell.id}
                        className={cn(
                            "px-3 py-2 text-sm border-r border-gray-100 last:border-r-0",
                            isFrozen && "sticky z-10 bg-inherit"
                        )}
                        style={{
                            width: column.getSize(),
                            left: isFrozen ? `${frozenOffset}px` : undefined,
                        }}
                    >
                        {flexRender(column.columnDef.cell, cell.getContext())}
                    </td>
                );
            })}
        </tr>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
        prevProps.row.id === nextProps.row.id &&
        prevProps.rowIndex === nextProps.rowIndex &&
        prevProps.density === nextProps.density &&
        prevProps.row.getIsSelected() === nextProps.row.getIsSelected() &&
        JSON.stringify(prevProps.frozenColumns) === JSON.stringify(nextProps.frozenColumns)
    );
});

TableRow.displayName = "TableRow";

// Pure filter function - extracted to prevent re-creation
const applyFilterLogic = (row, filter, columns) => {
    const column = columns.find((c) => c.id === filter.columnId);
    if (!column) return true;

    const value = row[column.accessorKey || column.id];
    const filterValue = filter.value;

    switch (filter.operator) {
        case "equals":
            return String(value).toLowerCase() === String(filterValue).toLowerCase();
        case "notEquals":
            return String(value).toLowerCase() !== String(filterValue).toLowerCase();
        case "contains":
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        case "notContains":
            return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        case "startsWith":
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
        case "endsWith":
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
        case "isEmpty":
            return !value || String(value).trim() === "";
        case "isNotEmpty":
            return value && String(value).trim() !== "";
        default:
            return true;
    }
};

// Pure sort function
const applySortLogic = (a, b, sorting, columns) => {
    for (const sort of sorting) {
        const column = columns.find((c) => c.id === sort.columnId);
        if (!column) continue;

        const aValue = a[column.accessorKey || column.id];
        const bValue = b[column.accessorKey || column.id];

        if (aValue === null || aValue === undefined) return sort.desc ? -1 : 1;
        if (bValue === null || bValue === undefined) return sort.desc ? 1 : -1;

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
            comparison = aValue.localeCompare(bValue);
        } else {
            comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }

        if (comparison !== 0) {
            return sort.desc ? -comparison : comparison;
        }
    }
    return 0;
};

export function AirtableDataTable({
    data = [],
    columns = [],
    onCellEdit,
    onRowDelete,
    onBulkAction,
    onExport,
    toolbarActions,
    mobileBreakpoint = 768,
    storageKey,
}) {
    const [isMobile, setIsMobile] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnSizing, setColumnSizing] = useState({});
    const [columnOrder, setColumnOrder] = useState([]);
    const [frozenColumns, setFrozenColumns] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [filters, setFilters] = useState([]);
    const [grouping, setGrouping] = useState([]);
    const [globalFilterInput, setGlobalFilterInput] = useState("");
    const [rowSelection, setRowSelection] = useState({});
    const [density, setDensity] = useState("standard");
    const [editingCell, setEditingCell] = useState(null);
    const [draggedColumn, setDraggedColumn] = useState(null);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [showSortPanel, setShowSortPanel] = useState(false);
    const [showGroupPanel, setShowGroupPanel] = useState(false);

    // Memoize columns to prevent re-creation loops
    // This ensures columns reference is stable unless the actual columns prop changes
    const stableColumns = useMemo(() => columns, [columns]);

    // Debounce global filter to prevent excessive filtering
    const globalFilter = useDebounce(globalFilterInput, 300);

    // Load preferences from localStorage - only once on mount
    useEffect(() => {
        if (storageKey && typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setColumnVisibility(parsed.columnVisibility || {});
                    setColumnSizing(parsed.columnSizing || {});
                    setColumnOrder(parsed.columnOrder || []);
                    setFrozenColumns(parsed.frozenColumns || []);
                    setDensity(parsed.density || "standard");
                }
            } catch (e) {
                console.error("Failed to load table preferences:", e);
            }
        }
    }, [storageKey]); // Only depend on storageKey

    // Save preferences to localStorage - debounced to prevent excessive writes
    const saveTimeoutRef = useRef(null);
    useEffect(() => {
        if (storageKey && typeof window !== "undefined") {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                try {
                    const toSave = {
                        columnVisibility,
                        columnSizing,
                        columnOrder,
                        frozenColumns,
                        density,
                    };
                    localStorage.setItem(storageKey, JSON.stringify(toSave));
                } catch (e) {
                    console.error("Failed to save table preferences:", e);
                }
            }, 500); // Debounce saves by 500ms
        }
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [columnVisibility, columnSizing, columnOrder, frozenColumns, density, storageKey]);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < mobileBreakpoint);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [mobileBreakpoint]);

    // Memoize column definitions - remove editingCell dependency to prevent constant recreation
    const tableColumns = useMemo(() => {
        const cols = [];

        // Selection column
        cols.push(
            columnHelper.display({
                id: "select",
                header: ({ table }) => (
                    <div className="flex items-center justify-center h-full">
                        <Checkbox
                            checked={table.getIsAllRowsSelected()}
                            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center h-full" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                        />
                    </div>
                ),
                enableSorting: false,
                enableResizing: false,
                size: 48,
                minSize: 48,
                maxSize: 48,
            })
        );

        // Data columns
        const orderedCols = columnOrder.length > 0
            ? [...stableColumns].sort((a, b) => {
                const aIndex = columnOrder.indexOf(a.id);
                const bIndex = columnOrder.indexOf(b.id);
                if (aIndex === -1 && bIndex === -1) return 0;
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
            })
            : stableColumns;

        orderedCols.forEach((col) => {
            if (columnVisibility[col.id] === false) return;

            cols.push(
                columnHelper.accessor(col.accessorKey || col.id, {
                    id: col.id,
                    header: col.label,
                    cell: (info) => {
                        const value = info.getValue();
                        const row = info.row.original;
                        const isEditing = editingCell?.rowId === info.row.id && editingCell?.columnId === col.id;

                        // Use custom cell renderer if provided
                        if (col.cellRenderer) {
                            return (
                                <div onClick={(e) => e.stopPropagation()}>
                                    {col.cellRenderer(value, row)}
                                </div>
                            );
                        }

                        return (
                            <AirtableCell
                                value={value}
                                row={row}
                                column={col}
                                isEditing={isEditing}
                                onStartEdit={() => setEditingCell({ rowId: info.row.id, columnId: col.id })}
                                onSave={(newValue) => {
                                    if (onCellEdit) {
                                        onCellEdit(row, col.id, newValue);
                                    }
                                    setEditingCell(null);
                                }}
                                onCancel={() => setEditingCell(null)}
                            />
                        );
                    },
                    enableSorting: col.sortable !== false,
                    enableResizing: col.resizable !== false,
                    size: columnSizing[col.id] || col.width || 150,
                    minSize: col.minWidth || 100,
                    maxSize: col.maxWidth || 500,
                })
            );
        });

        return cols;
    }, [stableColumns, columnOrder, columnVisibility, columnSizing, editingCell, onCellEdit]);

    // Apply filters to data - memoized with stable dependencies
    const filteredData = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];

        let result = [...data]; // Create copy to avoid mutating original

        // Apply global filter
        if (globalFilter && globalFilter.trim()) {
            const search = String(globalFilter).toLowerCase().trim();
            result = result.filter((row) => {
                if (!row) return false;
                return Object.values(row).some((value) => {
                    if (value === null || value === undefined) return false;
                    return String(value).toLowerCase().includes(search);
                });
            });
        }

        // Apply column filters
        if (filters && Array.isArray(filters) && filters.length > 0) {
            result = result.filter((row) => {
                return filters.every((filter) => {
                    if (!filter || !filter.columnId) return true;
                    return applyFilterLogic(row, filter, stableColumns);
                });
            });
        }

        return result;
    }, [data, globalFilter, filters, stableColumns]);

    // Apply sorting - memoized
    const sortedData = useMemo(() => {
        if (!filteredData || !Array.isArray(filteredData)) return [];
        if (!sorting || !Array.isArray(sorting) || sorting.length === 0) return filteredData;
        return [...filteredData].sort((a, b) => applySortLogic(a, b, sorting, stableColumns));
    }, [filteredData, sorting, stableColumns]);

    // Memoize table config to prevent recreation on every render
    // CRITICAL FIX: Memoizing the config object prevents TanStack from re-initializing
    // when UI-only state changes (like showFilterPanel). This was causing an infinite loop:
    // 1. Click filter button → showFilterPanel changes → component re-renders
    // 2. useReactTable called with new config object → TanStack re-initializes table
    // 3. During init, callbacks fire → state updates → another re-render → loop continues
    // By memoizing the config, the table only re-initializes when actual dependencies change.
    // Also removed columnFilters, globalFilter, and pagination from controlled state since
    // we handle filtering externally - this prevents TanStack from trying to manage state
    // we don't need it to control.
    const tableConfig = useMemo(
        () => ({
            data: sortedData || [],
            columns: tableColumns || [],
            state: {
                sorting: sorting || [],
                columnVisibility: columnVisibility || {},
                rowSelection: rowSelection || {},
                columnSizing: columnSizing || {},
                grouping: grouping || [],
            },
            onSortingChange: setSorting,
            onColumnVisibilityChange: setColumnVisibility,
            onRowSelectionChange: setRowSelection,
            onColumnSizingChange: setColumnSizing,
            onGroupingChange: setGrouping,
            getCoreRowModel: getCoreRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            enableRowSelection: true,
            enableColumnResizing: true,
            columnResizeMode: "onChange",
        }),
        [
            sortedData,
            tableColumns,
            sorting,
            columnVisibility,
            rowSelection,
            columnSizing,
            grouping,
        ]
    );

    // Initialize table - useReactTable must be called at top level (Rules of Hooks)
    // But config is memoized so table instance is stable
    const table = useReactTable(tableConfig);

    // Memoize handlers to prevent recreation
    const handleColumnDragStart = useCallback((columnId) => {
        setDraggedColumn(columnId);
    }, []);

    const handleColumnDragOver = useCallback((e, targetColumnId) => {
        e.preventDefault();
        if (draggedColumn && draggedColumn !== targetColumnId) {
            setColumnOrder((prevOrder) => {
                const newOrder = [...prevOrder];
                const draggedIndex = newOrder.indexOf(draggedColumn);
                const targetIndex = newOrder.indexOf(targetColumnId);

                if (draggedIndex !== -1 && targetIndex !== -1) {
                    newOrder.splice(draggedIndex, 1);
                    newOrder.splice(targetIndex, 0, draggedColumn);
                    return newOrder;
                }
                return prevOrder;
            });
        }
    }, [draggedColumn]);

    const handleColumnDragEnd = useCallback(() => {
        setDraggedColumn(null);
    }, []);

    // Memoize frozen offset calculation
    const getFrozenOffset = useCallback((columnIndex) => {
        if (columnIndex === 0) return 0;
        let offset = 0;
        const visibleColumns = table.getVisibleLeafColumns();
        for (let i = 0; i < columnIndex; i++) {
            const col = visibleColumns[i];
            if (col && (col.id === "select" || frozenColumns.includes(col.id))) {
                offset += col.getSize();
            }
        }
        return offset;
    }, [table, frozenColumns]);

    // Memoize handlers for filter/sort/group changes
    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const handleSortingChange = useCallback((newSorting) => {
        setSorting(newSorting);
    }, []);

    const handleGroupingChange = useCallback((newGrouping) => {
        setGrouping(newGrouping);
    }, []);

    const handleGlobalFilterChange = useCallback((value) => {
        setGlobalFilterInput(value);
    }, []);

    const handleColumnVisibilityChange = useCallback((newVisibility) => {
        setColumnVisibility(newVisibility);
    }, []);

    const handleDensityChange = useCallback((newDensity) => {
        setDensity(newDensity);
    }, []);

    const handleFrozenColumnsChange = useCallback((newFrozen) => {
        setFrozenColumns(newFrozen);
    }, []);

    // Memoize selected rows
    const selectedRows = useMemo(() => {
        return table.getSelectedRowModel().rows.map((r) => r.original);
    }, [table, rowSelection]);

    // Mobile card view
    if (isMobile) {
        return (
            <div className="space-y-4">
                <AirtableToolbar
                    table={table}
                    globalFilter={globalFilterInput}
                    onGlobalFilterChange={handleGlobalFilterChange}
                    sorting={sorting}
                    filters={filters}
                    grouping={grouping}
                    onSortingChange={handleSortingChange}
                    onFiltersChange={handleFiltersChange}
                    onGroupingChange={handleGroupingChange}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={handleColumnVisibilityChange}
                    density={density}
                    onDensityChange={handleDensityChange}
                    frozenColumns={frozenColumns}
                    onFrozenColumnsChange={handleFrozenColumnsChange}
                    showFilterPanel={showFilterPanel}
                    onShowFilterPanel={setShowFilterPanel}
                    showSortPanel={showSortPanel}
                    onShowSortPanel={setShowSortPanel}
                    showGroupPanel={showGroupPanel}
                    onShowGroupPanel={setShowGroupPanel}
                    onExport={onExport}
                    toolbarActions={toolbarActions}
                    columns={stableColumns}
                />
                <AirtableCardView
                    rows={table.getRowModel().rows}
                    columns={stableColumns}
                    onEdit={(row) => {
                        if (onCellEdit) {
                            const editableCol = stableColumns.find((c) => c.editable);
                            if (editableCol) {
                                setEditingCell({ rowId: row.id, columnId: editableCol.id });
                            }
                        }
                    }}
                    onDelete={onRowDelete}
                />
            </div>
        );
    }

    // Desktop grid view
    const visibleRows = table.getRowModel().rows;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {selectedRows.length === 0 && (
                <AirtableToolbar
                    table={table}
                    globalFilter={globalFilterInput}
                    onGlobalFilterChange={handleGlobalFilterChange}
                    sorting={sorting}
                    filters={filters}
                    grouping={grouping}
                    onSortingChange={handleSortingChange}
                    onFiltersChange={handleFiltersChange}
                    onGroupingChange={handleGroupingChange}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={handleColumnVisibilityChange}
                    density={density}
                    onDensityChange={handleDensityChange}
                    frozenColumns={frozenColumns}
                    onFrozenColumnsChange={handleFrozenColumnsChange}
                    showFilterPanel={showFilterPanel}
                    onShowFilterPanel={setShowFilterPanel}
                    showSortPanel={showSortPanel}
                    onShowSortPanel={setShowSortPanel}
                    showGroupPanel={showGroupPanel}
                    onShowGroupPanel={setShowGroupPanel}
                    onExport={onExport}
                    toolbarActions={toolbarActions}
                    columns={stableColumns}
                />
            )}

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedRows.length}
                selectedRows={selectedRows}
                onClearSelection={() => setRowSelection({})}
                onDelete={onRowDelete}
                onBulkAction={onBulkAction}
                onExport={onExport}
            />

            {/* Table Grid */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
                        {/* Sticky Header */}
                        <thead className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className={cn("h-10", density === "compact" && "h-8", density === "comfortable" && "h-12")}>
                                    {headerGroup.headers.map((header, idx) => {
                                        const column = header.column;
                                        const isFrozen = frozenColumns.includes(column.id) || column.id === "select";
                                        const frozenOffset = isFrozen ? getFrozenOffset(idx) : 0;
                                        const canSort = column.getCanSort();
                                        const sortDirection = column.getIsSorted();

                                        return (
                                            <th
                                                key={header.id}
                                                className={cn(
                                                    "px-3 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-r border-gray-200 last:border-r-0 relative",
                                                    canSort && "cursor-pointer hover:bg-gray-100",
                                                    isFrozen && "sticky z-30 bg-gray-50"
                                                )}
                                                style={{
                                                    width: header.getSize(),
                                                    left: isFrozen ? `${frozenOffset}px` : undefined,
                                                }}
                                                draggable={column.id !== "select"}
                                                onDragStart={() => column.id !== "select" && handleColumnDragStart(column.id)}
                                                onDragOver={(e) => column.id !== "select" && handleColumnDragOver(e, column.id)}
                                                onDragEnd={handleColumnDragEnd}
                                                onClick={() => canSort && column.toggleSorting()}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {flexRender(column.columnDef.header, header.getContext())}
                                                    {canSort && (
                                                        <span className="text-gray-400">
                                                            {sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : "⇅"}
                                                        </span>
                                                    )}
                                                </div>
                                                {column.getCanResize() && (
                                                    <div
                                                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            const startX = e.clientX;
                                                            const startWidth = column.getSize();

                                                            const handleMouseMove = (e) => {
                                                                const diff = e.clientX - startX;
                                                                const newWidth = Math.max(column.columnDef.minSize || 100, startWidth + diff);
                                                                column.setSize(newWidth);
                                                            };

                                                            const handleMouseUp = () => {
                                                                document.removeEventListener("mousemove", handleMouseMove);
                                                                document.removeEventListener("mouseup", handleMouseUp);
                                                            };

                                                            document.addEventListener("mousemove", handleMouseMove);
                                                            document.addEventListener("mouseup", handleMouseUp);
                                                        }}
                                                    />
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {visibleRows.map((row, rowIndex) => (
                                <TableRow
                                    key={row.id}
                                    row={row}
                                    rowIndex={rowIndex}
                                    density={density}
                                    frozenColumns={frozenColumns}
                                    getFrozenOffset={getFrozenOffset}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
