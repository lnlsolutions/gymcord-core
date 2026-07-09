import { Card, Rows, brandRows, type TenancyPanelProps } from "./TenancyShared";
export function TenantBrandingPanel({ snapshot }: TenancyPanelProps) { return <Card title="Branding metadata"><Rows rows={brandRows(snapshot.branding)} /></Card>; }
