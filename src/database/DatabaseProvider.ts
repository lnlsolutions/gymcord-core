import type { DatabaseProviderConfig, DatabaseProviderKind } from "../config/database";
import type { DatabaseClient } from "./DatabaseClient";
import type { DatabaseHealthSnapshot } from "./DatabaseHealth";
import type { DatabaseMigration } from "./DatabaseMigration";
import type { DatabaseSchema } from "./DatabaseSchema";
import type { DatabaseSeeder } from "./DatabaseSeeder";

export interface DatabaseProviderCapabilities {
  transactions: boolean;
  realtime: boolean;
  offlinePersistence: boolean;
  migrations: boolean;
  serverTimestamps: boolean;
}

export interface DatabaseProvider {
  readonly kind: DatabaseProviderKind;
  readonly config: DatabaseProviderConfig;
  readonly capabilities: DatabaseProviderCapabilities;
  connect(): Promise<DatabaseClient>;
  disconnect(): Promise<void>;
  health(): Promise<DatabaseHealthSnapshot>;
  migrate?(migrations: DatabaseMigration[], schema: DatabaseSchema): Promise<void>;
  seed?(seeder: DatabaseSeeder): Promise<void>;
}

export interface SupabaseDatabaseProvider extends DatabaseProvider { readonly kind: "supabase"; }
export interface FirebaseDatabaseProvider extends DatabaseProvider { readonly kind: "firebase"; }
export interface PostgresDatabaseProvider extends DatabaseProvider { readonly kind: "postgres"; }
export interface SQLiteDatabaseProvider extends DatabaseProvider { readonly kind: "sqlite"; }
export interface MockDatabaseProvider extends DatabaseProvider { readonly kind: "mock"; }
