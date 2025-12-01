import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Columns,
    Download,
    Settings2,
    Maximize2,
    Minimize2,
    LayoutGrid,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { FilterPanel } from "./panels/FilterPanel";
import { SortPanel } from "./panels/SortPanel";
import { GroupPanel } from "./panels/GroupPanel";

export function AirtableToolbar({
    table,
    globalFilter,
    onGlobalFilterChange,
    sorting,
    filters,
    grouping,
    onSortingChange,
    onFiltersChange,
    onGroupingChange,
    columnVisibility,
    onColumnVisibilityChange,
    density,
    onDensityChange,
    frozenColumns,
    onFrozenColumnsChange,
    showFilterPanel,
    onShowFilterPanel,
    showSortPanel,
    onShowSortPanel,
    showGroupPanel,
    onShowGroupPanel,
    onExport,
    toolbarActions,
    columns,
}) {
    return (
        <div className="flex flex-col gap-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    {/* Search */}
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={globalFilter ?? ""}
                            onChange={(event) => onGlobalFilterChange(event.target.value)}
                            className="pl-8 h-9 bg-white border-gray-200 shadow-sm focus:bg-white transition-colors placeholder:text-gray-500"
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-2" />

                    {/* Filter Panel Toggle */}
                    <FilterPanel
                        columns={columns}
                        filters={filters}
                        onFiltersChange={onFiltersChange}
                        open={showFilterPanel}
                        onOpenChange={onShowFilterPanel}
                    />

                    {/* Sort Panel Toggle */}
                    <SortPanel
                        columns={columns}
                        sorting={sorting}
                        onSortingChange={onSortingChange}
                        open={showSortPanel}
                        onOpenChange={onShowSortPanel}
                    />

                    {/* Group Panel Toggle */}
                    <GroupPanel
                        columns={columns}
                        grouping={grouping}
                        onGroupingChange={onGroupingChange}
                        open={showGroupPanel}
                        onOpenChange={onShowGroupPanel}
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* Columns Visibility */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-gray-200 bg-white hover:bg-gray-50 shadow-sm">
                                <Columns className="h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] max-h-[400px] overflow-y-auto">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.columnDef.header}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Density */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-gray-200 bg-white hover:bg-gray-50 shadow-sm">
                                <LayoutGrid className="h-4 w-4" />
                                Density
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Row Density</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={density} onValueChange={onDensityChange}>
                                <DropdownMenuRadioItem value="comfortable">
                                    <Maximize2 className="mr-2 h-4 w-4" /> Comfortable
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="standard">
                                    <Settings2 className="mr-2 h-4 w-4" /> Standard
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="compact">
                                    <Minimize2 className="mr-2 h-4 w-4" /> Compact
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Export */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
                        onClick={() => onExport?.("csv", table.getFilteredRowModel().rows.map(r => r.original))}
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>

                    {/* Primary Action (Add User) */}
                    {toolbarActions}
                </div>
            </div>
        </div>
    );
}
