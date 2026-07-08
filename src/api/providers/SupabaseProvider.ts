import { SupabaseDatabaseProvider } from "../../providers/supabase";

export class SupabaseProvider extends SupabaseDatabaseProvider {
  constructor(_url?: string, _anonKey?: string) {
    super();
  }
}
