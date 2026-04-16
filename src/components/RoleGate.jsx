import { useRole } from "../hooks/useRole";

/**
 * RoleGate — conditionally renders children based on role or feature flag.
 * Does NOT redirect — just shows/hides content.
 *
 * Usage:
 *   <RoleGate roles={["ADMIN"]}>
 *     <DeleteButton />
 *   </RoleGate>
 *
 *   <RoleGate feature="canCreateStartup">
 *     <CreateStartupButton />
 *   </RoleGate>
 *
 *   <RoleGate roles={["ADMIN"]} fallback={<span>Admins only</span>}>
 *     <AdminWidget />
 *   </RoleGate>
 */
export default function RoleGate({ children, roles, feature, fallback = null }) {
  const { role, can } = useRole();

  if (feature) {
    return can(feature) ? children : fallback;
  }

  if (roles && roles.length > 0) {
    const allowed = roles.map((r) => r.toUpperCase());
    return allowed.includes(role?.toUpperCase()) ? children : fallback;
  }

  return children;
}