"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch, loadToken, clearToken } from "@/lib/session";
import PlayingCard from "@/components/PlayingCard";
import Logo from "@/components/Logo";
import Link from "next/link";

interface CheckInResult {
  card_drawn: string;
  checked_in_at: string;
  already_checked_in?: boolean;
  stop: {
    stop_number: number;
    location_name: string;
  };
}

const SUIT_NAMES: Record<string, string> = {
  S: "Spades", H: "Hearts", D: "Diamonds", C: "Clubs",
};

const RANK_NAMES: Record<string, string> = {
  A: "Ace", K: "King", Q: "Queen", J: "Jack", "10": "Ten",
  "9": "Nine", "8": "Eight", "7": "Seven", "6": "Six",
  "5": "Five", "4": "Four", "3": "Three", "2": "Two",
};

function cardName(code: string): string {
  const suit = code.slice(-1).toUpperCase();
  const rank = code.slice(0, -1).toUpperCase();
  return `${RANK_NAMES[rank] ?? rank} of ${SUIT_NAMES[suit] ?? suit}`;
}

function CheckInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stopId = searchParams.get("stop");

  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loadToken()) {
      // Preserve stop param so user comes back after sign-in
      router.replace(`/signin?next=/checkin?stop=${stopId}`);
      return;
    }
    if (!stopId) {
      setError("No stop specified. Scan a valid QR code.");
      setLoading(false);
      return;
    }

    apiFetch("/api/checkin", {
      method: "POST",
      body: JSON.stringify({ stop_id: stopId }),
    })
      .then((r) => {
        if (r.status === 401) {
          clearToken();
          router.replace("/signin");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.error) setError(d.error);
        else if (d) setResult(d);
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [stopId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20">
        <div className="w-12 h-12 border-4 border-[#e86c1a] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500">Drawing your card…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6 pt-16 px-6 text-center">
        <div className="text-5xl">⚠️</div>
        <p className="text-gray-700 font-medium">{error}</p>
        <Link
          href="/dashboard"
          className="w-full max-w-xs h-14 flex items-center justify-center rounded-2xl bg-[#e86c1a] text-white text-lg font-bold"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="flex flex-col items-center gap-6 px-6 pt-8 text-center max-w-sm mx-auto w-full">
      {/* Stop info */}
      <div className="bg-[#e86c1a]/10 rounded-2xl px-5 py-4 w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#e86c1a]">
          Stop {result.stop.stop_number}
        </p>
        <p className="text-lg font-bold text-gray-900">{result.stop.location_name}</p>
        {result.already_checked_in && (
          <p className="text-xs text-amber-600 font-medium mt-1">Already checked in</p>
        )}
      </div>

      {/* The card reveal */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-500 font-medium">Your card</p>
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-[#e86c1a]/20 blur-xl scale-110" />
          <PlayingCard code={result.card_drawn} large />
        </div>
        <p className="text-xl font-bold text-gray-900">{cardName(result.card_drawn)}</p>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-400">
        Checked in at{" "}
        {new Date(result.checked_in_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full mt-4">
        <Link
          href="/dashboard"
          className="w-full h-14 flex items-center justify-center rounded-2xl bg-[#e86c1a] text-white text-lg font-bold shadow active:scale-95 transition-transform"
        >
          Back to My Run
        </Link>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <main className="min-h-dvh bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-[#e86c1a] text-white px-6 pt-safe pb-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <Logo />
          <Link href="/dashboard" className="text-white/70 text-sm">
            My Run →
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#e86c1a] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CheckInContent />
      </Suspense>
    </main>
  );
}
