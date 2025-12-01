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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
        <TooltipProvider>
            <div className="flex flex-col gap-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Search */}
                        <div className="relative w-full sm:w-64 flex-shrink-0">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={globalFilter ?? ""}
                                onChange={(event) => onGlobalFilterChange(event.target.value)}
                                className="pl-8 h-9 bg-white border-gray-200 shadow-sm focus:bg-white transition-colors placeholder:text-gray-500 w-full"
                            />
                        </div>

                        <div className="hidden sm:block w-px h-6 bg-gray-200 mx-3"></div>

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

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        {/* Columns Visibility */}
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="flex items-center justify-center p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700 transition h-9 w-9 flex-shrink-0">
                                            <Columns className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Toggle columns</p>
                                </TooltipContent>
                            </Tooltip>
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

                        {/* Density - Hide on mobile */}
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="hidden sm:flex items-center justify-center p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700 transition h-9 w-9">
                                            <LayoutGrid className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Row density</p>
                                </TooltipContent>
                            </Tooltip>
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

                        {/* Export - Hide on mobile */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:flex items-center justify-center p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700 transition h-9 w-9"
                                    onClick={() => onExport?.("csv", table.getFilteredRowModel().rows.map(r => r.original))}
                                >
                                    <Download className="h-4 w-4 text-gray-500" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Export</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Primary Action (Add User) */}
                        {toolbarActions}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
