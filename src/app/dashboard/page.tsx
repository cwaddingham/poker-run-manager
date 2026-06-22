"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, clearToken, loadToken } from "@/lib/session";
import PlayingCard from "@/components/PlayingCard";
import Logo from "@/components/Logo";
import Link from "next/link";

interface Stop {
  id: string;
  stop_number: number;
  location_name: string;
  status: string;
}

interface CheckIn {
  stop_id: string;
  card_drawn: string;
  checked_in_at: string;
}

interface Rider {
  id: string;
  name: string;
  email: string;
  club: string | null;
  hand_rank: number | null;
  hand_label: string | null;
  run_name: string;
  event_date: string;
  run_status: string;
}

interface DashboardData {
  rider: Rider;
  stops: Stop[];
  checkins: CheckIn[];
}

const SUIT_COLORS: Record<string, string> = {
  H: "text-red-600",
  D: "text-red-600",
  S: "text-gray-900",
  C: "text-gray-900",
};

const SUIT_SYMBOLS: Record<string, string> = {
  S: "♠", H: "♥", D: "♦", C: "♣",
};

function suitColor(code: string) {
  const suit = code.slice(-1).toUpperCase();
  return SUIT_COLORS[suit] ?? "text-gray-900";
}

function suitSymbol(code: string) {
  const suit = code.slice(-1).toUpperCase();
  return SUIT_SYMBOLS[suit] ?? suit;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loadToken()) {
      router.replace("/signin");
      return;
    }
    apiFetch("/api/dashboard")
      .then((r) => {
        if (r.status === 401) {
          clearToken();
          router.replace("/signin");
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => setError("Could not load dashboard"));
  }, [router]);

  function handleSignOut() {
    clearToken();
    router.replace("/");
  }

  if (error) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6">
        <p className="text-red-600 text-center">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#e86c1a] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your run…</p>
        </div>
      </main>
    );
  }

  const { rider, stops, checkins } = data;
  const checkinMap = new Map(checkins.map((c) => [c.stop_id, c]));
  const completedCount = checkins.length;
  const totalStops = stops.length;
  const isComplete = completedCount === totalStops && totalStops > 0;

  return (
    <main className="min-h-dvh bg-[#f8fafc] pb-10">
      {/* Header */}
      <div className="bg-[#e86c1a] text-white px-6 pt-safe pb-6">
        <div className="flex items-start justify-between max-w-sm mx-auto">
          <Logo className="mt-1" />
          <button
            onClick={handleSignOut}
            className="text-white/70 text-sm font-medium mt-1"
          >
            Sign out
          </button>
        </div>
        <div className="max-w-sm mx-auto mt-5">
          <p className="text-white/70 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold">{rider.name}</h1>
          {rider.club && (
            <p className="text-white/80 text-sm mt-0.5">{rider.club}</p>
          )}
          <p className="text-white/60 text-xs mt-1">{rider.run_name}</p>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-6 pt-6 flex flex-col gap-5">
        {/* Progress bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Run Progress</h2>
            <span className="text-[#e86c1a] font-bold text-lg">
              {completedCount}/{totalStops}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e86c1a] rounded-full transition-all duration-500"
              style={{ width: totalStops > 0 ? `${(completedCount / totalStops) * 100}%` : "0%" }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isComplete
              ? "All stops complete!"
              : `${totalStops - completedCount} stop${totalStops - completedCount !== 1 ? "s" : ""} remaining`}
          </p>
        </div>

        {/* Hand label — shown once all stops visited */}
        {isComplete && rider.hand_label && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-1">
              Your Hand
            </p>
            <p className="text-2xl font-bold text-gray-900">{rider.hand_label}</p>
          </div>
        )}

        {/* Cards drawn */}
        {checkins.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Cards Drawn</h2>
            <div className="flex flex-wrap gap-3">
              {checkins.map((c) => (
                <PlayingCard key={c.stop_id} code={c.card_drawn} />
              ))}
            </div>
          </div>
        )}

        {/* Stop list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h2 className="font-bold text-gray-900 px-5 pt-5 pb-3">Stops</h2>
          <ul className="divide-y divide-gray-50">
            {stops.map((stop) => {
              const checkin = checkinMap.get(stop.id);
              const isOpen = stop.status === "open";
              const isDone = !!checkin;
              return (
                <li key={stop.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Status indicator */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${isDone ? "bg-[#e86c1a] text-white" : "bg-gray-100 text-gray-400"}`}
                  >
                    {isDone ? "✓" : stop.stop_number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isDone ? "text-gray-900" : "text-gray-500"}`}>
                      {stop.location_name}
                    </p>
                    {isDone && checkin && (
                      <p className={`text-xs font-semibold ${suitColor(checkin.card_drawn)}`}>
                        {checkin.card_drawn.slice(0, -1)}{suitSymbol(checkin.card_drawn)}
                      </p>
                    )}
                    {!isDone && isOpen && (
                      <p className="text-xs text-green-600 font-medium">Open — scan QR to check in</p>
                    )}
                    {!isDone && !isOpen && (
                      <p className="text-xs text-gray-400">Not yet open</p>
                    )}
                  </div>

                  {isDone && (
                    <Link
                      href={`/checkin?stop=${stop.id}`}
                      className="text-xs text-[#e86c1a] font-medium flex-shrink-0"
                    >
                      View
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </main>
  );
}
