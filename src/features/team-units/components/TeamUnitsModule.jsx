import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useResponsive } from "@/hooks/useResponsive.js";
import { TeamUnitsTree } from "./TeamUnitsTree.jsx";
import { TeamUnitDrawer } from "./TeamUnitDrawer.jsx";
import { AddUnitModal } from "./AddUnitModal.jsx";
import { AddMemberModal } from "./AddMemberModal.jsx";
import {
  assignMembersToUnit,
  createTeamUnit,
  deleteTeamUnit,
  fetchAssignableUsers,
  fetchTeamUnitMembers,
  fetchTeamUnitsTree,
  removeMemberFromUnit,
  updateTeamUnit,
} from "../slices/teamUnitsSlice.js";
import { buildUnitTree, collectAncestorIds } from "../utils/unitHierarchy.js";
import { useToast } from "@/hooks/use-toast.js";

export const TeamUnitsModule = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { isMobile } = useResponsive();
  const {
    list: flatUnits,
    status,
    membersByUnit,
    membersStatus,
    assignableUsers,
    mutationStatus,
  } = useSelector((state) => state.teamUnits);
  const usersState = useSelector((state) => state.users?.users || []);
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [unitModalMode, setUnitModalMode] = useState("create");
  const [unitModalParent, setUnitModalParent] = useState(null);
  const [unitModalInitialValues, setUnitModalInitialValues] = useState({
    name: "",
    description: "",
  });
  const [unitModalTargetId, setUnitModalTargetId] = useState(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberModalTarget, setMemberModalTarget] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTeamUnitsTree());
    }
    dispatch(fetchAssignableUsers({ limit: 100 }));
  }, [dispatch, status]);

  useEffect(() => {
    if (
      selectedUnitId &&
      !membersByUnit[selectedUnitId] &&
      membersStatus[selectedUnitId] !== "loading"
    ) {
      dispatch(fetchTeamUnitMembers(selectedUnitId));
    }
  }, [dispatch, selectedUnitId, membersByUnit, membersStatus]);

  const mergeMembers = useCallback(
    (unit) => {
      if (!unit) return null;
      const members = membersByUnit[unit.id] || unit.members || [];
      return { ...unit, members };
    },
    [membersByUnit]
  );

  const treeData = useMemo(() => {
    const baseUnits = flatUnits.map((unit) => mergeMembers(unit));
    return buildUnitTree(baseUnits, membersByUnit);
  }, [flatUnits, membersByUnit, mergeMembers]);

  const selectedUnit = useMemo(() => {
    const unit = flatUnits.find((u) => u.id === selectedUnitId);
    return mergeMembers(unit);
  }, [flatUnits, selectedUnitId, mergeMembers]);

  const filteredTreeData = useMemo(() => {
    if (!searchTerm.trim()) return treeData;
    const term = searchTerm.toLowerCase();
    const filterNodes = (nodes) =>
      nodes
        .map((node) => {
          const children = filterNodes(node.children || []);
          const matches = node.name?.toLowerCase().includes(term);
          if (matches || children.length) {
            return { ...node, children };
          }
          return null;
        })
        .filter(Boolean);
    return filterNodes(treeData);
  }, [treeData, searchTerm]);

  useEffect(() => {
    if (!memberModalOpen) {
      setMemberModalTarget(null);
    }
  }, [memberModalOpen]);

  const formattedAssignableUsers = useMemo(() => {
    if (assignableUsers.length) {
      return assignableUsers;
    }
    return usersState.map((user) => ({
      id: user.id,
      name: user.name || user.fullName || user.email,
      email: user.email,
      avatar: user.avatar,
    }));
  }, [assignableUsers, usersState]);

  const targetUnitForMembers = memberModalTarget || selectedUnit;

  const availableUsers = useMemo(() => {
    if (!targetUnitForMembers) return formattedAssignableUsers;
    const assigned = new Set(
      (targetUnitForMembers.members || []).map((member) => member.id)
    );
    return formattedAssignableUsers.filter((user) => !assigned.has(user.id));
  }, [formattedAssignableUsers, targetUnitForMembers]);

  const openUnitModal = (
    mode,
    {
      parent = null,
      initialValues = { name: "", description: "" },
      targetId = null,
    } = {}
  ) => {
    setUnitModalMode(mode);
    setUnitModalParent(parent);
    setUnitModalInitialValues(initialValues);
    setUnitModalTargetId(targetId);
    setUnitModalOpen(true);
  };

  const handleAddRoot = () => openUnitModal("create");

  const handleAddSubUnit = (unit) => openUnitModal("create", { parent: unit });

  const handleEditUnit = (unit) =>
    openUnitModal("edit", {
      targetId: unit.id,
      initialValues: { name: unit.name, description: unit.description || "" },
    });

  const handleDeleteUnit = async (unit) => {
    if (!window.confirm(`Delete unit "${unit.name}" and its sub-units?`))
      return;
    try {
      await dispatch(deleteTeamUnit(unit.id)).unwrap();
      toast({
        title: "Team unit deleted",
        description: `${unit.name} has been removed.`,
      });
      if (selectedUnitId === unit.id) {
        setSelectedUnitId(null);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to delete unit",
        description: err?.message || "Please try again.",
      });
    }
  };

  const handleUnitModalSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || "",
    };

    try {
      if (unitModalMode === "edit" && unitModalTargetId) {
        await dispatch(
          updateTeamUnit({ id: unitModalTargetId, data: payload })
        ).unwrap();
        toast({
          title: "Team unit updated",
          description: `${values.name} has been updated.`,
        });
      } else {
        await dispatch(
          createTeamUnit({
            ...payload,
            parent_id: unitModalParent?.id ?? null,
          })
        ).unwrap();
        toast({
          title: "Team unit created",
          description: `${values.name} has been added.`,
        });
      }
      setUnitModalOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to save unit",
        description: err?.message || "Please try again.",
      });
    }
  };

  const handleSelectUnit = (unitId) => {
    setSelectedUnitId(unitId);
    const ancestors = collectAncestorIds(treeData, unitId) || [];
    setExpandedIds((prev) => {
      const next = new Set(prev);
      ancestors.forEach((id) => next.add(id));
      next.add(unitId);
      return next;
    });
  };

  const toggleExpand = (unitId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const deselectUnit = () => setSelectedUnitId(null);

  const openMemberModalForUnit = useCallback(
    (unit) => {
      if (!unit) return;
      setMemberModalTarget(mergeMembers(unit));
      setMemberModalOpen(true);
      if (!membersByUnit[unit.id] && membersStatus[unit.id] !== "loading") {
        dispatch(fetchTeamUnitMembers(unit.id));
      }
    },
    [dispatch, mergeMembers, membersByUnit, membersStatus]
  );

  const handleAddMember = async (user) => {
    const targetUnit = memberModalTarget || selectedUnit;
    if (!targetUnit) return;
    try {
      await dispatch(
        assignMembersToUnit({ unitId: targetUnit.id, userIds: [user.id] })
      ).unwrap();
      toast({
        title: "Member added",
        description: `${user.name || user.email} assigned to ${
          targetUnit.name
        }.`,
      });
      setMemberModalOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to add member",
        description: err?.message || "Please try again.",
      });
    }
  };

  const handleRemoveMember = async (unitId, memberId) => {
    try {
      await dispatch(
        removeMemberFromUnit({ unitId, userId: memberId })
      ).unwrap();
      toast({
        title: "Member removed",
        description: "User removed from the team unit.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to remove member",
        description: err?.message || "Please try again.",
      });
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--primary))]" />
            <Input
              placeholder="Search units..."
              className="h-[38px] w-full rounded-lg border border-border bg-background pl-10 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Button
            className="h-[38px] gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto w-full"
            onClick={handleAddRoot}
            disabled={mutationStatus.create === "loading"}
          >
            <Plus className="h-4 w-4" />
            Add Unit
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-14 w-full animate-pulse rounded-2xl border border-dashed border-border/70"
            />
          ))}
        </div>
      ) : (
        <TeamUnitsTree
          units={filteredTreeData}
          selectedUnitId={selectedUnitId}
          expandedIds={expandedIds}
          onToggle={(unitId) => toggleExpand(unitId)}
          onSelect={handleSelectUnit}
          onAddChild={handleAddSubUnit}
          onAddMember={openMemberModalForUnit}
          onEdit={handleEditUnit}
          onDelete={handleDeleteUnit}
          isMobile={isMobile}
        />
      )}

      <TeamUnitDrawer
        open={Boolean(selectedUnit)}
        unit={selectedUnit}
        onClose={deselectUnit}
        onAddMemberClick={() => openMemberModalForUnit(selectedUnit)}
        onRemoveMember={handleRemoveMember}
        loadingState={membersStatus[selectedUnitId]}
      />

      <AddUnitModal
        open={unitModalOpen}
        mode={unitModalMode}
        parentUnit={unitModalParent}
        initialValues={unitModalInitialValues}
        onSubmit={handleUnitModalSubmit}
        onOpenChange={setUnitModalOpen}
      />

      <AddMemberModal
        open={memberModalOpen}
        onOpenChange={setMemberModalOpen}
        users={availableUsers}
        unitName={memberModalTarget?.name || selectedUnit?.name}
        onSelectUser={handleAddMember}
      />
    </div>
  );
};

export default TeamUnitsModule;
