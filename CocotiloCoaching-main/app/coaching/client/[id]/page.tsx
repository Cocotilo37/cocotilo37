"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getClientById, getSessionsByClientId, getAvailabilityByClient, saveAvailability, saveSession, saveClient,
  Availability, Session, Client, DAYS_OF_WEEK, getMondayOfWeek,
  formatDateLong, isUpcoming, getStatusClass, getStatusLabel,
  SESSION_TYPE_ICONS, generateId, getLevelColor, formatDate, SessionStatus,
} from "@/lib/store";
import {
  TIMEZONE_GROUPS, formatTimezone, getLocalHourLabels, utcSlotToLocal, getCurrentLocalTime,
} from "@/lib/timezones";
import { supabase } from "@/lib/supabase";
import {
  LogOut, CalendarCheck, Clock, CheckCircle2, History, Zap, FileText,
  ChevronLeft, ChevronRight, Globe,
} from "lucide-react";

type Tab = "availability" | "upcoming" | "history";

export default function ClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const [tzSearch, setTzSearch] = useState("");

  const reload = useCallback(async () => {
    const c = await getClientById(clientId);
    if (!c) return;
    setClient(c);
    const s = await getSessionsByClientId(clientId);
    setSessions(s);
    const a = await getAvailabilityByClient(clientId);
    setAvailability(a);
    setSelectedSlots(new Set(a.map((av) => `${av.dayOfWeek}-${av.timeSlot}`)));
    // Show timezone picker if no timezone set yet
    if (!c.timezone) setShowTimezonePicker(true);
  }, [clientId]);

  useEffect(() => {
    setMounted(true);
    const role = sessionStorage.getItem("cocotilo_role");
    const storedId = sessionStorage.getItem("cocotilo_client_id");
    if (role !== "client" || storedId !== clientId) { router.push("/coaching"); return; }
    reload();

    const sessionsSub = supabase
      .channel(`sessions-client-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions", filter: `client_id=eq.${clientId}` }, () => reload())
      .subscribe();

    return () => { supabase.removeChannel(sessionsSub); };
  }, [clientId, reload, router]);

  const handleSaveTimezone = async (tz: string) => {
    if (!client) return;
    await saveClient({ ...client, timezone: tz });
    await reload();
    setShowTimezonePicker(false);
    setTzSearch("");
  };

  if (!mounted || !client) return null;

  // If no timezone set, show the picker fullscreen first
  if (showTimezonePicker) {
    return <TimezonePicker onSave={handleSaveTimezone} tzSearch={tzSearch} setTzSearch={setTzSearch} existingTz={client.timezone} />;
  }

  const timezone = client.timezone || "UTC";
  const localHours = getLocalHourLabels(timezone);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const monday = getMondayOfWeek(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7 + i);
    return monday;
  });

  const weekLabel = (() => {
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    return `${fmt(weekDays[0])} — ${fmt(weekDays[6])}`;
  })();

  const toggleSlot = (dayOfWeek: number, utcSlot: string) => {
    const key = `${dayOfWeek}-${utcSlot}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    const monday = getMondayOfWeek(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);
    const weekOf = monday.toISOString().split("T")[0];
    const newAvail: Availability[] = [];
    selectedSlots.forEach((key) => {
      const [day, ...timeParts] = key.split("-");
      const time = timeParts.join("-");
      newAvail.push({ id: generateId("a"), clientId, dayOfWeek: parseInt(day), timeSlot: time, weekOf });
    });
    await saveAvailability(newAvail.length > 0 ? newAvail : [{ id: generateId("a"), clientId, dayOfWeek: -1, timeSlot: "", weekOf }]);
    await reload();
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const handleConfirmSession = async (sessionId: string) => {
    const s = sessions.find((s) => s.id === sessionId);
    if (s) { await saveSession({ ...s, status: "confirmed" }); await reload(); }
  };

  const upcoming = sessions.filter((s) => isUpcoming(s.date, s.time) && s.status !== "cancelled").sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const past = sessions.filter((s) => !isUpcoming(s.date, s.time)).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  return (
    <div className="min-h-screen bg-racing-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-racing-border bg-racing-surface sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 racing-stripe flex items-center justify-center"><span className="text-xs">⚡</span></div>
            <span className="font-display font-black text-white tracking-widest uppercase text-sm">Cocotilo</span>
            <span className="text-racing-textDim text-xs font-mono ml-2 hidden sm:inline">/ {client.name.split(" ")[0]}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTimezonePicker(true)}
              className="flex items-center gap-1.5 text-racing-textDim hover:text-white text-xs font-mono transition-colors border border-racing-border px-2 py-1"
              title="Change timezone"
            >
              <Globe size={11} />
              <span className="hidden sm:block">{formatTimezone(timezone).split(" (")[0]}</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-racing-muted border border-racing-border flex items-center justify-center">
                <span className="font-display font-black text-xs text-white">{client.avatar}</span>
              </div>
            </div>
            <button onClick={() => { sessionStorage.clear(); router.push("/coaching"); }} className="flex items-center gap-1.5 text-racing-textDim hover:text-white text-xs font-mono transition-colors"><LogOut size={12} /></button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-racing-surface border-b border-racing-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-black text-xl text-white uppercase tracking-wider">{client.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-racing-textDim text-xs font-mono">{client.simulator}</span>
                <span className="text-racing-textDim text-xs font-mono opacity-50">·</span>
                <span className="text-racing-textDim text-xs font-mono">{getCurrentLocalTime(timezone)} local</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-black text-white">{upcoming.length}</p>
              <p className="text-xs font-mono text-racing-textDim uppercase tracking-wider">upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-racing-border bg-racing-surface">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex">
            {([
              { id: "upcoming", icon: CalendarCheck, label: "Upcoming" },
              { id: "availability", icon: Clock, label: "Availability" },
              { id: "history", icon: History, label: "History" },
            ] as { id: Tab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all ${tab === id ? "border-racing-red text-white" : "border-transparent text-racing-textDim hover:text-white"}`}>
                <Icon size={13} /><span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">

        {/* ══ UPCOMING ══ */}
        {tab === "upcoming" && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="font-display font-bold text-white uppercase tracking-wider text-sm">Confirmed Sessions</h2>
            {upcoming.length === 0
              ? (
                <div className="bg-racing-card border border-racing-border p-8 text-center">
                  <p className="text-3xl mb-2">🏁</p>
                  <p className="text-racing-textDim text-sm font-mono">No upcoming sessions.</p>
                  <p className="text-racing-textDim text-xs font-mono mt-1">Mark your availability so your coach can schedule you.</p>
                  <button onClick={() => setTab("availability")} className="mt-4 text-xs font-mono text-racing-red border border-racing-red/30 px-4 py-2 hover:bg-racing-red/10 transition-colors">Mark availability →</button>
                </div>
              )
              : upcoming.map((session) => <ClientSessionCard key={session.id} session={session} onConfirm={handleConfirmSession} clientTimezone={timezone} />)
            }
          </div>
        )}

        {/* ══ AVAILABILITY ══ */}
        {tab === "availability" && (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-display font-bold text-white uppercase tracking-wider text-sm">My Availability</h2>
                <p className="text-racing-textDim text-xs font-mono mt-0.5 flex items-center gap-1">
                  <Globe size={10} /> Times in your local timezone — {formatTimezone(timezone)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setWeekOffset((p) => p - 1)} className="p-1.5 border border-racing-border text-racing-textDim hover:text-white transition-all"><ChevronLeft size={13} /></button>
                <span className="text-xs font-mono text-racing-textDim w-32 text-center">{weekLabel}</span>
                <button onClick={() => setWeekOffset((p) => p + 1)} className="p-1.5 border border-racing-border text-racing-textDim hover:text-white transition-all"><ChevronRight size={13} /></button>
              </div>
            </div>

            <p className="text-xs font-mono text-racing-textDim">Tap a cell to mark when you're free to train.</p>

            {/* Availability grid — all 24 local hours */}
            <div className="bg-racing-card border border-racing-border overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-8 border-b border-racing-border">
                <div className="p-2 flex items-center justify-end pr-2">
                  <span className="text-xs font-mono text-racing-textDim uppercase">Time</span>
                </div>
                {weekDays.map((day, i) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`p-1.5 text-center border-l border-racing-border ${isToday ? "bg-racing-red/10" : ""}`}>
                      <p className={`text-xs font-mono uppercase tracking-wider ${isToday ? "text-racing-red" : "text-racing-textDim"}`}>{DAYS_OF_WEEK[i]}</p>
                      <p className={`font-display font-bold text-sm leading-none ${isToday ? "text-racing-red" : "text-racing-textDim"}`}>{day.getDate()}</p>
                    </div>
                  );
                })}
              </div>

              {/* All 24 hour rows in local time */}
              {localHours.map(({ display, utcSlot }) => (
                <div key={display} className="grid grid-cols-8 border-b border-racing-border last:border-b-0">
                  <div className="p-1.5 flex items-center justify-end pr-2 border-r border-racing-border">
                    <span className="text-xs font-mono text-racing-textDim">{display}</span>
                  </div>
                  {weekDays.map((_, dayIdx) => {
                    const key = `${dayIdx}-${utcSlot}`;
                    const selected = selectedSlots.has(key);
                    return (
                      <button
                        key={dayIdx}
                        onClick={() => toggleSlot(dayIdx, utcSlot)}
                        className={`border-l border-racing-border h-8 flex items-center justify-center transition-colors ${selected ? "bg-racing-red/25" : "hover:bg-racing-red/8"}`}
                      >
                        {selected && <span className="text-racing-red text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-racing-textDim">{selectedSlots.size} slots selected</span>
              <button onClick={handleSaveAvailability} disabled={saving} className="flex items-center gap-2 racing-stripe text-white px-5 py-2.5 font-display font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Saving…" : savedMsg ? <><CheckCircle2 size={13} /> Saved!</> : "Save availability"}
              </button>
            </div>
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {tab === "history" && (
          <div className="animate-fade-in space-y-3">
            <h2 className="font-display font-bold text-white uppercase tracking-wider text-sm">Session History</h2>
            {past.length === 0
              ? <div className="bg-racing-card border border-racing-border p-8 text-center"><p className="text-3xl mb-2">📋</p><p className="text-racing-textDim text-sm font-mono">No completed sessions yet.</p></div>
              : past.map((session) => <ClientSessionCard key={session.id} session={session} showNotes clientTimezone={timezone} />)
            }
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Timezone Picker ──────────────────────────────────────────────────────────

function TimezonePicker({ onSave, tzSearch, setTzSearch, existingTz }: {
  onSave: (tz: string) => void;
  tzSearch: string;
  setTzSearch: (s: string) => void;
  existingTz: string;
}) {
  const filtered = Object.entries(TIMEZONE_GROUPS).reduce<Record<string, string[]>>((acc, [region, zones]) => {
    const matches = zones.filter((z) =>
      z.toLowerCase().includes(tzSearch.toLowerCase()) ||
      region.toLowerCase().includes(tzSearch.toLowerCase())
    );
    if (matches.length > 0) acc[region] = matches;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-racing-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 racing-stripe rounded flex items-center justify-center"><span className="text-lg">⚡</span></div>
            <span className="text-2xl font-display font-black tracking-widest text-white uppercase">Cocotilo</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe size={16} className="text-racing-red" />
            <p className="text-white font-display font-bold uppercase tracking-widest text-sm">Select Your Timezone</p>
          </div>
          <p className="text-racing-textDim text-xs font-mono">So your availability shows in your local time</p>
        </div>

        <div className="bg-racing-card border border-racing-border p-4">
          <input
            type="text"
            value={tzSearch}
            onChange={(e) => setTzSearch(e.target.value)}
            placeholder="Search city or region…"
            className="w-full bg-racing-surface border border-racing-border text-white text-sm px-3 py-2 font-mono focus:outline-none focus:border-racing-red/50 transition-colors mb-3"
            autoFocus
          />

          <div className="max-h-72 overflow-y-auto space-y-3">
            {Object.entries(filtered).map(([region, zones]) => (
              <div key={region}>
                <p className="text-xs font-mono text-racing-textDim uppercase tracking-widest mb-1 px-1">{region}</p>
                <div className="space-y-0.5">
                  {zones.map((tz) => (
                    <button
                      key={tz}
                      onClick={() => onSave(tz)}
                      className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors hover:bg-racing-red/10 hover:text-white ${existingTz === tz ? "bg-racing-red/15 text-white border-l-2 border-racing-red" : "text-racing-textDim"}`}
                    >
                      {formatTimezone(tz)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(filtered).length === 0 && (
              <p className="text-racing-textDim text-xs font-mono text-center py-4">No results for "{tzSearch}"</p>
            )}
          </div>
        </div>

        {existingTz && (
          <button onClick={() => onSave(existingTz)} className="w-full mt-3 text-xs font-mono text-racing-textDim hover:text-white transition-colors py-2">
            Keep current: {formatTimezone(existingTz)}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Client Session Card ──────────────────────────────────────────────────────

function ClientSessionCard({ session, showNotes = false, onConfirm, clientTimezone }: {
  session: Session;
  showNotes?: boolean;
  onConfirm?: (id: string) => void;
  clientTimezone: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const statusClass = getStatusClass(session.status);
  const icon = SESSION_TYPE_ICONS[session.type];

  // Convert session UTC time to driver's local time for display
  const localTime = (() => {
    try {
      const d = new Date(`${session.date}T${session.time}:00Z`);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: clientTimezone });
    } catch { return session.time; }
  })();

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setConfirming(true);
    await onConfirm(session.id);
    setConfirming(false);
  };

  return (
    <div className="card-accent bg-racing-card border border-racing-border overflow-hidden">
      <div className="p-4 flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-9 h-9 bg-racing-muted border border-racing-border flex items-center justify-center flex-shrink-0"><span className="text-base">{icon}</span></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-white uppercase tracking-wide text-sm">{session.type}</span>
            <span className={`text-xs px-2 py-0.5 border font-mono ${statusClass}`}>{getStatusLabel(session.status).toUpperCase()}</span>
          </div>
          <p className="text-racing-textDim text-xs font-mono mt-1">📅 {formatDateLong(session.date)} · {localTime} local · {session.duration} min</p>
          {session.coachNotes && <p className="text-racing-textDim text-xs font-mono mt-0.5 flex items-center gap-1"><FileText size={10} />Notes available</p>}
        </div>
      </div>
      {session.status === "pending" && onConfirm && (
        <div className="border-t border-racing-border px-4 py-3 bg-racing-surface flex items-center justify-between">
          <p className="text-xs font-mono text-racing-textDim">Your coach scheduled this — confirm your attendance</p>
          <button onClick={handleConfirm} disabled={confirming} className="flex items-center gap-1.5 text-xs font-mono border border-racing-green/40 px-3 py-1.5 text-racing-green hover:bg-racing-green/10 transition-colors disabled:opacity-40 flex-shrink-0 ml-3">
            <CheckCircle2 size={12} />
            {confirming ? "Confirming…" : "Confirm"}
          </button>
        </div>
      )}
      {(expanded || showNotes) && session.coachNotes && (
        <div className="border-t border-racing-border bg-racing-surface px-4 py-3">
          <p className="text-xs font-mono text-racing-textDim uppercase tracking-wider mb-2 flex items-center gap-1"><Zap size={10} className="text-racing-red" />Coach Notes</p>
          <p className="text-sm text-racing-text leading-relaxed">{session.coachNotes}</p>
        </div>
      )}
    </div>
  );
}
