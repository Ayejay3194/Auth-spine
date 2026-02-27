import { Pool } from "pg";

export function makePool(databaseUrl: string): Pool {
  return new Pool({ connectionString: databaseUrl });
}
