import { getSupabaseClient, requireSupabaseEnvironment } from "../../config/supabase";

export interface StorageUploadInput {
  path: string;
  file: File | Blob;
  contentType?: string;
  upsert?: boolean;
}

export class SupabaseStorageProvider {
  readonly name = "supabase-storage";

  async upload(input: StorageUploadInput): Promise<string> {
    const env = requireSupabaseEnvironment();
    const { data, error } = await getSupabaseClient().storage.from(env.storageBucket).upload(input.path, input.file, {
      contentType: input.contentType,
      upsert: input.upsert ?? true,
    });
    if (error) throw error;
    return this.getPublicUrl(data.path);
  }

  getPublicUrl(path: string): string {
    const env = requireSupabaseEnvironment();
    return getSupabaseClient().storage.from(env.storageBucket).getPublicUrl(path).data.publicUrl;
  }

  async remove(paths: string[]): Promise<void> {
    const env = requireSupabaseEnvironment();
    const { error } = await getSupabaseClient().storage.from(env.storageBucket).remove(paths);
    if (error) throw error;
  }
}
