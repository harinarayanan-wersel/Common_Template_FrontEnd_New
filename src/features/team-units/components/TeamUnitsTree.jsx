import { memo } from "react";
import { TeamUnitNode } from "./TeamUnitNode.jsx";

const renderNodes = ({
  nodes,
  depth,
  selectedUnitId,
  expandedIds,
  onToggle,
  onSelect,
  onAddChild,
  onAddMember,
  onEdit,
  onDelete,
  isMobile,
}) =>
  nodes.map((node) => (
    <div key={node.id} className="space-y-1">
      <TeamUnitNode
        node={node}
        depth={depth}
        isSelected={selectedUnitId === node.id}
        isExpanded={expandedIds.has(node.id)}
        onToggle={() => onToggle?.(node.id)}
        onSelect={() => onSelect?.(node.id)}
        onAddChild={onAddChild}
        onAddMember={onAddMember}
        onEdit={onEdit}
        onDelete={onDelete}
        isMobile={isMobile}
      />
      {node.children?.length && expandedIds.has(node.id)
        ? renderNodes({
            nodes: node.children,
            depth: depth + 1,
            selectedUnitId,
            expandedIds,
            onToggle,
            onSelect,
            onAddChild,
            onAddMember,
            onEdit,
            onDelete,
            isMobile,
          })
        : null}
    </div>
  ));

export const TeamUnitsTree = memo(
  ({
    units = [],
    selectedUnitId,
    expandedIds,
    onToggle,
    onSelect,
    onAddChild,
    onEdit,
    onDelete,
    isMobile = false,
  }) => {
    if (!units.length) {
      return (
        <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No team units yet. Create your first unit to get started.
        </div>
      );
    }

    return (
      <div className={isMobile ? "space-y-2" : "space-y-1"}>
        {renderNodes({
          nodes: units,
          depth: 0,
          selectedUnitId,
          expandedIds,
          onToggle,
          onSelect,
          onAddChild,
          onEdit,
          onDelete,
          isMobile,
        })}
      </div>
    );
  }
);

TeamUnitsTree.displayName = "TeamUnitsTree";

export default TeamUnitsTree;


