import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { checkInAtStop } from "@/lib/agents";

function bearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
}

export async function POST(req: NextRequest) {
  const token = bearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let claims;
  try {
    claims = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { stop_id } = await req.json();
  if (!stop_id) return NextResponse.json({ error: "stop_id required" }, { status: 400 });

  const client = await pool.connect();
  try {
    // Verify stop belongs to rider's run and is open
    const stopRes = await client.query(
      "SELECT id, stop_number, location_name FROM stops WHERE id = $1 AND run_id = $2 AND status = 'open'",
      [stop_id, claims.run_id]
    );
    if (stopRes.rowCount === 0) {
      return NextResponse.json({ error: "Stop not found or not open" }, { status: 404 });
    }

    // Check for duplicate check-in
    const dupRes = await client.query(
      "SELECT id, card_drawn FROM checkins WHERE rider_id = $1 AND stop_id = $2",
      [claims.rider_id, stop_id]
    );
    if (dupRes.rowCount && dupRes.rowCount > 0) {
      return NextResponse.json({
        already_checked_in: true,
        card_drawn: dupRes.rows[0].card_drawn,
        stop: stopRes.rows[0],
      });
    }

    // Call agent stub to get card assignment
    const { card_drawn, checked_in_at } = await checkInAtStop(stop_id, token);

    await client.query(
      `INSERT INTO checkins (rider_id, stop_id, card_drawn, checked_in_at)
       VALUES ($1, $2, $3, $4)`,
      [claims.rider_id, stop_id, card_drawn, checked_in_at]
    );

    return NextResponse.json({
      card_drawn,
      checked_in_at,
      stop: stopRes.rows[0],
    });
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === "23505") {
      return NextResponse.json({ error: "Already checked in at this stop" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}
