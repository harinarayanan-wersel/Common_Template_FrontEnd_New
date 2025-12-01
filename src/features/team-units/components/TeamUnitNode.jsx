import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Folder, Pencil, Plus, Trash2, UserPlus } from "lucide-react";

export const TeamUnitNode = ({
  node,
  depth = 0,
  isSelected = false,
  isExpanded = false,
  onToggle,
  onSelect,
  onAddChild,
  onAddMember,
  onEdit,
  onDelete,
  isMobile = false,
}) => {
  const hasChildren = node.children?.length > 0;

  const handleRowClick = () => {
    onSelect?.(node);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-2xl border border-transparent px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/60 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5 sm:flex-row sm:items-center sm:justify-between",
        isSelected && "border-blue-500/60 bg-blue-50 dark:border-blue-400/70 dark:bg-blue-500/10"
      )}
      style={{ paddingLeft: depth * 16 + 8 }}
    >
      <div className="flex items-center gap-2">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => onToggle?.(node)}
            aria-label={isExpanded ? "Collapse unit" : "Expand unit"}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <span className="h-6 w-6" />
        )}
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={handleRowClick}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleRowClick();
            }
          }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-200">
            <Folder className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">{node.name}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{node.description || "No description"}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onAddMember?.(node)}
          aria-label="Add member"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onAddChild?.(node)}
          aria-label="Add sub-unit"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit?.(node)}
          aria-label="Edit unit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive/80"
          onClick={() => onDelete?.(node)}
          aria-label="Delete unit"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TeamUnitNode;


