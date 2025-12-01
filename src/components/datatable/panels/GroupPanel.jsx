import React from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Layers } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function GroupPanel({ columns, grouping, onGroupingChange, open, onOpenChange }) {
    const handleAddGroup = () => {
        const firstColumn = columns.find((c) => c.enableGrouping !== false);
        if (!firstColumn) return;

        // TanStack table grouping is an array of columnIds
        onGroupingChange([...grouping, firstColumn.id]);
    };

    const handleRemoveGroup = (index) => {
        const newGrouping = [...grouping];
        newGrouping.splice(index, 1);
        onGroupingChange(newGrouping);
    };

    const handleUpdateGroup = (index, value) => {
        const newGrouping = [...grouping];
        newGrouping[index] = value;
        onGroupingChange(newGrouping);
    };

    const groupableColumns = columns.filter((c) => c.enableGrouping !== false);

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant={grouping.length > 0 ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 gap-2 border-dashed"
                >
                    <Layers className="h-3.5 w-3.5" />
                    Group
                    {grouping.length > 0 && (
                        <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                            {grouping.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-4" align="start">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium leading-none">Group by</h4>
                        {grouping.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                                onClick={() => onGroupingChange([])}
                            >
                                Clear all
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {grouping.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-md">
                                No grouping applied
                            </div>
                        ) : (
                            grouping.map((groupId, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-12">
                                        {index === 0 ? "Group by" : "Then by"}
                                    </span>

                                    <Select
                                        value={groupId}
                                        onValueChange={(val) => handleUpdateGroup(index, val)}
                                    >
                                        <SelectTrigger className="h-8 flex-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groupableColumns.map((col) => (
                                                <SelectItem key={col.id} value={col.id}>
                                                    {col.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveGroup(index)}
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
                        onClick={handleAddGroup}
                    >
                        <Plus className="mr-2 h-3.5 w-3.5" /> Add group
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
