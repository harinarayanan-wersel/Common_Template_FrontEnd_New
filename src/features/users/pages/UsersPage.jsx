import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchUsers,
  deleteUser as deleteUserThunk,
  updateUser,
} from "../slices/usersSlice.js";
import { fetchRoles, selectRoles } from "@/features/roles/slices/rolesSlice.js";
import { Button } from "../../../components/ui/button.jsx";
import { Card, CardContent } from "../../../components/ui/card.jsx";
import { Skeleton } from "../../../components/ui/skeleton.jsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar.jsx";
import {
  Users as UsersIcon,
  Plus,
  Home,
  ChevronRight,
} from "lucide-react";
import { ROUTES } from "../../../app/constants.js";
import { AirtableDataTable } from "../../../components/datatable/AirtableDataTable.jsx";

import { DynamicCardView } from "@/components/ui/dynamic-card-view.jsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs.jsx";
import { RolesModule } from "@/features/roles/components/RolesModule.jsx";
import { TeamUnitsModule } from "@/features/team-units/components/TeamUnitsModule.jsx";
import AddUserDialog from "@/components/users/AddUserDialog.jsx";
import { useToast } from "@/hooks/use-toast.js";
import { cn } from "@/lib/utils.js";

const getErrorMessage = (error) => {
  if (!error) return "Something went wrong while fetching the users list. Please refresh the page.";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    if (error.detail) {
      return typeof error.detail === "string"
        ? error.detail
        : JSON.stringify(error.detail);
    }
    if (error.message) return error.message;
    try {
      return JSON.stringify(error);
    } catch (_) {
      return "Unexpected error occurred.";
    }
  }
  return String(error);
};

const formatUserForDisplay = (user, index) => {
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const fallbackName = user.email?.split("@")[0] || `User ${index + 1}`;
  const primaryRoleObj = user.roles?.find(Boolean);
  const primaryRole = primaryRoleObj?.name ?? "Team Member";
  const primaryRoleId = primaryRoleObj?.id;

  return {
    id: user.id,
    userId: `USR-${String(user.id ?? index + 1).padStart(4, "0")}`,
    name: fullName || fallbackName,
    email: user.email || "",
    phone: user.phone || "N/A",
    role: primaryRole,
    roleId: primaryRoleId,
    roleName: primaryRole,
    teamUnit: user.team_unit || "General",
    status: user.is_active ? "active" : "inactive",
    joinDate: user.created_at || "N/A",
    avatar:
      user.profile_url ||
      `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
        fullName || fallbackName
      )}`,
    rawUser: user,
  };
};

export const UsersPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { users, status, error } = useSelector((state) => state.users);
  const rolesList = useSelector(selectRoles);
  const rolesStatus = useSelector((state) => state.roles.status);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [listQuery, setListQuery] = useState({
    page: 1,
    page_size: 20,
    include_deleted: false,
  });

  useEffect(() => {
    dispatch(fetchUsers(listQuery));
    if (rolesStatus === "idle") {
      dispatch(fetchRoles());
    }
  }, [dispatch, listQuery, rolesStatus]);

  const displayUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }

    return users.map((user, index) => formatUserForDisplay(user, index));
  }, [users]);

  // Define columns for AirtableDataTable
  const columns = useMemo(() => [
    {
      id: "user",
      label: "User",
      accessorKey: "name",
      sortable: true,
      editable: true,
      frozen: true,
      width: 240,
      minWidth: 200,
      maxWidth: 300,
      fieldType: "text",
      cellRenderer: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={row.avatar} alt={value} />
            <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-600">
              {value
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm text-gray-900 truncate">
              {value || "Unknown User"}
            </div>
            <div className="text-xs text-gray-500 truncate">{row.userId || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      label: "Email",
      accessorKey: "email",
      sortable: true,
      editable: true,
      filterable: true,
      width: 260,
      minWidth: 200,
      maxWidth: 350,
      fieldType: "email",
    },
    {
      id: "phone",
      label: "Phone",
      accessorKey: "phone",
      sortable: true,
      editable: true,
      filterable: true,
      width: 160,
      minWidth: 140,
      maxWidth: 200,
      fieldType: "phone",
    },
    {
      id: "role",
      label: "Role",
      accessorKey: "roleId",
      sortable: true,
      editable: true,
      filterable: true,
      width: 150,
      minWidth: 120,
      maxWidth: 200,
      fieldType: "dropdown",
      options: rolesList.map(role => ({ value: role.id, label: role.name })),
    },
    {
      id: "status",
      label: "Status",
      accessorKey: "status",
      sortable: true,
      editable: true,
      filterable: true,
      width: 140,
      minWidth: 120,
      maxWidth: 160,
      fieldType: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ],
      cellRenderer: (value) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
            value === "active"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : value === "inactive"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-orange-50 text-orange-700 border-orange-200"
          )}
        >
          {value === "active" ? "Active" : value === "inactive" ? "Inactive" : value || "Unknown"}
        </span>
      ),
    },
    {
      id: "lastLogin",
      label: "Last Login",
      accessorKey: "joinDate",
      sortable: true,
      editable: false,
      width: 150,
      minWidth: 130,
      maxWidth: 180,
      fieldType: "date",
    },
  ], [rolesList]);

  // Handlers
  const handleEdit = (row) => {
    setSelectedUser(row.rawUser || row);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh the users list after successful update
    dispatch(fetchUsers(listQuery));
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleEditDialogClose = (open) => {
    setEditDialogOpen(open);
    if (!open) {
      // Reset selected user when dialog closes
      setSelectedUser(null);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await dispatch(
        deleteUserThunk(row.rawUser?.id ?? row.id)
      ).unwrap();
      toast({
        title: "User deleted",
        description: `${row.name} has been removed.`,
      });
    } catch (deleteError) {
      toast({
        variant: "destructive",
        title: "Unable to delete user",
        description:
          deleteError?.message || "Please try again or refresh the page.",
      });
    }
  };

  // Custom card renderer for DataTable
  const renderUserCard = (member, { onEdit, onDelete }) => (
    <DynamicCardView
      title={member.name}
      subtitle={member.userId}
      avatar
      avatarSrc={member.avatar}
      fields={[
        { label: "Email", value: member.email },
        { label: "Phone", value: member.phone },
        {
          label: "Status",
          value: (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                member.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {member.status === "active" ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      actions={["edit", "delete"]}
      onEdit={() => onEdit?.(member)}
      onDelete={() => onDelete?.(member)}
      compact
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}


      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.05)] rounded-xl border border-border bg-card">
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="users" className="space-y-5">
            <TabsList>
              <TabsTrigger value="users">
                Users
              </TabsTrigger>
              <TabsTrigger value="roles">
                Roles
              </TabsTrigger>
              <TabsTrigger value="team-units">
                Team Units
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-5">
              {status === "loading" ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : status === "error" ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-12 text-center">
                  <UsersIcon className="h-12 w-12 text-destructive" />
                  <h3 className="text-lg font-semibold">Unable to load users</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {getErrorMessage(error)}
                  </p>
                  <Button onClick={() => dispatch(fetchUsers(listQuery))} className="mt-2">
                    Retry
                  </Button>
                </div>
              ) : displayUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
                  No users found. Use “Add User” to create the first one.
                </div>
              ) : (
                <AirtableDataTable
                  data={displayUsers}
                  columns={columns}
                  onCellEdit={(row, columnId, value) => {
                    const userId = row.rawUser?.id ?? row.id;
                    let updateData = {};

                    switch (columnId) {
                      case "user":
                        const parts = value.trim().split(" ");
                        if (parts.length > 0) {
                          updateData.first_name = parts[0];
                          updateData.last_name = parts.slice(1).join(" ");
                        }
                        break;
                      case "email":
                        updateData.email = value;
                        break;
                      case "phone":
                        updateData.phone = value;
                        break;
                      case "role":
                        updateData.role_ids = [value]; // Assuming API expects array of role IDs
                        break;
                      case "status":
                        updateData.is_active = value === "active";
                        break;
                      default:
                        return;
                    }

                    if (Object.keys(updateData).length > 0) {
                      dispatch(updateUser({ id: userId, data: updateData }))
                        .unwrap()
                        .then(() => {
                          toast({ title: "User updated successfully" });
                          dispatch(fetchUsers(listQuery));
                        })
                        .catch((err) => {
                          toast({
                            variant: "destructive",
                            title: "Update failed",
                            description: getErrorMessage(err),
                          });
                        });
                    }
                  }}
                  onRowDelete={handleDelete}
                  onBulkAction={(action, rows) => {
                    console.log("Bulk action:", action, rows);
                    // Handle bulk actions (changeRole, deactivate, etc.)
                  }}
                  onExport={(format, rows) => {
                    // Handle export
                    if (format === "csv") {
                      const headers = Object.keys(rows[0] || {});
                      const csvContent = [
                        headers.join(","),
                        ...rows.map((row) =>
                          headers
                            .map((header) => {
                              const value = row[header];
                              return typeof value === "string" && value.includes(",")
                                ? `"${value}"`
                                : value ?? "";
                            })
                            .join(",")
                        ),
                      ].join("\n");

                      const blob = new Blob([csvContent], { type: "text/csv" });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "users-export.csv";
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }
                  }}
                  storageKey="users-airtable-preferences"
                  toolbarActions={
                    <Button
                      className="h-9 gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-[hsl(var(--primary-foreground))] font-medium shadow-sm hover:bg-[hsl(var(--primary)/0.9)]"
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add User
                    </Button>
                  }
                />
              )}

              <AddUserDialog
                mode="edit"
                initialData={selectedUser}
                open={editDialogOpen}
                onOpenChange={handleEditDialogClose}
                onSuccess={handleEditSuccess}
              />

              <AddUserDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleEditSuccess}
              />
            </TabsContent>

            <TabsContent value="roles">
              <RolesModule />
            </TabsContent>

            <TabsContent value="team-units">
              <TeamUnitsModule />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
