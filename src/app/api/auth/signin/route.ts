import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    // Find the most recent active run registration for this email
    const result = await client.query(
      `SELECT r.id, r.run_id, r.password_hash
       FROM riders r
       JOIN runs ru ON ru.id = r.run_id
       WHERE r.email = $1 AND ru.status != 'complete'
       ORDER BY r.registered_at DESC
       LIMIT 1`,
      [email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const rider = result.rows[0];
    const valid = await bcrypt.compare(password, rider.password_hash);

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session_token = signToken({ rider_id: rider.id, run_id: rider.run_id });
    return NextResponse.json({ rider_id: rider.id, session_token });
  } finally {
    client.release();
  }
}
