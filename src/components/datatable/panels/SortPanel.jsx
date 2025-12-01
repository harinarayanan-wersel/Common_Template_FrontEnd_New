import React from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function SortPanel({ columns, sorting, onSortingChange, open, onOpenChange }) {
    const handleAddSort = () => {
        const firstColumn = columns.find((c) => c.sortable !== false);
        if (!firstColumn) return;

        onSortingChange([
            ...sorting,
            {
                columnId: firstColumn.id,
                desc: false,
            },
        ]);
    };

    const handleRemoveSort = (index) => {
        const newSorting = [...sorting];
        newSorting.splice(index, 1);
        onSortingChange(newSorting);
    };

    const handleUpdateSort = (index, field, value) => {
        const newSorting = [...sorting];
        newSorting[index] = { ...newSorting[index], [field]: value };
        onSortingChange(newSorting);
    };

    const sortableColumns = columns.filter((c) => c.sortable !== false);

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant={sorting.length > 0 ? "secondary" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-sm shadow-sm h-9"
                >
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                    {sorting.length > 0 && (
                        <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                            {sorting.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-4" align="start">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium leading-none">Sort by</h4>
                        {sorting.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                                onClick={() => onSortingChange([])}
                            >
                                Clear all
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {sorting.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-md">
                                No sorting applied
                            </div>
                        ) : (
                            sorting.map((sort, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-12">
                                        {index === 0 ? "Sort by" : "Then by"}
                                    </span>

                                    <Select
                                        value={sort.columnId}
                                        onValueChange={(val) => handleUpdateSort(index, "columnId", val)}
                                    >
                                        <SelectTrigger className="h-8 flex-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortableColumns.map((col) => (
                                                <SelectItem key={col.id} value={col.id}>
                                                    {col.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex bg-muted rounded-md p-0.5">
                                        <Button
                                            variant={!sort.desc ? "white" : "ghost"}
                                            size="sm"
                                            className={`h-7 px-2 ${!sort.desc ? "bg-white shadow-sm" : ""}`}
                                            onClick={() => handleUpdateSort(index, "desc", false)}
                                        >
                                            <ArrowUp className="h-3.5 w-3.5 mr-1" />
                                            A-Z
                                        </Button>
                                        <Button
                                            variant={sort.desc ? "white" : "ghost"}
                                            size="sm"
                                            className={`h-7 px-2 ${sort.desc ? "bg-white shadow-sm" : ""}`}
                                            onClick={() => handleUpdateSort(index, "desc", true)}
                                        >
                                            <ArrowDown className="h-3.5 w-3.5 mr-1" />
                                            Z-A
                                        </Button>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveSort(index)}
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
                        onClick={handleAddSort}
                    >
                        <Plus className="mr-2 h-3.5 w-3.5" /> Add sort
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
