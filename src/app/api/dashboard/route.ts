import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

function bearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
}

export async function GET(req: NextRequest) {
  const token = bearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let claims;
  try {
    claims = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const [riderRes, stopsRes, checkinsRes] = await Promise.all([
      client.query(
        `SELECT r.id, r.name, r.email, r.club, r.ama_number, r.hand_rank, r.hand_label,
                ru.name AS run_name, ru.event_date, ru.status AS run_status
         FROM riders r JOIN runs ru ON ru.id = r.run_id
         WHERE r.id = $1`,
        [claims.rider_id]
      ),
      client.query(
        `SELECT id, stop_number, location_name, status
         FROM stops WHERE run_id = $1 ORDER BY stop_number ASC`,
        [claims.run_id]
      ),
      client.query(
        `SELECT c.stop_id, c.card_drawn, c.checked_in_at
         FROM checkins c WHERE c.rider_id = $1`,
        [claims.rider_id]
      ),
    ]);

    if (riderRes.rowCount === 0) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    return NextResponse.json({
      rider: riderRes.rows[0],
      stops: stopsRes.rows,
      checkins: checkinsRes.rows,
    });
  } finally {
    client.release();
  }
}
