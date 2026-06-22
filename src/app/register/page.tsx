"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/session";
import Logo from "@/components/Logo";
import Link from "next/link";

interface Run {
  id: string;
  name: string;
  event_date: string;
  status: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<Run[]>([]);
  const [runId, setRunId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [club, setClub] = useState("");
  const [amaNumber, setAmaNumber] = useState("");
  const [waiverSigned, setWaiverSigned] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/runs")
      .then((r) => r.json())
      .then((data: Run[]) => {
        setRuns(data);
        if (data.length === 1) setRunId(data[0].id);
      })
      .catch(() => setError("Could not load runs"));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!waiverSigned) {
      setError("You must sign the waiver to register.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: runId,
          name,
          email,
          password,
          club: club || undefined,
          ama_number: amaNumber || undefined,
          waiver_signed: waiverSigned,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }
      saveToken(data.session_token);
      router.replace("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-10 bg-[#f8fafc]">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Register</h1>
          <p className="text-sm text-gray-500 mb-6">Join a poker run</p>

          {/* Google placeholder */}
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-medium mb-4 cursor-not-allowed opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <span className="text-xs text-gray-400">(coming soon)</span>
          </button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {runs.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Run
                </label>
                <select
                  required
                  value={runId}
                  onChange={(e) => setRunId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#e86c1a] outline-none transition-colors bg-white"
                >
                  <option value="">Select a run…</option>
                  {runs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {formatDate(r.event_date)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {runs.length === 1 && runId && (
              <div className="bg-[#e86c1a]/10 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-[#e86c1a] uppercase tracking-wide">
                  Registering for
                </p>
                <p className="text-gray-900 font-medium">{runs[0].name}</p>
                <p className="text-sm text-gray-500">{formatDate(runs[0].event_date)}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#e86c1a] outline-none transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#e86c1a] outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#e86c1a] outline-none transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club Name{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#e86c1a] outline-none transition-colors"
                placeholder="e.g. Capital City MC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AMA #{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={amaNumber}
                onChange={(e) => setAmaNumber(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#e86c1a] outline-none transition-colors"
                placeholder="Your AMA number"
              />
            </div>

            {/* Waiver */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                <strong>Liability Waiver:</strong> I understand that motorcycle
                riding involves risk of injury or death. I voluntarily assume all
                risks and release Capital City MC and all sponsors from any
                liability arising from my participation in this poker run.
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={waiverSigned}
                  onChange={(e) => setWaiverSigned(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded accent-[#e86c1a] flex-shrink-0"
                />
                <span className="text-sm font-semibold text-gray-800">
                  I have read and agree to the liability waiver{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {error && (
              <p className="text-red-600 text-sm font-medium bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !waiverSigned || !runId}
              className="w-full h-14 rounded-2xl bg-[#e86c1a] text-white text-lg font-bold shadow active:scale-95 transition-transform disabled:opacity-50 mt-2"
            >
              {loading ? "Registering…" : "Register & Start Run"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered?{" "}
          <Link href="/signin" className="text-[#e86c1a] font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
