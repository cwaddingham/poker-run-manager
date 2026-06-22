import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { run_id, name, email, password, club, ama_number, waiver_signed } =
    await req.json();

  if (!run_id || !name || !email || !password || !waiver_signed) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    // Verify run exists
    const runRes = await client.query(
      "SELECT id FROM runs WHERE id = $1 AND status != 'complete'",
      [run_id]
    );
    if (runRes.rowCount === 0) {
      return NextResponse.json({ error: "Run not found or closed" }, { status: 404 });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const result = await client.query(
      `INSERT INTO riders (run_id, name, email, password_hash, club, ama_number, waiver_signed)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [run_id, name, email, password_hash, club || null, ama_number || null, waiver_signed]
    );

    const rider_id = result.rows[0].id;
    const session_token = signToken({ rider_id, run_id });

    return NextResponse.json({ rider_id, session_token }, { status: 201 });
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === "23505") {
      return NextResponse.json(
        { error: "Email already registered for this run" },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}
