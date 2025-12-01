export const getRootUnits = (units = []) => units.filter((unit) => unit.parentId == null);

export const getChildUnits = (units = [], parentId) => {
  if (!parentId) return [];
  return units.filter((unit) => unit.parentId === parentId);
};

const cloneMember = (member) => ({
  id: member.id,
  name: member.name,
  email: member.email,
  avatar: member.avatar || "",
  verified: Boolean(member.verified),
});

export const cloneUnitNode = (unit) => ({
  id: unit.id,
  name: unit.name,
  description: unit.description || "",
  parentId: unit.parentId ?? null,
  members: Array.isArray(unit.members) ? unit.members.map(cloneMember) : [],
  children: Array.isArray(unit.children) ? unit.children.map((child) => cloneUnitNode(child)) : [],
});

export const buildUnitTree = (units = [], membersByUnit = {}) => {
  const nodeMap = new Map();
  units.forEach((unit) => {
    nodeMap.set(unit.id, {
      id: unit.id,
      name: unit.name,
      description: unit.description || "",
      parentId: unit.parentId ?? null,
      members: (membersByUnit[unit.id] || unit.members || []).map(cloneMember),
      children: [],
    });
  });

  const roots = [];
  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export const findUnitById = (units = [], unitId) => {
  for (const unit of units) {
    if (unit.id === unitId) {
      return unit;
    }
    if (unit.children?.length) {
      const match = findUnitById(unit.children, unitId);
      if (match) return match;
    }
  }
  return null;
};

export const updateUnitInTree = (nodes, unitId, updater) =>
  nodes.map((node) => {
    if (node.id === unitId) {
      return updater(node);
    }
    if (node.children?.length) {
      const updatedChildren = updateUnitInTree(node.children, unitId, updater);
      if (updatedChildren !== node.children) {
        return { ...node, children: updatedChildren };
      }
    }
    return node;
  });

export const addChildToTree = (nodes, parentId, childNode) =>
  nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...node.children, { ...childNode, parentId }],
      };
    }
    if (node.children?.length) {
      const updatedChildren = addChildToTree(node.children, parentId, childNode);
      if (updatedChildren !== node.children) {
        return { ...node, children: updatedChildren };
      }
    }
    return node;
  });

export const deleteUnitFromTree = (nodes, unitId) =>
  nodes
    .filter((node) => node.id !== unitId)
    .map((node) => {
      if (node.children?.length) {
        const updatedChildren = deleteUnitFromTree(node.children, unitId);
        if (updatedChildren !== node.children) {
          return { ...node, children: updatedChildren };
        }
      }
      return node;
    });

export const addMemberToUnit = (nodes, unitId, member) =>
  updateUnitInTree(nodes, unitId, (unit) => {
    if (unit.members.some((existing) => existing.id === member.id)) {
      return unit;
    }
    return {
      ...unit,
      members: [...unit.members, cloneMember(member)],
    };
  });

export const removeMemberFromUnit = (nodes, unitId, memberId) =>
  updateUnitInTree(nodes, unitId, (unit) => ({
    ...unit,
    members: unit.members.filter((member) => member.id !== memberId),
  }));

export const collectAncestorIds = (nodes, targetId, path = []) => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return path;
    }
    if (node.children?.length) {
      const result = collectAncestorIds(node.children, targetId, [...path, node.id]);
      if (result) {
        return result;
      }
    }
  }
  return null;
};


