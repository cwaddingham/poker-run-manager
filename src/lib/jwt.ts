import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";

export interface RiderClaims {
  rider_id: string;
  run_id: string;
}

export function signToken(claims: RiderClaims): string {
  return jwt.sign(claims, SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): RiderClaims {
  return jwt.verify(token, SECRET) as RiderClaims;
}
