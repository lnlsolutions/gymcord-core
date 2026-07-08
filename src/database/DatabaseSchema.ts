export type DatabaseFieldType = "string" | "number" | "boolean" | "json" | "date" | "datetime" | "relation";

export interface DatabaseFieldSchema {
  name: string;
  type: DatabaseFieldType;
  required: boolean;
  indexed?: boolean;
  unique?: boolean;
  references?: { collection: string; field: string };
}

export interface DatabaseCollectionSchema {
  name: string;
  primaryKey: string;
  fields: DatabaseFieldSchema[];
  indexes: Array<{ name: string; fields: string[]; unique?: boolean }>;
}

export interface DatabaseSchema {
  version: number;
  collections: DatabaseCollectionSchema[];
}

export const gymcordDatabaseSchema: DatabaseSchema = {
  version: 1,
  collections: ["users", "workouts", "exercises", "missions", "progress", "nutrition", "organizations", "trainers", "notifications", "atlas", "analytics"].map((name) => ({
    name,
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", required: true, indexed: true, unique: true },
      { name: "organizationId", type: "string", required: false, indexed: true },
      { name: "createdAt", type: "datetime", required: true, indexed: true },
      { name: "updatedAt", type: "datetime", required: true, indexed: true },
    ],
    indexes: [{ name: `${name}_organization_idx`, fields: ["organizationId"] }],
  })),
};
