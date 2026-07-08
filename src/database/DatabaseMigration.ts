export type MigrationDirection = "up" | "down";

export interface DatabaseMigrationContext {
  provider: string;
  schema: string;
  execute(statement: string, parameters?: unknown[]): Promise<void>;
}

export interface DatabaseMigration {
  id: string;
  name: string;
  version: number;
  checksum: string;
  appliedAt?: string;
  up(context: DatabaseMigrationContext): Promise<void>;
  down(context: DatabaseMigrationContext): Promise<void>;
}
