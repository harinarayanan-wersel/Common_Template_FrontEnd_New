import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AirtableCardView({ rows, columns, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const data = row.original;
        const nameCol = columns.find((c) => c.id === "name" || c.accessorKey === "name");
        const emailCol = columns.find((c) => c.id === "email" || c.accessorKey === "email");
        const phoneCol = columns.find((c) => c.id === "phone" || c.accessorKey === "phone");
        const statusCol = columns.find((c) => c.id === "status" || c.accessorKey === "status");
        const roleCol = columns.find((c) => c.id === "role" || c.accessorKey === "role");
        const dateCol = columns.find((c) => c.fieldType === "date");

        const name = data[nameCol?.accessorKey || nameCol?.id] || data.name;
        const email = data[emailCol?.accessorKey || emailCol?.id] || data.email;
        const phone = data[phoneCol?.accessorKey || phoneCol?.id] || data.phone;
        const status = data[statusCol?.accessorKey || statusCol?.id] || data.status;
        const role = data[roleCol?.accessorKey || roleCol?.id] || data.role;
        const date = data[dateCol?.accessorKey || dateCol?.id] || data.lastLogin;
        const avatar = data.avatar || data.profile_url;

        const initials = name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "?";

        return (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="rounded-xl border border-gray-200 bg-white p-4 sm:p-4 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {avatar && (
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-gray-900 truncate">
                      {name || "Unknown User"}
                    </div>
                    {email && (
                      <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {email}
                      </div>
                    )}
                  </div>
                </div>
                {status && (
                  <Badge
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium border-0",
                      String(status).toLowerCase() === "in progress" || String(status).toLowerCase() === "in-progress" || String(status).toLowerCase() === "inprogress"
                        ? "bg-blue-100 text-blue-700"
                        : String(status).toLowerCase() === "open"
                        ? "bg-blue-50 text-blue-500"
                        : String(status).toLowerCase() === "resolved" || String(status).toLowerCase() === "closed" || String(status).toLowerCase() === "done" || String(status).toLowerCase() === "completed"
                        ? "bg-teal-100 text-teal-700"
                        : String(status).toLowerCase() === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : String(status).toLowerCase() === "inactive" || String(status).toLowerCase() === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : String(status).toLowerCase() === "cancelled" || String(status).toLowerCase() === "cancelled" || String(status).toLowerCase() === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {status}
                  </Badge>
                )}
              </div>

              {/* Body */}
              <div className="space-y-2 text-sm mb-3">
                {phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{phone}</span>
                  </div>
                )}
                {role && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Role:</span>
                    <Badge variant="outline">{role}</Badge>
                  </div>
                )}
                {date && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Last login: {format(new Date(date), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(data)}
                    className="h-8"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(data)}
                    className="h-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

