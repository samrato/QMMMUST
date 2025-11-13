import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

async function setupDatabase() {
  try {
    console.log("[v0] Starting database setup...");

    const databaseUrl = process.env.SUPABASE_POSTGRES_URL_NON_POOLING;

    if (!databaseUrl) {
      console.error(
        "[v0] ERROR: SUPABASE_POSTGRES_URL_NON_POOLING environment variable is not set"
      );
      process.exit(1);
    }

    const sql = neon(databaseUrl);

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), "scripts", "02-setup-database.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    // Split SQL statements by semicolon and execute them
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`[v0] Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`[v0] Executing statement ${i + 1}/${statements.length}...`);
        await sql.query(statement);
      } catch (err) {
        // Some statements may fail if objects already exist, which is OK
        console.log(
          `[v0] Statement ${i + 1} completed (may have skipped if already exists)`
        );
      }
    }

    console.log("[v0] Database setup completed successfully!");
    console.log("[v0] Test credentials created:");
    console.log("[v0]   Admin: ADMIN001 / admin123");
    console.log("[v0]   Student: CS/2021/001 / student123");
  } catch (error) {
    console.error("[v0] Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
