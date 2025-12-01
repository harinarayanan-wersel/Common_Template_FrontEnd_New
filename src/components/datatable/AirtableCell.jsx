import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

export function AirtableCell({
    value,
    row,
    column,
    isEditing,
    onStartEdit,
    onSave,
    onCancel,
    renderDisplay,
}) {
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSave(localValue);
        } else if (e.key === "Escape") {
            e.preventDefault(); // Prevent modal closing if inside one
            onCancel();
            setLocalValue(value);
        }
    };

    const handleBlur = () => {
        // Delay save to allow for clicks on dropdowns/calendars
        // But for simple inputs, we can save immediately
        if (column.fieldType === "text" || column.fieldType === "email" || column.fieldType === "phone") {
            onSave(localValue);
        }
    };

    if (!isEditing) {
        return (
            <div
                className={cn(
                    "w-full h-full min-h-[32px] flex items-center cursor-pointer hover:bg-gray-100 rounded transition-colors truncate",
                    !value && "text-gray-400 italic"
                )}
                onClick={onStartEdit}
            >
                {renderDisplay ? renderDisplay(value, row) : renderDisplayValue(value, column)}
            </div>
        );
    }

    // Edit Mode Renderers
    switch (column.fieldType) {
        case "select":
        case "dropdown":
            return (
                <Select
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) onSave(localValue);
                    }}
                    value={localValue}
                    onValueChange={(val) => {
                        setLocalValue(val);
                        // Optional: auto-save on selection
                        // onSave(val); 
                    }}
                >
                    <SelectTrigger className="h-8 w-full border-none focus:ring-0 px-2">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        {column.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );

        case "date":
            return (
                <Popover open={true} onOpenChange={(open) => !open && onSave(localValue)}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className={cn(
                                "w-full justify-start text-left font-normal h-8 px-2",
                                !localValue && "text-muted-foreground"
                            )}
                        >
                            {localValue ? format(new Date(localValue), "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={localValue ? new Date(localValue) : undefined}
                            onSelect={(date) => {
                                const val = date ? date.toISOString() : null;
                                setLocalValue(val);
                                onSave(val);
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            );

        case "multi-select":
            // Simplified multi-select for now
            return (
                <div className="flex flex-wrap gap-1 p-1 border rounded bg-white min-h-[32px]">
                    {Array.isArray(localValue) && localValue.map((v) => (
                        <Badge key={v} variant="secondary" className="h-5 px-1 text-[10px]">
                            {v}
                            <button
                                className="ml-1 hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLocalValue(localValue.filter(i => i !== v));
                                }}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    <Input
                        ref={inputRef}
                        className="h-6 w-20 border-none p-0 text-xs focus-visible:ring-0"
                        placeholder="Add..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (val && (!Array.isArray(localValue) || !localValue.includes(val))) {
                                    setLocalValue([...(Array.isArray(localValue) ? localValue : []), val]);
                                    e.currentTarget.value = '';
                                } else {
                                    onSave(localValue);
                                }
                            } else if (e.key === 'Escape') {
                                onCancel();
                            }
                        }}
                        onBlur={() => onSave(localValue)}
                    />
                </div>
            );

        case "text":
        case "email":
        case "phone":
        default:
            return (
                <Input
                    ref={inputRef}
                    value={localValue || ""}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="h-8 w-full border-blue-500 focus-visible:ring-0 px-2 rounded-none"
                />
            );
    }
}

// Helper function to get status badge styles
function getStatusBadgeStyles(value) {
    const status = String(value).toLowerCase();
    
    switch (status) {
        case "in progress":
        case "in-progress":
        case "inprogress":
            return "bg-blue-100 text-blue-700 border-0";
        case "open":
            return "bg-blue-50 text-blue-500 border-0";
        case "resolved":
        case "closed":
        case "done":
        case "completed":
            return "bg-teal-100 text-teal-700 border-0";
        case "active":
            return "bg-emerald-100 text-emerald-700 border-0";
        case "inactive":
        case "pending":
            return "bg-amber-100 text-amber-700 border-0";
        case "cancelled":
        case "cancelled":
        case "rejected":
            return "bg-red-100 text-red-700 border-0";
        default:
            return "bg-gray-100 text-gray-700 border-0";
    }
}

function renderDisplayValue(value, column) {
    if (value === null || value === undefined || value === "") return <span className="text-gray-300">Empty</span>;

    switch (column.fieldType) {
        case "date":
            try {
                return format(new Date(value), "MMM d, yyyy");
            } catch (e) {
                return value;
            }
        case "select":
        case "dropdown":
            const option = column.options?.find((opt) => opt.value === value);
            const displayText = option ? option.label : value;
            
            // Check if this is a status column
            const isStatusColumn = column.id?.toLowerCase().includes("status") || 
                                  column.label?.toLowerCase().includes("status") ||
                                  column.fieldType === "status";
            
            if (isStatusColumn) {
                return (
                    <Badge 
                        className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium border-0",
                            getStatusBadgeStyles(value)
                        )}
                    >
                        {displayText}
                    </Badge>
                );
            }
            
            // Default badge for non-status selects
            return (
                <Badge variant="outline" className={cn("font-normal rounded-md px-2.5 py-1",
                    value === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        value === 'inactive' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                )}>
                    {displayText}
                </Badge>
            );
        case "multi-select":
            if (!Array.isArray(value) || value.length === 0) return <span className="text-gray-300">Empty</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map(v => (
                        <Badge key={v} variant="secondary" className="h-5 px-1 text-[10px] rounded-md">
                            {v}
                        </Badge>
                    ))}
                </div>
            );
        default:
            return value;
    }
}
