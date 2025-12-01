import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Plus, Shield, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DataTable } from "@/components/ui/data-table.jsx";
import { DynamicCardView } from "@/components/ui/dynamic-card-view.jsx";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast.js";
import {
  createRole,
  deleteRole,
  fetchPermissions,
  fetchRoles,
  selectPermissionMetadata,
  selectPermissionsStatus,
  selectRoles,
  selectRolesStatus,
  updateRoleRequest,
} from "@/features/roles/slices/rolesSlice.js";
import { rolesApi } from "@/features/roles/api/rolesApi.js";
import { getCurrentUser } from "@/features/auth/slices/authSlice.js";

const ACTION_FALLBACK = "access";

const formatActionLabel = (action) =>
  action === ACTION_FALLBACK
    ? "Access"
    : action
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()) || "Access";

const buildPermissionTemplate = (metadata) => {
  const template = {};
  metadata.modules.forEach((module) => {
    template[module] = {};
    metadata.actions.forEach((action) => {
      template[module][action] = false;
    });
  });
  return template;
};

const buildFormValues = (metadata, role) => {
  const permissionsTemplate = buildPermissionTemplate(metadata);
  (role?.permissions || []).forEach((permission) => {
    const moduleKey = permission.module || "general";
    const actionKey = permission.action || ACTION_FALLBACK;
    if (permissionsTemplate[moduleKey]?.hasOwnProperty(actionKey)) {
      permissionsTemplate[moduleKey][actionKey] = true;
    }
  });

  return {
    id: role?.id ?? "",
    name: role?.name ?? "",
    description: role?.description ?? "",
    permissions: permissionsTemplate,
  };
};

const extractPermissionIds = (metadata, selections) => {
  const selected = [];
  metadata.modules.forEach((module) => {
    metadata.actions.forEach((action) => {
      const permission = metadata.matrix.get(module)?.[action];
      if (permission && selections?.[module]?.[action]) {
        selected.push(permission.id);
      }
    });
  });
  return selected;
};

const PermissionMatrix = ({ form, metadata }) => {
  if (!metadata.modules.length) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
        No permissions available. Please configure permissions first.
      </div>
    );
  }

  const renderTable = () => (
    <div className="hidden sm:block">
      <div className="rounded-xl border border-border/40 bg-background/80">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                {metadata.actions.map((action) => (
                  <TableHead key={action} className="text-center capitalize">
                    {formatActionLabel(action)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metadata.modules.map((module) => (
                <TableRow key={module} className="text-sm">
                  <TableCell className="font-medium">{module}</TableCell>
                  {metadata.actions.map((action) => {
                    const permission = metadata.matrix.get(module)?.[action];
                    return (
                      <TableCell
                        key={`${module}-${action}`}
                        className="text-center align-middle"
                      >
                        {permission ? (
                          <FormField
                            control={form.control}
                            name={`permissions.${module}.${action}`}
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-center">
                                <FormControl>
                                  <Checkbox
                                    className="h-5 w-5"
                                    checked={field.value}
                                    onCheckedChange={(checked) =>
                                      field.onChange(Boolean(checked))
                                    }
                                    aria-label={`${module} ${action}`}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  const renderAccordion = () => (
    <div className="sm:hidden">
      <Accordion
        type="single"
        collapsible
        className="space-y-4"
        defaultValue={metadata.modules[0]}
      >
        {metadata.modules.map((module) => (
          <AccordionItem
            key={module}
            value={module}
            className="overflow-hidden rounded-2xl border border-border bg-background"
          >
            <AccordionTrigger className="px-5 text-base font-semibold text-foreground hover:no-underline">
              {module}
            </AccordionTrigger>
            <AccordionContent className="[&>div]:px-5 [&>div]:py-5">
              <div className="space-y-3.5">
                {metadata.actions.map((action) => {
                  const permission = metadata.matrix.get(module)?.[action];
                  return (
                    <FormField
                      key={`${module}-${action}`}
                      control={form.control}
                      name={`permissions.${module}.${action}`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <div className="flex min-h-[44px] items-center justify-between rounded-xl border border-border px-4 py-2 text-sm font-medium capitalize text-foreground">
                            <span>{formatActionLabel(action)}</span>
                            <FormControl>
                              <Checkbox
                                className="h-5 w-5"
                                checked={Boolean(field.value && permission)}
                                disabled={!permission}
                                onCheckedChange={(checked) =>
                                  field.onChange(Boolean(checked))
                                }
                                aria-label={`${module} ${action}`}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  return (
    <>
      {renderTable()}
      {renderAccordion()}
    </>
  );
};

const RoleDialog = ({
  open,
  onOpenChange,
  selectedRole,
  metadata,
  onSubmit,
  isSaving,
}) => {
  const form = useForm({
    defaultValues: buildFormValues(metadata, selectedRole),
  });

  useEffect(() => {
    if (open) {
      form.reset(buildFormValues(metadata, selectedRole));
    }
  }, [open, selectedRole, metadata, form]);

  const handleSubmit = async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-full max-w-full flex-col rounded-t-3xl border border-border/40 bg-background p-0 text-foreground sm:max-w-3xl sm:rounded-2xl">
        <Form {...form}>
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
              <DialogTitle>
                {selectedRole ? "Edit Role" : "Add Role"}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Role name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Operations Admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Short summary of responsibilities"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <section className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4 dark:border-border/40 dark:bg-muted/10">
                <div>
                  <p className="text-sm font-semibold">Permission Matrix</p>
                  <p className="text-xs text-muted-foreground">
                    Toggle the permissions that should belong to this role.
                  </p>
                </div>
                <PermissionMatrix form={form} metadata={metadata} />
              </section>

              <div className="flex flex-row gap-3 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white sm:flex-none sm:w-auto sm:min-w-[120px]"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-none sm:w-auto sm:min-w-[120px]"
                  disabled={isSaving || !metadata.modules.length}
                >
                  {isSaving
                    ? "Saving..."
                    : selectedRole
                    ? "Save Changes"
                    : "Create Role"}
                </Button>
              </div>
            </form>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const RolesModule = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const roles = useSelector(selectRoles);
  const status = useSelector(selectRolesStatus);
  const permissionsStatus = useSelector(selectPermissionsStatus);
  const metadata = useSelector(selectPermissionMetadata);
  const mutationStatus = useSelector((state) => state.roles.mutationStatus);
  const error = useSelector((state) => state.roles.error);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchRoles());
    }
    if (permissionsStatus === "idle") {
      dispatch(fetchPermissions({ page_size: 200 }));
    }
  }, [dispatch, status, permissionsStatus]);

  const handleDialog = useCallback((role = null) => {
    setSelectedRole(role);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (role) => {
      if (!window.confirm(`Delete role "${role.name}"?`)) return;
      try {
        await dispatch(deleteRole(role.id)).unwrap();
        toast({
          title: "Role removed",
          description: `${role.name} has been deleted.`,
        });
        dispatch(getCurrentUser());
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Unable to delete role",
          description: err?.message || "Please try again.",
        });
      }
    },
    [dispatch, toast]
  );

  const handleSubmitRole = useCallback(
    async (values) => {
      try {
        if (selectedRole?.id) {
          // Update role name and description separately
          const roleUpdatePayload = {
            name: values.name.trim(),
            description: values.description?.trim() || null,
          };

          // Update permissions separately using the dedicated endpoint
          const permissionIds = extractPermissionIds(
            metadata,
            values.permissions
          );

          // Update role details first
          await dispatch(
            updateRoleRequest({ id: selectedRole.id, data: roleUpdatePayload })
          ).unwrap();

          // Then update permissions using the dedicated permissions endpoint
          await rolesApi.updatePermissions(selectedRole.id, permissionIds);

          toast({
            title: "Role updated",
            description: `${values.name} has been updated.`,
          });
        } else {
          // For new roles, create with permissions in one call
          const payload = {
            name: values.name.trim(),
            description: values.description?.trim() || null,
            permission_ids: extractPermissionIds(metadata, values.permissions),
          };
          await dispatch(createRole(payload)).unwrap();
          toast({
            title: "Role created",
            description: `${values.name} is now available.`,
          });
        }
        dispatch(getCurrentUser());
        // Refresh roles list to get updated data
        dispatch(fetchRoles());
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Unable to save role",
          description: err?.message || "Please try again.",
        });
        throw err;
      }
    },
    [dispatch, metadata, selectedRole, toast]
  );

  const tableData = useMemo(
    () =>
      roles.map((role) => {
        const permissionsCount = role.permissions?.length ?? 0;
        const moduleSet = new Set(
          (role.permissions || []).map((perm) => perm.module || "general")
        );
        const permissionPreview = (role.permissions || [])
          .slice(0, 3)
          .map((perm) => perm.code || perm.module || "permission");
        return {
          id: role.id,
          name: role.name,
          description: role.description || "—",
          code: role.code,
          permissionsCount,
          modulesVisible: moduleSet.size,
          userCount: role.user_count ?? 0,
          permissionPreview,
          original: role,
        };
      }),
    [roles]
  );

  const columns = [
    {
      key: "name",
      label: "Role",
      sortable: true,
      className: "min-w-[200px]",
      render: (value, row) => (
        <div className="space-y-1">
          <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
          {row.code ? (
            <Badge
              variant="secondary"
              className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
            >
              {row.code}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      className: "min-w-[220px]",
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-300">{value}</span>
      ),
    },
    {
      key: "permissionsCount",
      label: "Permissions",
      sortable: true,
      className: "min-w-[160px]",
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.permissionPreview.map((code) => (
            <Badge
              key={`${row.id}-${code}`}
              variant="secondary"
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {code}
            </Badge>
          ))}
          {row.permissionsCount > row.permissionPreview.length ? (
            <Badge
              variant="outline"
              className="rounded-full px-2 py-0.5 text-[11px]"
            >
              +{row.permissionsCount - row.permissionPreview.length}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: "userCount",
      label: "Users",
      sortable: true,
      className: "text-center",
    },
  ];

  const renderCard = (row) => (
    <DynamicCardView
      title={row.name}
      subtitle={`${row.modulesVisible} modules`}
      avatar={false}
      icon={Shield}
      fields={[
        { label: "Description", value: row.description },
        { label: "Permissions", value: row.permissionsCount },
        { label: "Users", value: row.userCount },
        {
          label: "Preview",
          value: (
            <div className="flex flex-wrap gap-1">
              {row.permissionPreview.map((code) => (
                <Badge
                  key={`${row.id}-card-${code}`}
                  variant="secondary"
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {code}
                </Badge>
              ))}
            </div>
          ),
        },
      ]}
      actions={["edit", "delete"]}
      onEdit={() => handleDialog(row.original)}
      onDelete={() => handleDelete(row.original)}
      compact
    />
  );

  const isLoading = status === "loading" || permissionsStatus === "loading";
  const isSaving =
    mutationStatus.create === "loading" || mutationStatus.update === "loading";

  return (
    <div className="space-y-6">
      <div className="">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 w-full animate-pulse rounded-xl bg-muted/50 dark:bg-muted/20"
              />
            ))}
          </div>
        ) : tableData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {error || "No roles found. Use “Add Role” to create the first one."}
          </div>
        ) : (
          <DataTable
            data={tableData}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search roles..."
            pageSize={10}
            showSearch
            showPagination
            renderCard={renderCard}
            toolbarActions={
              <Button
                className="h-[38px] gap-2 px-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium rounded-lg hover:bg-[hsl(var(--primary)/0.9)]"
                onClick={() => handleDialog(null)}
                disabled={permissionsStatus === "loading"}
              >
                <Plus className="h-4 w-4" />
                Add Role
              </Button>
            }
            onEdit={(row) => handleDialog(row.original)}
            onDelete={(row) => handleDelete(row.original)}
            actionsLabel="Actions"
          />
        )}
      </div>

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedRole={selectedRole}
        metadata={metadata}
        onSubmit={handleSubmitRole}
        isSaving={isSaving}
      />
    </div>
  );
};

export default RolesModule;
