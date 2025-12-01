import { useCallback, useMemo, useState } from "react";

import {
  buildUnitTree,
  cloneUnitNode,
  findUnitById,
  addChildToTree,
  updateUnitInTree,
  deleteUnitFromTree,
  addMemberToUnit,
  removeMemberFromUnit,
  collectAncestorIds,
} from "../utils/unitHierarchy.js";

const createUnitNode = (payload) =>
  cloneUnitNode({
    id: payload.id || `unit-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}`,
    name: payload.name.trim(),
    description: payload.description?.trim() || "",
    parentId: payload.parentId ?? null,
    members: payload.members || [],
    children: payload.children || [],
  });

export const useTeamUnits = (initialUnits = [], initialMembersByUnit = {}) => {
  const [units, setUnits] = useState(() => buildUnitTree(initialUnits, initialMembersByUnit));
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const selectedUnit = useMemo(() => findUnitById(units, selectedUnitId), [units, selectedUnitId]);

  const toggleExpand = useCallback((unitId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  }, []);

  const selectUnit = useCallback(
    (unitId) => {
      setSelectedUnitId(unitId);
      if (!unitId) return;
      const ancestors = collectAncestorIds(units, unitId) || [];
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestors.forEach((id) => next.add(id));
        next.add(unitId);
        return next;
      });
    },
    [units]
  );

  const deselectUnit = useCallback(() => {
    setSelectedUnitId(null);
  }, []);

  const addRootUnit = useCallback((payload) => {
    setUnits((prev) => [...prev, createUnitNode({ ...payload, parentId: null })]);
  }, []);

  const addSubUnit = useCallback((parentId, payload) => {
    if (!parentId) return;
    setUnits((prev) => addChildToTree(prev, parentId, createUnitNode({ ...payload, parentId })));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });
  }, []);

  const updateUnit = useCallback((unitId, updates) => {
    setUnits((prev) =>
      updateUnitInTree(prev, unitId, (unit) => ({
        ...unit,
        ...updates,
        name: updates.name?.trim() || unit.name,
        description: updates.description?.trim() ?? unit.description,
      }))
    );
  }, []);

  const deleteUnit = useCallback(
    (unitId) => {
      setUnits((prev) => deleteUnitFromTree(prev, unitId));
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(unitId);
        return next;
      });
      setSelectedUnitId((current) => (current === unitId ? null : current));
    },
    []
  );

  const addMember = useCallback((unitId, member) => {
    setUnits((prev) => addMemberToUnit(prev, unitId, member));
  }, []);

  const removeMember = useCallback((unitId, memberId) => {
    setUnits((prev) => removeMemberFromUnit(prev, unitId, memberId));
  }, []);

  return {
    units,
    selectedUnit,
    selectedUnitId,
    expandedIds,
    selectUnit,
    deselectUnit,
    toggleExpand,
    addRootUnit,
    addSubUnit,
    updateUnit,
    deleteUnit,
    addMember,
    removeMember,
  };
};


