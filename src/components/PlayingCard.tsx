"use client";

const SUIT_SYMBOLS: Record<string, string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
};

const RED_SUITS = new Set(["H", "D"]);

interface PlayingCardProps {
  code: string; // e.g. "AS", "10H", "KD"
  large?: boolean;
}

export default function PlayingCard({ code, large = false }: PlayingCardProps) {
  const suit = code.slice(-1).toUpperCase();
  const rank = code.slice(0, -1).toUpperCase();
  const symbol = SUIT_SYMBOLS[suit] ?? suit;
  const isRed = RED_SUITS.has(suit);

  const color = isRed ? "text-red-600" : "text-gray-900";
  const size = large ? "text-6xl" : "text-3xl";
  const cardSize = large ? "w-40 h-56" : "w-20 h-28";

  return (
    <div
      className={`${cardSize} bg-white rounded-xl border-2 border-gray-200 shadow-lg flex flex-col items-center justify-center select-none`}
      style={{ fontFamily: "Georgia, serif" }}
    >
      <span className={`${size} font-bold ${color} leading-none`}>{rank}</span>
      <span className={`${large ? "text-5xl" : "text-2xl"} ${color} leading-none mt-1`}>
        {symbol}
      </span>
    </div>
  );
}
