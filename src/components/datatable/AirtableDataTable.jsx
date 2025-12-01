import React, {
    useState,
    useMemo,
    useEffect,
    useCallback,
    useRef,
} from "react";
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
import { AirtablePagination } from "./AirtablePagination";
import { BulkActionBar } from "./BulkActionBar";
import { useDebounce } from "./hooks/useDebounce";
import { MoreVertical, ArrowUpDown, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columnHelper = createColumnHelper();

// Helper function to determine minimum column width based on column type
const getMinColumnWidth = (column) => {
    const id = column.id?.toLowerCase() || "";
    const accessorKey = column.accessorKey?.toLowerCase() || "";
    const label = column.label?.toLowerCase() || "";

    // ID columns
    if (id.includes("id") || accessorKey.includes("id") || label.includes("id")) {
        return 120;
    }
    // Name columns
    if (id.includes("name") || accessorKey.includes("name") || label.includes("name") ||
        id === "user" || accessorKey === "user") {
        return 200;
    }
    // Email columns
    if (id.includes("email") || accessorKey.includes("email") || label.includes("email")) {
        return 260;
    }
    // Status columns
    if (id.includes("status") || accessorKey.includes("status") || label.includes("status")) {
        return 150;
    }
    // Action columns
    if (id === "actions" || accessorKey === "actions") {
        return 120;
    }
    // Default
    return column.minWidth || 100;
};

// Memoized row component to prevent unnecessary re-renders
const TableRow = React.memo(
    ({ row, rowIndex, density, frozenColumns, getFrozenOffset, editingCell, columnOrder }) => {
        // Density-based row height and padding
        const rowHeightClass =
            density === "compact" ? "h-8" :
                density === "comfortable" ? "h-14" :
                    "h-12"; // standard

        const cellPaddingClass =
            density === "compact" ? "px-3 py-1.5" :
                density === "comfortable" ? "px-4 py-4" :
                    "px-4 py-3"; // standard

        return (
            <tr
                className={cn(
                    "border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150",
                    rowHeightClass,
                    row.getIsSelected() && "bg-blue-50"
                )}
            >
                {row.getVisibleCells().map((cell, cellIndex) => {
                    const column = cell.column;
                    const isFrozen =
                        frozenColumns.includes(column.id) || column.id === "select";
                    const frozenOffset = isFrozen ? getFrozenOffset(cellIndex) : 0;

                    return (
                        <td
                            key={cell.id}
                            className={cn(
                                "text-sm border-r border-gray-200 last:border-r-0",
                                cellPaddingClass,
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
    },
    (prevProps, nextProps) => {
        // Check if editing state changed for this row
        const prevEC = prevProps.editingCell;
        const nextEC = nextProps.editingCell;
        const rowId = prevProps.row.id;

        if (prevEC !== nextEC) {
            const wasEditingThisRow = prevEC?.rowId === rowId;
            const isEditingThisRow = nextEC?.rowId === rowId;

            // If this row was being edited or is now being edited, we must re-render
            if (wasEditingThisRow || isEditingThisRow) {
                return false;
            }
        }

        // Custom comparison function for React.memo
        return (
            prevProps.row.id === nextProps.row.id &&
            prevProps.rowIndex === nextProps.rowIndex &&
            prevProps.density === nextProps.density &&
            prevProps.row.getIsSelected() === nextProps.row.getIsSelected() &&
            prevProps.columnOrder === nextProps.columnOrder &&
            JSON.stringify(prevProps.frozenColumns) ===
            JSON.stringify(nextProps.frozenColumns)
        );
    }
);

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
            return String(value)
                .toLowerCase()
                .includes(String(filterValue).toLowerCase());
        case "notContains":
            return !String(value)
                .toLowerCase()
                .includes(String(filterValue).toLowerCase());
        case "startsWith":
            return String(value)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase());
        case "endsWith":
            return String(value)
                .toLowerCase()
                .endsWith(String(filterValue).toLowerCase());
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
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

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
                    setSorting(parsed.sorting || []);
                    setFilters(parsed.filters || []);
                    setGrouping(parsed.grouping || []);
                    setPagination(parsed.pagination || { pageIndex: 0, pageSize: 10 });
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
                        sorting,
                        filters,
                        grouping,
                        pagination,
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
    }, [
        columnVisibility,
        columnSizing,
        columnOrder,
        frozenColumns,
        density,
        sorting,
        filters,
        grouping,
        pagination,
        storageKey,
    ]);

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
                    <div className="w-12 flex items-center justify-center">
                        <Checkbox
                            checked={table.getIsAllRowsSelected()}
                            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div
                        className="w-12 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
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
        const orderedCols =
            columnOrder.length > 0
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
                        const isEditing =
                            editingCell?.rowId === info.row.id &&
                            editingCell?.columnId === col.id;

                        return (
                            <AirtableCell
                                value={value}
                                row={row}
                                column={col}
                                isEditing={isEditing}
                                renderDisplay={col.cellRenderer}
                                onStartEdit={() => {
                                    if (col.editable) {
                                        setEditingCell({ rowId: info.row.id, columnId: col.id });
                                    }
                                }}
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
                    minSize: getMinColumnWidth(col),
                    maxSize: col.maxWidth || 500,
                })
            );
        });

        // Actions column
        cols.push(
            columnHelper.display({
                id: "actions",
                header: "Action",
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center">
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onRowDelete?.(row.original)}>
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
                size: 50,
                minSize: 50,
                maxSize: 50,
                enableResizing: false,
                enableSorting: false,
            })
        );

        return cols;
    }, [
        stableColumns,
        columnOrder,
        columnVisibility,
        columnSizing,
        editingCell,
        onCellEdit,
    ]);

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
        if (!sorting || !Array.isArray(sorting) || sorting.length === 0)
            return filteredData;
        return [...filteredData].sort((a, b) =>
            applySortLogic(a, b, sorting, stableColumns)
        );
    }, [filteredData, sorting, stableColumns]);

    // Memoize table config to prevent recreation on every render
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
                pagination,
            },
            onSortingChange: setSorting,
            onColumnVisibilityChange: setColumnVisibility,
            onRowSelectionChange: setRowSelection,
            onColumnSizingChange: setColumnSizing,
            onGroupingChange: setGrouping,
            onPaginationChange: setPagination,
            getCoreRowModel: getCoreRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            enableRowSelection: true,
            enableColumnResizing: true,
            columnResizeMode: "onChange",
            enableMultiSort: true,
            maxMultiSortColCount: 3,
        }),
        [
            sortedData,
            tableColumns,
            sorting,
            columnVisibility,
            rowSelection,
            columnSizing,
            grouping,
            pagination,
        ]
    );

    // Initialize table - useReactTable must be called at top level (Rules of Hooks)
    // But config is memoized so table instance is stable
    const table = useReactTable(tableConfig);

    // Memoize handlers to prevent recreation
    const handleColumnDragStart = useCallback((columnId) => {
        setDraggedColumn(columnId);
    }, []);

    const handleColumnDragOver = useCallback(
        (e, targetColumnId) => {
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
        },
        [draggedColumn]
    );

    const handleColumnDragEnd = useCallback(() => {
        setDraggedColumn(null);
    }, []);

    // Memoize frozen offset calculation
    const getFrozenOffset = useCallback(
        (columnIndex) => {
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
        },
        [table, frozenColumns]
    );

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
            <div className="space-y-4 px-2 sm:px-4">
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
            <div className="p-3 hidden md:block">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table
                            className="w-full border-collapse"
                            style={{ tableLayout: "fixed" }}
                        >
                            {/* Sticky Header */}
                            <thead className="sticky top-0 bg-white z-20 shadow-sm border-b border-gray-200">
                                {table.getHeaderGroups().map((headerGroup) => {
                                    // Density-based header height and padding
                                    const headerHeightClass =
                                        density === "compact" ? "h-8" :
                                            density === "comfortable" ? "h-14" :
                                                "h-12"; // standard

                                    const headerPaddingClass =
                                        density === "compact" ? "px-3 py-1.5" :
                                            density === "comfortable" ? "px-4 py-4" :
                                                "px-4 py-3"; // standard

                                    return (
                                        <tr key={headerGroup.id} className={headerHeightClass}>
                                            {headerGroup.headers.map((header, idx) => {
                                                const column = header.column;
                                                const isFrozen =
                                                    frozenColumns.includes(column.id) ||
                                                    column.id === "select";
                                                const frozenOffset = isFrozen ? getFrozenOffset(idx) : 0;
                                                const canSort = column.getCanSort();
                                                const sortDirection = column.getIsSorted();

                                                return (
                                                    <th
                                                        key={header.id}
                                                        className={cn(
                                                            "text-left text-[13px] font-semibold tracking-wide text-gray-700 bg-white border-r border-gray-200 last:border-r-0 relative",
                                                            headerPaddingClass,
                                                            canSort && "cursor-pointer hover:bg-gray-50",
                                                            isFrozen && "sticky z-30 bg-white",
                                                            draggedColumn === column.id && "opacity-50"
                                                        )}
                                                        style={{
                                                            width: header.getSize(),
                                                            left: isFrozen ? `${frozenOffset}px` : undefined,
                                                        }}
                                                        draggable={column.id !== "select" && column.id !== "actions"}
                                                        onDragStart={() =>
                                                            column.id !== "select" && column.id !== "actions" &&
                                                            handleColumnDragStart(column.id)
                                                        }
                                                        onDragOver={(e) =>
                                                            column.id !== "select" && column.id !== "actions" &&
                                                            handleColumnDragOver(e, column.id)
                                                        }
                                                        onDragEnd={handleColumnDragEnd}
                                                        onClick={(e) => {
                                                            if (!canSort) return;
                                                            if (e.shiftKey) {
                                                                column.toggleSorting(undefined, true);
                                                            } else {
                                                                column.toggleSorting();
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 group">
                                                            <span className="flex-1">
                                                                {flexRender(
                                                                    column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                            </span>
                                                            {canSort && (
                                                                <span className="flex-shrink-0">
                                                                    {sortDirection === "asc" ? (
                                                                        <ChevronUp className="h-4 w-4 text-gray-500" />
                                                                    ) : sortDirection === "desc" ? (
                                                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                                                    ) : (
                                                                        <ArrowUpDown className="h-4 w-4 text-gray-500 opacity-40" />
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {column.getCanResize() && (
                                                            <div
                                                                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400/50 transition-opacity duration-150 opacity-0 hover:opacity-100"
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    const startX = e.clientX;
                                                                    const startWidth = column.getSize();

                                                                    const handleMouseMove = (e) => {
                                                                        const diff = e.clientX - startX;
                                                                        const newWidth = Math.max(
                                                                            column.columnDef.minSize || 100,
                                                                            startWidth + diff
                                                                        );
                                                                        column.setSize(newWidth);
                                                                    };

                                                                    const handleMouseUp = () => {
                                                                        document.removeEventListener(
                                                                            "mousemove",
                                                                            handleMouseMove
                                                                        );
                                                                        document.removeEventListener(
                                                                            "mouseup",
                                                                            handleMouseUp
                                                                        );
                                                                    };

                                                                    document.addEventListener(
                                                                        "mousemove",
                                                                        handleMouseMove
                                                                    );
                                                                    document.addEventListener(
                                                                        "mouseup",
                                                                        handleMouseUp
                                                                    );
                                                                }}
                                                            />
                                                        )}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
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
                                        editingCell={editingCell}
                                        columnOrder={columnOrder}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <AirtablePagination table={table} />
        </div>
    );
}
