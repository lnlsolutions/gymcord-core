import { Card, Rows, type TenancyPanelProps } from "./TenancyShared";
export function RolePermissionPanel({ snapshot }: TenancyPanelProps) { const brand = snapshot.branding[1] ?? snapshot.branding[0]; return <Card title="Role permissions"><Rows rows={Object.entries(brand.rolePermissions).map(([role, permissions]) => ({ label: role, value: permissions.join(", ") }))} /></Card>; }
