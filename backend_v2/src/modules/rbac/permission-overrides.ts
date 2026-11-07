export interface PermissionOverride {
  permission: string;
  granted: boolean;
}

/** Role permissions + per-member overrides (grants add, revokes remove). */
export function applyPermissionOverrides(
  rolePermissions: string[],
  overrides: PermissionOverride[],
): string[] {
  const result = new Set(rolePermissions);
  for (const o of overrides) {
    if (o.granted) result.add(o.permission);
    else result.delete(o.permission);
  }
  return Array.from(result);
}
