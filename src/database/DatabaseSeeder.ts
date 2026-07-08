import type { DatabaseClient } from "./DatabaseClient";

export interface DatabaseSeedRecord<TRecord = unknown> {
  collection: string;
  id: string;
  value: TRecord;
}

export interface DatabaseSeeder {
  id: string;
  description: string;
  records: DatabaseSeedRecord[];
  run(client: DatabaseClient): Promise<void>;
}
