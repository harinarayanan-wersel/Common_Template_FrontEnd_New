import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchUsers,
  deleteUser as deleteUserThunk,
} from "../slices/usersSlice.js";
import { fetchRoles } from "@/features/roles/slices/rolesSlice.js";
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
import { DataTable } from "../../../components/ui/data-table.jsx";

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
  const primaryRole = user.roles?.find(Boolean)?.name ?? "Team Member";

  return {
    id: user.id,
    userId: `USR-${String(user.id ?? index + 1).padStart(4, "0")}`,
    name: fullName || fallbackName,
    email: user.email || "",
    phone: user.phone || "N/A",
    role: primaryRole,
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

  // Define columns for DataTable
  const columns = [
    {
      key: "userId",
      label: "User ID",
      sortable: true,
    },
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.avatar} alt={value} />
            <AvatarFallback>
              {value
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{value}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            value === "active"
              ? "bg-green-100 text-green-700"
              : "bg-muted text-muted-foreground"
          )}
        >
          {value === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

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
      <div className="flex items-center justify-between mb-3">
        <h5 className="!mb-0 text-2xl font-semibold text-foreground"></h5>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            to={ROUTES.USERS}
            className="hover:text-foreground transition-colors"
          >
            Users
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Users List</span>
        </div>
      </div>

      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.05)] rounded-xl border border-border bg-white">
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
                <DataTable
                  data={displayUsers}
                  columns={columns}
                  searchKey=""
                  searchPlaceholder="Search member here..."
                  pageSize={10}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  actionsLabel="Action"
                  showSearch
                  showPagination
                  renderCard={renderUserCard}
                  toolbarActions={
                    <Button
                      className="h-[38px] gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-[hsl(var(--primary-foreground))] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:bg-[hsl(var(--primary)/0.9)]"
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
