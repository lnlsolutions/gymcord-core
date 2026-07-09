import { Card, Rows, ruleRows, type TenancyPanelProps } from "./TenancyShared";
export function DataAccessRulesPanel({ snapshot }: TenancyPanelProps) { return <Card title="Data access rules"><Rows rows={ruleRows(snapshot.dataAccessRules)} /></Card>; }
