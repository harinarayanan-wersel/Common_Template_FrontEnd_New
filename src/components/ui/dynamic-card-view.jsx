import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, Pencil, Trash2, Archive, User2 } from "lucide-react";

const ACTION_ICON_MAP = {
  view: Eye,
  edit: Pencil,
  delete: Trash2,
  archive: Archive,
};

const ACTION_HANDLER_MAP = {
  view: "onView",
  edit: "onEdit",
  delete: "onDelete",
  archive: "onArchive",
};

export const DynamicCardView = ({
  title,
  subtitle,
  avatar = true,
  avatarSrc,
  icon: Icon,
  fields = [],
  actions = [],
  compact = false,
  onView,
  onEdit,
  onDelete,
  onArchive,
  className,
}) => {
  const initials = title
    ?.split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasActions = Array.isArray(actions) && actions.length > 0;

  const renderAvatarOrIcon = () => {
    if (!avatar && Icon) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      );
    }

    if (!avatar) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User2 className="h-5 w-5" />
        </div>
      );
    }

    return (
      <Avatar className="h-12 w-12">
        {avatarSrc ? <AvatarImage src={avatarSrc} alt={title} /> : null}
        <AvatarFallback>{initials || "HM"}</AvatarFallback>
      </Avatar>
    );
  };

  return (
    <div
      className={cn(
        "group rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-accent/50",
        compact && "p-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {renderAvatarOrIcon()}
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">{title}</p>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>

        {hasActions && (
          <div className="flex items-center gap-2">
            {actions.map((action) => {
              const IconComponent = ACTION_ICON_MAP[action];
              const handlerName = ACTION_HANDLER_MAP[action];
              const handler = {
                onView,
                onEdit,
                onDelete,
                onArchive,
              }[handlerName];

              if (!IconComponent || typeof handler !== "function") {
                return null;
              }

              const actionClass =
                action === "delete"
                  ? "text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  : action === "archive"
                  ? "text-amber-500 hover:text-amber-400"
                  : "text-muted-foreground hover:text-foreground";

              return (
                <Button
                  key={action}
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", actionClass)}
                  onClick={(event) => {
                    event.stopPropagation();
                    handler();
                  }}
                  aria-label={action}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <dl className={cn("mt-4 grid gap-3 text-sm", compact ? "grid-cols-1" : "grid-cols-1")}>
          {fields.map(({ label, value }, index) => (
            <div key={`${label}-${index}`} className="space-y-0.5">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

export default DynamicCardView;

