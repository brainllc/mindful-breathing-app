import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js";
import { createClient } from "@supabase/supabase-js";

if (
  !process.env.DATABASE_URL ||
  !process.env.VITE_SUPABASE_URL ||
  !process.env.VITE_SUPABASE_ANON_KEY
) {
  throw new Error("Missing Supabase environment variables");
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  ssl: 'require',
  max: 1, // Limit connections for serverless
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
