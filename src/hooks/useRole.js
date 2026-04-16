import { useAuth } from "../context/AuthContext";
import { can, ROLES, getRoleMeta } from "../utils/roles";

/**
 * useRole — convenience hook for RBAC checks inside components.
 *
 * Usage:
 *   const { isAdmin, isFounder, can: canDo, role } = useRole();
 *   if (canDo("canCreateStartup")) { ... }
 *   {isAdmin && <DeleteButton />}
 */
export function useRole() {
  const { role } = useAuth();

  return {
    role,
    meta:      getRoleMeta(role),
    isAdmin:   role === ROLES.ADMIN,
    isFounder: role === ROLES.FOUNDER,
    isUser:    role === ROLES.USER,
    can:       (feature) => can(role, feature),
    hasRole:   (r) => role?.toUpperCase() === r?.toUpperCase(),
    hasAnyRole:(roles) => roles.map((r) => r.toUpperCase()).includes(role?.toUpperCase()),
  };
}