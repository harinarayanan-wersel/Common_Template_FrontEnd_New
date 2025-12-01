import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast.js";
import {
  createUser,
  updateUser,
} from "@/features/users/slices/usersSlice.js";
import { fetchRoles } from "@/features/roles/slices/rolesSlice.js";

const generateEmployeeCode = () =>
  `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

const defaultValues = {
  firstName: "",
  lastName: "",
  employeeCode: generateEmployeeCode(),
  roleId: "",
  teamUnitId: "",
  email: "",
  password: "",
  phone: "",
  status: "active",
  profileImage: undefined,
};

const AddUserDialog = ({
  trigger,
  mode = "create",
  initialData = null,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const roles = useSelector((state) => state.roles.list);
  const rolesStatus = useSelector((state) => state.roles.status);
  const teamUnits = useSelector((state) => state.teamUnits.list);

  // Use controlled open if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = onOpenChange || setOpen;

  const form = useForm({
    defaultValues,
    mode: "onSubmit",
  });

  const watchFirstName = form.watch("firstName");
  const watchLastName = form.watch("lastName");
  const rolesAvailable = roles ?? [];
  const teamUnitsAvailable = teamUnits ?? [];

  const initials = useMemo(() => {
    const first = watchFirstName?.[0] ?? "";
    const last = watchLastName?.[0] ?? "";
    const letters = `${first}${last}`.trim();
    return letters ? letters.toUpperCase() : "HM";
  }, [watchFirstName, watchLastName]);

  // Handle form reset when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (rolesStatus === "idle") {
        dispatch(fetchRoles());
      }
      if (mode === "edit" && initialData) {
        const firstName =
          initialData.first_name ||
          initialData.firstName ||
          initialData.name?.split(" ")[0] ||
          "";
        const lastName =
          initialData.last_name ||
          initialData.lastName ||
          (initialData.name
            ? initialData.name.split(" ").slice(1).join(" ")
            : "") ||
          "";

        // Find roleId from role name
        const role = rolesAvailable.find(
          (r) =>
            r.name === initialData.role ||
            r.id === initialData.roleId ||
            String(r.id) === String(initialData.roleId)
        );
        const roleId = role?.id
          ? String(role.id)
          : initialData.roleId
          ? String(initialData.roleId)
          : "";

        // Find teamUnitId from teamUnit name
        const teamUnit = teamUnitsAvailable.find(
          (u) =>
            u.name === initialData.teamUnit ||
            u.id === initialData.teamUnitId ||
            String(u.id) === String(initialData.teamUnitId)
        );
        const teamUnitId = teamUnit?.id
          ? String(teamUnit.id)
          : initialData.teamUnitId
          ? String(initialData.teamUnitId)
          : "";

        // Don't set photoPreview for existing images - they'll be shown via initialData
        setPhotoPreview(null);

        form.reset({
          firstName,
          lastName,
          employeeCode: initialData.employeeCode || initialData.userId || "",
          roleId,
          teamUnitId,
          email: initialData.email || "",
          phone: initialData.phone || initialData.phoneNumber || "",
          status: initialData.is_active
            ? "active"
            : initialData.status || "inactive",
          profileImage: undefined, // Don't set file object, existing image shown via initialData
          id: initialData.id,
        });
      } else {
        // Create mode - reset to defaults
        setPhotoPreview(null);
        form.reset({
          ...defaultValues,
          employeeCode: generateEmployeeCode(),
        });
      }
    }
  }, [isOpen, mode, initialData, form, rolesAvailable, teamUnitsAvailable, rolesStatus, dispatch]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleImageChange = (event, onChange) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });
    onChange(file);
  };

  const buildPayload = (values) => {
    const trimmedEmail = values.email?.trim();
    const trimmedPassword = values.password?.trim();
    const trimmedFirst = values.firstName?.trim();
    const trimmedLast = values.lastName?.trim();
    const trimmedPhone = values.phone?.trim();

    const roleIdValue = values.roleId
      ? parseInt(values.roleId, 10)
      : undefined;

    const payload = {
      email: trimmedEmail,
      password: trimmedPassword || undefined,
      first_name: trimmedFirst || undefined,
      last_name: trimmedLast || undefined,
      phone: trimmedPhone || undefined,
      is_active: values.status === "active",
    };

    if (Number.isInteger(roleIdValue)) {
      payload.role_ids = [roleIdValue];
    }

    return Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== undefined && value !== null
      )
    );
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (mode === "edit" && initialData?.id) {
        await dispatch(
          updateUser({ id: initialData.id, data: buildPayload(values) })
        ).unwrap();
        toast({
          title: "User updated",
          description: "Changes have been saved successfully.",
        });
      } else {
        await dispatch(createUser(buildPayload(values))).unwrap();
        toast({
          title: "User created",
          description: "The new user has been added.",
        });
      }

      if (onSuccess) {
        onSuccess();
      }

      setIsOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to save user",
        description: error?.message || "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="w-full max-w-3xl rounded-2xl border border-border bg-background shadow-xl shadow-black/5 p-0 overflow-hidden sm:overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border/70 bg-background px-8 py-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {mode === "edit" ? "Edit User" : "Add New User"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="text-muted-foreground hover:text-[hsl(var(--primary))] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="max-h-[calc(85vh-120px)] overflow-y-auto px-8 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    rules={{ required: "First name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter first name" 
                            className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] transition-all"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">Last Name (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter last name" 
                            className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] transition-all"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-muted-foreground">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {mode === "create" && (
                    <FormField
                      control={form.control}
                      name="password"
                      rules={{
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-medium text-muted-foreground">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password"
                              className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="roleId"
                    rules={{ required: "Role is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">Role</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:ring-[hsl(var(--primary)/0.2)]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {rolesAvailable.map((role) => (
                                <SelectItem
                                  key={role.id}
                                  value={String(role.id)}
                                >
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teamUnitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">Team Unit</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:ring-[hsl(var(--primary)/0.2)]">
                              <SelectValue placeholder="Select team unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamUnitsAvailable.map((unit) => (
                                <SelectItem
                                  key={unit.id}
                                  value={String(unit.id)}
                                >
                                  {unit.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employeeCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">Employee Code</FormLabel>
                        <FormControl>
                          <Input 
                            readOnly={mode === "edit"} 
                            className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] transition-all"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">Status</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:ring-[hsl(var(--primary)/0.2)]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-muted-foreground">Profile Image</FormLabel>
                        <FormControl>
                          <div className="border border-border bg-muted/40 rounded-xl p-6 flex items-center gap-6 hover:bg-muted/60 transition">
                            <Avatar className="w-16 h-16 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-lg font-semibold">
                              {photoPreview ? (
                                <AvatarImage src={photoPreview} alt="Preview" />
                              ) : mode === "edit" &&
                                initialData?.profileImage ? (
                                <AvatarImage
                                  src={initialData.profileImage}
                                  alt="Current"
                                />
                              ) : mode === "edit" && initialData?.avatar ? (
                                <AvatarImage
                                  src={initialData.avatar}
                                  alt="Current"
                                />
                              ) : null}
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-2 flex-1">
                              <Button
                                type="button"
                                variant="outline"
                                className="bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] font-medium rounded-lg px-4 py-2 border border-[hsl(var(--primary)/0.2)] hover:bg-[hsl(var(--primary)/0.2)] transition gap-2 w-fit"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="h-4 w-4" />
                                Upload Image
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG, or WEBP up to 2MB.
                              </p>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) =>
                                handleImageChange(event, field.onChange)
                              }
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-muted-foreground">Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 555 000 0000"
                            className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] transition-all w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              <div className="border-t border-border/70 pt-4 mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white font-medium px-6 py-2 rounded-lg shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : mode === "edit"
                    ? "Update User"
                    : "Save User"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
