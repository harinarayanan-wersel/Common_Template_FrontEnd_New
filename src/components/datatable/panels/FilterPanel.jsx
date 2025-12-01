import React from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function FilterPanel({ columns, filters, onFiltersChange, open, onOpenChange }) {
    const handleAddFilter = () => {
        const firstColumn = columns.find((c) => c.filterable !== false);
        if (!firstColumn) return;

        onFiltersChange([
            ...filters,
            {
                id: Math.random().toString(36).substr(2, 9),
                columnId: firstColumn.id,
                operator: "contains",
                value: "",
            },
        ]);
    };

    const handleRemoveFilter = (index) => {
        const newFilters = [...filters];
        newFilters.splice(index, 1);
        onFiltersChange(newFilters);
    };

    const handleUpdateFilter = (index, field, value) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], [field]: value };
        onFiltersChange(newFilters);
    };

    const filterableColumns = columns.filter((c) => c.filterable !== false);

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant={filters.length > 0 ? "secondary" : "outline"}
                    size="sm"
                    className="h-9 gap-2 border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Filter
                    {filters.length > 0 && (
                        <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                            {filters.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4" align="start">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium leading-none">Filters</h4>
                        {filters.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                                onClick={() => onFiltersChange([])}
                            >
                                Clear all
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {filters.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-md">
                                No filters applied
                            </div>
                        ) : (
                            filters.map((filter, index) => (
                                <div key={filter.id || index} className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-12">
                                        {index === 0 ? "Where" : "And"}
                                    </span>

                                    <Select
                                        value={filter.columnId}
                                        onValueChange={(val) => handleUpdateFilter(index, "columnId", val)}
                                    >
                                        <SelectTrigger className="h-8 w-[110px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filterableColumns.map((col) => (
                                                <SelectItem key={col.id} value={col.id}>
                                                    {col.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={filter.operator}
                                        onValueChange={(val) => handleUpdateFilter(index, "operator", val)}
                                    >
                                        <SelectTrigger className="h-8 w-[100px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contains">contains</SelectItem>
                                            <SelectItem value="notContains">does not contain</SelectItem>
                                            <SelectItem value="equals">is</SelectItem>
                                            <SelectItem value="notEquals">is not</SelectItem>
                                            <SelectItem value="startsWith">starts with</SelectItem>
                                            <SelectItem value="endsWith">ends with</SelectItem>
                                            <SelectItem value="isEmpty">is empty</SelectItem>
                                            <SelectItem value="isNotEmpty">is not empty</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        className="h-8 flex-1"
                                        placeholder="Value..."
                                        value={filter.value}
                                        onChange={(e) => handleUpdateFilter(index, "value", e.target.value)}
                                        disabled={filter.operator === "isEmpty" || filter.operator === "isNotEmpty"}
                                    />

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveFilter(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed"
                        onClick={handleAddFilter}
                    >
                        <Plus className="mr-2 h-3.5 w-3.5" /> Add condition
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
