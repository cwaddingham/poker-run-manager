import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Returns upcoming/active runs for the registration form
export async function GET() {
  const result = await pool.query(
    "SELECT id, name, event_date, status FROM runs WHERE status != 'complete' ORDER BY event_date ASC"
  );
  return NextResponse.json(result.rows);
}
