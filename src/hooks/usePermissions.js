import { useSelector } from "react-redux";
import { useCallback } from "react";

export const usePermissions = () => {
  const permissions = useSelector((state) => state.auth.finalPermissions || []);

  const hasPermission = useCallback(
    (code) => !!code && permissions.includes(code),
    [permissions]
  );

  return { permissions, hasPermission };
};

export const useHasPermission = (code) => {
  const { hasPermission } = usePermissions();
  return hasPermission(code);
};

