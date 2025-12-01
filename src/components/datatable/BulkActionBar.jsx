import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Shield, Ban, Download, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BulkActionBar({
    selectedCount,
    selectedRows,
    onClearSelection,
    onDelete,
    onBulkAction,
    onExport,
}) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center gap-2 border-r border-gray-200 pr-2 mr-2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedCount}
                </span>
                <span className="text-sm font-medium text-gray-700">Selected</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-gray-100"
                    onClick={onClearSelection}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            <div className="flex items-center gap-1">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                            <Shield className="h-3.5 w-3.5" />
                            Change Role
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => onBulkAction("changeRole", selectedRows, "admin")}>
                            Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onBulkAction("changeRole", selectedRows, "manager")}>
                            Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onBulkAction("changeRole", selectedRows, "member")}>
                            Team Member
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => onBulkAction("deactivate", selectedRows)}
                >
                    <Ban className="h-3.5 w-3.5" />
                    Deactivate
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(selectedRows)}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => onExport("csv", selectedRows)}
                >
                    <Download className="h-3.5 w-3.5" />
                    Export
                </Button>
            </div>
        </div>
    );
}
