// Guild.ai agent stubs — replace with real API calls in a future session

const MOCK_CARDS = [
  "AS", "KH", "QD", "JC", "10S",
  "9H", "8D", "7C", "6S", "5H",
  "4D", "3C", "2S", "AH", "KD",
];

function randomCard(): string {
  return MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
}

export interface RiderData {
  run_id: string;
  name: string;
  email: string;
  password_hash: string;
  club?: string;
  ama_number?: string;
}

export interface RegisterResult {
  rider_id: string;
  session_token: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function registerRider(_data: RiderData): Promise<RegisterResult> {
  // TODO: replace with Guild agent call
  throw new Error("registerRider stub — not for direct use; handled in API route");
}

export interface CheckInResult {
  card_drawn: string;
  checked_in_at: string;
}

export async function checkInAtStop(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _stop_id: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _session_token: string
): Promise<CheckInResult> {
  // TODO: replace with Guild agent call
  await new Promise((r) => setTimeout(r, 300)); // simulate latency
  return {
    card_drawn: randomCard(),
    checked_in_at: new Date().toISOString(),
  };
}

export interface HandResult {
  hand_rank: number;
  hand_label: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function validateHand(_rider_id: string): Promise<HandResult> {
  // TODO: replace with Guild agent call
  await new Promise((r) => setTimeout(r, 200));
  return { hand_rank: 3, hand_label: "Pair of Aces" };
}

export interface LeaderboardEntry {
  rider_id: string;
  name: string;
  club: string | null;
  hand_label: string | null;
  hand_rank: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getLeaderboard(_run_id: string): Promise<LeaderboardEntry[]> {
  // TODO: replace with Guild agent call
  await new Promise((r) => setTimeout(r, 200));
  return [];
}
