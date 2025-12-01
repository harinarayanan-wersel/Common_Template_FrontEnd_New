import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Phone, Calendar, Mail, Shield } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export function AirtableCardView({ rows, columns, onEdit, onDelete }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => {
                const data = row.original;
                // Try to find common fields based on column accessors or IDs
                // This is a heuristic mapping since the table is generic
                const nameCol = columns.find(c => c.id === 'user' || c.id === 'name' || c.accessorKey === 'name');
                const emailCol = columns.find(c => c.id === 'email' || c.accessorKey === 'email');
                const roleCol = columns.find(c => c.id === 'role' || c.accessorKey === 'role');
                const statusCol = columns.find(c => c.id === 'status' || c.accessorKey === 'status');
                const phoneCol = columns.find(c => c.id === 'phone' || c.accessorKey === 'phone');
                const dateCol = columns.find(c => c.id === 'lastLogin' || c.accessorKey === 'joinDate' || c.fieldType === 'date');

                const name = nameCol ? data[nameCol.accessorKey] : data.name;
                const email = emailCol ? data[emailCol.accessorKey] : data.email;
                const role = roleCol ? data[roleCol.accessorKey] : data.role;
                const status = statusCol ? data[statusCol.accessorKey] : data.status;
                const phone = phoneCol ? data[phoneCol.accessorKey] : data.phone;
                const date = dateCol ? data[dateCol.accessorKey] : data.joinDate;
                const avatar = data.avatar;

                return (
                    <Card key={row.id} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={avatar} alt={name} />
                                        <AvatarFallback>{name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-sm">{name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate max-w-[150px]">{email}</span>
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit?.(data)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(data)}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Shield className="h-3.5 w-3.5" /> Role
                                    </span>
                                    <span className="font-medium capitalize">{role}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5" /> Phone
                                    </span>
                                    <span>{phone || "N/A"}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" /> Last Login
                                    </span>
                                    <span>
                                        {date ? (
                                            typeof date === 'string' && !isNaN(Date.parse(date)) ?
                                                format(new Date(date), "MMM d, yyyy") : date
                                        ) : "N/A"}
                                    </span>
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                    <Badge variant="outline" className={
                                        status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                            status === 'inactive' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-gray-100 text-gray-700'
                                    }>
                                        {status || "Unknown"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
