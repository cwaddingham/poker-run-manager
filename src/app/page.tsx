"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadToken } from "@/lib/session";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (loadToken()) router.replace("/dashboard");
  }, [router]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#e86c1a] to-[#c45a10]">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <Logo className="scale-150 mb-4" />

        <h1 className="text-white text-3xl font-bold text-center leading-tight">
          Capital City MC
          <br />
          <span className="text-white/80 text-xl font-normal">Poker Run</span>
        </h1>

        <div className="w-full flex flex-col gap-3 mt-4">
          <Link
            href="/register"
            className="w-full flex items-center justify-center h-14 rounded-2xl bg-white text-[#e86c1a] text-lg font-bold shadow-lg active:scale-95 transition-transform"
          >
            Register for a Run
          </Link>
          <Link
            href="/signin"
            className="w-full flex items-center justify-center h-14 rounded-2xl bg-white/20 border border-white/40 text-white text-lg font-semibold active:scale-95 transition-transform"
          >
            Sign In
          </Link>
        </div>

        <p className="text-white/60 text-xs text-center mt-4">
          Sacramento Motorcycle Club
        </p>
      </div>
    </main>
  );
}
