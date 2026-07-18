"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCoachPin, getClientByCode } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "coach" | "client">("select");
  const [pin, setPin] = useState("");
  const [clientCode, setClientCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleCoachLogin = async () => {
    setLoading(true);
    const correctPin = await getCoachPin();
    setLoading(false);
    if (pin === correctPin) {
      sessionStorage.setItem("cocotilo_role", "coach");
      router.push("/coaching/coach");
    } else {
      setError("Incorrect PIN");
      setPin("");
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleClientLogin = async () => {
    setLoading(true);
    const client = await getClientByCode(clientCode.trim());
    setLoading(false);
    if (client) {
      sessionStorage.setItem("cocotilo_role", "client");
      sessionStorage.setItem("cocotilo_client_id", client.id);
      router.push(`/coaching/client/${client.id}`);
    } else {
      setError("Code not found");
      setTimeout(() => setError(""), 2000);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-racing-bg flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(230,57,70,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,70,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-racing-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <a href="/" className="absolute -top-10 left-0 flex items-center gap-1.5 text-racing-textDim hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">
          ← Volver a cocotilo37
        </a>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 racing-stripe rounded flex items-center justify-center"><span className="text-lg">⚡</span></div>
            <span className="text-3xl font-display font-black tracking-widest text-white uppercase" style={{ letterSpacing: "0.25em" }}>Cocotilo</span>
          </div>
          <p className="text-racing-textDim text-sm font-mono tracking-wider uppercase">Coaching Platform</p>
        </div>

        {mode === "select" && (
          <div className="space-y-3 animate-slide-in">
            <p className="text-center text-racing-textDim text-sm mb-6 tracking-wide uppercase font-mono">Select your access</p>
            <button onClick={() => setMode("coach")} className="w-full group relative overflow-hidden rounded-none border border-racing-border bg-racing-card hover:border-racing-red transition-all duration-300 p-5 text-left">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-racing-red group-hover:w-1 transition-all duration-300" />
              <div className="flex items-center gap-4 pl-3">
                <div className="w-10 h-10 rounded border border-racing-border bg-racing-muted flex items-center justify-center"><span className="text-xl">🏆</span></div>
                <div><p className="font-display font-bold text-lg tracking-wide text-white uppercase">Coach</p><p className="text-racing-textDim text-xs font-mono">Full management panel</p></div>
              </div>
            </button>
            <button onClick={() => setMode("client")} className="w-full group relative overflow-hidden rounded-none border border-racing-border bg-racing-card hover:border-racing-red transition-all duration-300 p-5 text-left">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-racing-blue group-hover:w-1 transition-all duration-300" />
              <div className="flex items-center gap-4 pl-3">
                <div className="w-10 h-10 rounded border border-racing-border bg-racing-muted flex items-center justify-center"><span className="text-xl">🎮</span></div>
                <div><p className="font-display font-bold text-lg tracking-wide text-white uppercase">Driver</p><p className="text-racing-textDim text-xs font-mono">My sessions &amp; availability</p></div>
              </div>
            </button>
          </div>
        )}

        {mode === "coach" && (
          <div className="animate-slide-in">
            <button onClick={() => { setMode("select"); setPin(""); setError(""); }} className="flex items-center gap-2 text-racing-textDim hover:text-white text-xs font-mono mb-8 transition-colors">← Back</button>
            <div className="border border-racing-border bg-racing-card p-8">
              <p className="text-white font-display font-bold text-xl tracking-widest uppercase mb-6">Coach Access</p>
              <p className="text-racing-textDim text-xs font-mono mb-6">Enter your PIN</p>
              <input type="password" maxLength={8} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleCoachLogin()} className="pin-input mb-2" placeholder="••••" autoFocus />
              {error && <p className="text-racing-red text-xs font-mono mt-2">⚠ {error}</p>}
              <button onClick={handleCoachLogin} disabled={pin.length < 4 || loading} className="w-full mt-6 py-3 racing-stripe text-white font-display font-bold tracking-widest uppercase text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
                {loading ? "Checking…" : "Enter →"}
              </button>
            </div>
          </div>
        )}

        {mode === "client" && (
          <div className="animate-slide-in">
            <button onClick={() => { setMode("select"); setClientCode(""); setError(""); }} className="flex items-center gap-2 text-racing-textDim hover:text-white text-xs font-mono mb-8 transition-colors">← Back</button>
            <div className="relative border border-racing-border bg-racing-card p-8">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-racing-blue" />
              <p className="text-white font-display font-bold text-xl tracking-widest uppercase mb-6">Driver Access</p>
              <p className="text-racing-textDim text-xs font-mono mb-6">Enter the code your coach gave you</p>
              <input type="text" value={clientCode} onChange={(e) => { setClientCode(e.target.value.toUpperCase()); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleClientLogin()} className="w-full bg-racing-muted border border-racing-border text-white font-mono text-center text-xl py-3 px-4 focus:outline-none focus:border-racing-blue transition-colors tracking-widest uppercase" placeholder="XXXX00" autoFocus />
              {error && <p className="text-racing-red text-xs font-mono mt-2">⚠ {error}</p>}
              <button onClick={handleClientLogin} disabled={!clientCode.trim() || loading} className="w-full mt-6 py-3 bg-racing-blue text-white font-display font-bold tracking-widest uppercase text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
                {loading ? "Checking…" : "Enter →"}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-6 text-racing-textDim text-xs font-mono tracking-widest opacity-40">COCOTILO v2.0 · MOTORSPORT PERFORMANCE</div>
    </div>
  );
}
