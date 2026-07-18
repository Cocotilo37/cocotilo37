"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Client, Session, Availability,
  getClients, getSessions, getAvailability,
  getCoachPin, setCoachPin,
  saveClient, saveSession, deleteClient, deleteSession, generateId,
  DAYS_FULL, SESSION_TYPES, SESSION_TYPE_ICONS, SIMULATORS, LEVELS, TIME_SLOTS,
  getLevelColor, getStatusClass, getStatusLabel,
  formatDate, formatDateLong, isUpcoming,
  SessionStatus, SessionType, ClientLevel, Simulator, getMondayOfWeek,
} from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { utcSlotToLocal, formatTimezone } from "@/lib/timezones";
import {
  LayoutDashboard, Users, CalendarDays, History, LogOut, Settings,
  Plus, Trash2, ChevronDown, ChevronUp, Edit3, CheckCircle2,
} from "lucide-react";
import SessionCard from "@/components/SessionCard";
import Modal from "@/components/Modal";
import WeeklyCalendar from "@/components/WeeklyCalendar";

type Tab = "dashboard" | "clients" | "availability" | "history" | "settings";

export default function CoachPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [preselectDate, setPreselectDate] = useState<string>("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showNewSession, setShowNewSession] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState<Client | null>(null);
  const [showEditNotes, setShowEditNotes] = useState<Session | null>(null);
  const [showSessionDetail, setShowSessionDetail] = useState<Session | null>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [c, s, a] = await Promise.all([getClients(), getSessions(), getAvailability()]);
    setClients(c);
    setSessions(s);
    setAvailability(a);
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    const role = sessionStorage.getItem("cocotilo_role");
    if (role !== "coach") { router.push("/coaching"); return; }
    reload();

    // ── Real-time subscriptions ──────────────────────────────────────────────
    const sessionsSub = supabase
      .channel("sessions-coach")
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () => reload())
      .subscribe();

    const clientsSub = supabase
      .channel("clients-coach")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => reload())
      .subscribe();

    const availSub = supabase
      .channel("availability-coach")
      .on("postgres_changes", { event: "*", schema: "public", table: "availability" }, () => reload())
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsSub);
      supabase.removeChannel(clientsSub);
      supabase.removeChannel(availSub);
    };
  }, [reload, router]);

  if (!mounted) return null;

  const upcomingSessions = sessions
    .filter((s) => isUpcoming(s.date, s.time) && s.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 10);

  const handleStatusChange = async (sessionId: string, status: SessionStatus) => {
    const s = sessions.find((s) => s.id === sessionId);
    if (s) { await saveSession({ ...s, status }); await reload(); }
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm("Delete this session?")) { await deleteSession(id); await reload(); }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm("Delete this driver and all their sessions?")) {
      await deleteClient(id);
      if (selectedClient?.id === id) setSelectedClient(null);
      await reload();
    }
  };

  const getClient = (clientId: string) => clients.find((c) => c.id === clientId);

  const stats = {
    total: clients.length,
    upcoming: upcomingSessions.length,
    completed: sessions.filter((s) => s.status === "completed").length,
    pending: sessions.filter((s) => s.status === "pending" && isUpcoming(s.date, s.time)).length,
  };

  return (
    <div className="min-h-screen bg-racing-bg flex flex-col">
      <header className="border-b border-racing-border bg-racing-surface sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 racing-stripe flex items-center justify-center"><span className="text-xs">⚡</span></div>
            <span className="font-display font-black text-white tracking-widest uppercase text-base">Cocotilo</span>
            <span className="text-racing-textDim text-xs font-mono hidden sm:block">/ Coach</span>
          </div>
          <button onClick={() => { sessionStorage.clear(); router.push("/coaching"); }} className="flex items-center gap-1.5 text-racing-textDim hover:text-white text-xs font-mono transition-colors">
            <LogOut size={12} /><span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        <nav className="w-14 sm:w-52 border-r border-racing-border bg-racing-surface flex-shrink-0 pt-4">
          {([
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "clients", icon: Users, label: "Drivers" },
            { id: "availability", icon: CalendarDays, label: "Availability" },
            { id: "history", icon: History, label: "History" },
            { id: "settings", icon: Settings, label: "Settings" },
          ] as { id: Tab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${tab === id ? "border-r-2 border-racing-red bg-racing-red/5 text-white" : "text-racing-textDim hover:text-white hover:bg-racing-muted/30"}`}>
              <Icon size={16} className="flex-shrink-0" />
              <span className="font-display font-semibold text-sm uppercase tracking-wide hidden sm:block">{label}</span>
            </button>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-racing-textDim font-mono text-sm animate-pulse">Loading data…</p>
            </div>
          )}

          {!loading && tab === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">Dashboard</h1>
                <button onClick={() => setShowNewSession(true)} className="flex items-center gap-2 racing-stripe text-white px-4 py-2 font-display font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity">
                  <Plus size={14} /> New Session
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Drivers", value: stats.total, icon: "👥", color: "text-white" },
                  { label: "Upcoming", value: stats.upcoming, icon: "📅", color: "text-green-400" },
                  { label: "Completed", value: stats.completed, icon: "✅", color: "text-blue-400" },
                  { label: "Pending", value: stats.pending, icon: "⏳", color: "text-yellow-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-racing-card border border-racing-border p-4">
                    <div className="flex items-center justify-between mb-2"><span className="text-xl">{stat.icon}</span></div>
                    <p className={`font-display font-black text-3xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-racing-textDim text-xs font-mono uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-racing-card border border-racing-border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 racing-stripe" />
                  <h2 className="font-display font-bold text-white uppercase tracking-widest text-sm">Weekly View</h2>
                </div>
                <WeeklyCalendar sessions={sessions} clients={clients} weekOffset={weekOffset} onWeekChange={setWeekOffset} onSessionClick={(s) => setShowSessionDetail(s)} onStatusChange={handleStatusChange} />
              </div>

              <div className="bg-racing-card border border-racing-border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 racing-stripe" />
                  <h2 className="font-display font-bold text-white uppercase tracking-widest text-sm">Upcoming Sessions</h2>
                </div>
                {upcomingSessions.length === 0
                  ? <p className="text-racing-textDim text-sm font-mono text-center py-6">No upcoming sessions</p>
                  : <div className="space-y-2">{upcomingSessions.map((s) => <SessionCard key={s.id} session={s} client={getClient(s.clientId)} showClient onStatusChange={handleStatusChange} onNotesEdit={(s) => setShowEditNotes(s)} />)}</div>
                }
              </div>
            </div>
          )}

          {!loading && tab === "clients" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">Drivers</h1>
                <button onClick={() => setShowNewClient(true)} className="flex items-center gap-2 racing-stripe text-white px-4 py-2 font-display font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity">
                  <Plus size={14} /> New Driver
                </button>
              </div>
              <div className="space-y-2">
                {clients.map((client) => {
                  const clientSessions = sessions.filter((s) => s.clientId === client.id);
                  const upcoming = clientSessions.filter((s) => isUpcoming(s.date, s.time) && s.status !== "cancelled");
                  const isExpanded = expandedClient === client.id;
                  return (
                    <div key={client.id} className="border border-racing-border bg-racing-card overflow-hidden">
                      <div className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-racing-muted border border-racing-border flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-black text-sm text-white">{client.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-white uppercase tracking-wide">{client.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 border font-mono ${getLevelColor(client.level)}`}>{client.level.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs font-mono text-racing-textDim flex-wrap">
                            <span>{client.simulator}</span>
                            <span>CODE: {client.code}</span>
                            <span>{upcoming.length} upcoming</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setShowEditClient(client)} className="p-1.5 border border-racing-border text-racing-textDim hover:text-white transition-colors"><Edit3 size={12} /></button>
                          <button onClick={() => handleDeleteClient(client.id)} className="p-1.5 border border-racing-border text-racing-textDim hover:text-racing-red transition-colors"><Trash2 size={12} /></button>
                          <button onClick={() => setExpandedClient(isExpanded ? null : client.id)} className="p-1.5 border border-racing-border text-racing-textDim hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t border-racing-border p-4 bg-racing-surface space-y-4">
                          {client.privateNotes && (
                            <div>
                              <p className="text-xs font-mono text-racing-textDim uppercase tracking-wider mb-1">Private notes</p>
                              <p className="text-sm text-racing-text leading-relaxed bg-racing-muted/30 border-l-2 border-racing-red/40 pl-3 py-2">{client.privateNotes}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-mono text-racing-textDim uppercase tracking-wider mb-2">Upcoming sessions</p>
                            {upcoming.length === 0
                              ? <p className="text-racing-textDim text-xs font-mono">No upcoming sessions</p>
                              : <div className="space-y-1">{upcoming.slice(0, 3).map((s) => <SessionCard key={s.id} session={s} showClient={false} compact onStatusChange={handleStatusChange} onNotesEdit={setShowEditNotes} />)}</div>
                            }
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setShowNewSession(true); setSelectedClient(client); }} className="flex items-center gap-1.5 text-xs font-mono text-racing-textDim hover:text-white border border-racing-border px-3 py-1.5 transition-colors"><Plus size={11} /> New session</button>
                            <button onClick={() => { setTab("history"); setSelectedClient(client); }} className="flex items-center gap-1.5 text-xs font-mono text-racing-textDim hover:text-white border border-racing-border px-3 py-1.5 transition-colors"><History size={11} /> View history</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && tab === "availability" && (
            <div className="animate-fade-in">
              <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-6">Availability</h1>
              <div className="space-y-6">
                {clients.map((client) => {
                  const clientAvail = availability.filter((a) => a.clientId === client.id);
                  if (clientAvail.length === 0) return null;
                  const byDay: Record<number, Availability[]> = {};
                  clientAvail.forEach((a) => { if (!byDay[a.dayOfWeek]) byDay[a.dayOfWeek] = []; byDay[a.dayOfWeek].push(a); });
                  return (
                    <div key={client.id} className="bg-racing-card border border-racing-border p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-racing-muted border border-racing-border flex items-center justify-center"><span className="font-display font-black text-xs text-white">{client.avatar}</span></div>
                        <div>
                          <p className="font-display font-bold text-white uppercase tracking-wide text-sm">{client.name}</p>
                          <p className="text-xs font-mono text-racing-textDim">{clientAvail.length} slots · {client.timezone ? formatTimezone(client.timezone) : "timezone not set"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(byDay).map(([dayIdx, slots]) => (
                          <div key={dayIdx} className="bg-racing-surface border border-racing-border p-3">
                            <p className="text-xs font-mono text-racing-textDim uppercase tracking-wider mb-2">{DAYS_FULL[parseInt(dayIdx)]}</p>
                            <div className="space-y-1">
                              {slots.map((slot) => (
                                <div key={slot.id} className="flex items-center justify-between">
                                  <span className="text-sm font-mono text-white" title={`UTC: ${slot.timeSlot}`}>{utcSlotToLocal(slot.timeSlot, Intl.DateTimeFormat().resolvedOptions().timeZone)}</span>
                                  <button onClick={() => {
                                    // compute the actual date for this day in the current week
                                    const monday = getMondayOfWeek(new Date());
                                    const d = new Date(monday);
                                    d.setDate(d.getDate() + parseInt(dayIdx));
                                    const dateStr = d.toISOString().split("T")[0];
                                    setPreselectDate(dateStr);
                                    setSelectedClient(client);
                                    setShowNewSession(true);
                                  }} className="text-xs font-mono text-racing-green hover:text-white transition-colors" title="Create session"><Plus size={11} /></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {clients.every((c) => !availability.some((a) => a.clientId === c.id)) && (
                  <p className="text-racing-textDim text-sm font-mono text-center py-12">No drivers have marked their availability yet</p>
                )}
              </div>
            </div>
          )}

          {!loading && tab === "history" && (
            <div className="animate-fade-in">
              <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-6">History</h1>
              <div className="flex gap-2 flex-wrap mb-6">
                <button onClick={() => setSelectedClient(null)} className={`text-xs font-mono px-3 py-1.5 border transition-colors ${!selectedClient ? "border-racing-red bg-racing-red/10 text-white" : "border-racing-border text-racing-textDim hover:text-white"}`}>All</button>
                {clients.map((c) => (
                  <button key={c.id} onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)} className={`text-xs font-mono px-3 py-1.5 border transition-colors ${selectedClient?.id === c.id ? "border-racing-red bg-racing-red/10 text-white" : "border-racing-border text-racing-textDim hover:text-white"}`}>{c.name.split(" ")[0]}</button>
                ))}
              </div>
              {clients.filter((c) => !selectedClient || c.id === selectedClient.id).map((client) => {
                const clientSessions = sessions.filter((s) => s.clientId === client.id && !isUpcoming(s.date, s.time)).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
                if (clientSessions.length === 0) return null;
                return (
                  <div key={client.id} className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-racing-muted border border-racing-border flex items-center justify-center"><span className="font-display font-black text-xs text-white">{client.avatar}</span></div>
                      <h2 className="font-display font-bold text-white uppercase tracking-wide">{client.name}</h2>
                      <span className="text-racing-textDim text-xs font-mono">{clientSessions.length} sessions</span>
                    </div>
                    <div className="space-y-2 pl-11">
                      {clientSessions.map((s) => <SessionCard key={s.id} session={s} showClient={false} onNotesEdit={setShowEditNotes} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && tab === "settings" && (
            <SettingsTab clients={clients} onReload={reload} />
          )}
        </main>
      </div>

      {showSessionDetail && (
        <Modal title="Session Detail" onClose={() => setShowSessionDetail(null)}>
          <SessionDetailView session={showSessionDetail} client={getClient(showSessionDetail.clientId)}
            onStatusChange={async (id, status) => { handleStatusChange(id, status); setShowSessionDetail((prev) => prev ? { ...prev, status } : null); }}
            onDelete={async (id) => { await handleDeleteSession(id); setShowSessionDetail(null); }}
            onNotesEdit={(s) => { setShowEditNotes(s); setShowSessionDetail(null); }} />
        </Modal>
      )}

      {showEditNotes && (
        <Modal title="Post-Session Notes" onClose={() => setShowEditNotes(null)}>
          <NotesForm session={showEditNotes}
            onSave={async (notes) => { await saveSession({ ...showEditNotes, coachNotes: notes }); await reload(); setShowEditNotes(null); }}
            onClose={() => setShowEditNotes(null)} />
        </Modal>
      )}

      {showNewSession && (
        <Modal title="New Session" onClose={() => { setShowNewSession(false); setSelectedClient(null); }}>
          <NewSessionForm clients={clients} preselectedClient={selectedClient} preselectDate={preselectDate}
            onSave={async (session) => { await saveSession(session); await reload(); setShowNewSession(false); setSelectedClient(null); setPreselectDate(""); }}
            onClose={() => { setShowNewSession(false); setSelectedClient(null); setPreselectDate(""); }} />
        </Modal>
      )}

      {showNewClient && (
        <Modal title="New Driver" onClose={() => setShowNewClient(false)}>
          <ClientForm onSave={async (client) => { await saveClient(client); await reload(); setShowNewClient(false); }} onClose={() => setShowNewClient(false)} />
        </Modal>
      )}

      {showEditClient && (
        <Modal title="Edit Driver" onClose={() => setShowEditClient(null)}>
          <ClientForm existing={showEditClient} onSave={async (client) => { await saveClient(client); await reload(); setShowEditClient(null); }} onClose={() => setShowEditClient(null)} />
        </Modal>
      )}
    </div>
  );
}

// Sub-components (SessionDetailView, NotesForm, NewSessionForm, ClientForm)

function SessionDetailView({ session, client, onStatusChange, onDelete, onNotesEdit }: { session: Session; client?: Client; onStatusChange: (id: string, status: SessionStatus) => void; onDelete: (id: string) => void; onNotesEdit: (s: Session) => void; }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{SESSION_TYPE_ICONS[session.type]}</span>
        <div>
          <p className="font-display font-bold text-white uppercase tracking-wide text-lg">{session.type}</p>
          <p className="text-racing-textDim text-sm font-mono">{formatDateLong(session.date)} · {session.time} · {session.duration} min</p>
          {client && <p className="text-racing-textDim text-sm font-mono mt-0.5">Driver: {client.name}</p>}
        </div>
      </div>
      <div className={`inline-flex text-xs px-2 py-1 border font-mono ${getStatusClass(session.status)}`}>{getStatusLabel(session.status).toUpperCase()}</div>
      {session.coachNotes && (
        <div className="bg-racing-surface border-l-2 border-racing-blue/50 pl-3 py-3 pr-3">
          <p className="text-xs font-mono text-racing-textDim uppercase tracking-wider mb-1">Coach notes</p>
          <p className="text-sm text-racing-text leading-relaxed">{session.coachNotes}</p>
        </div>
      )}
      <div className="flex gap-2 flex-wrap pt-2 border-t border-racing-border">
        <button onClick={() => onNotesEdit(session)} className="flex items-center gap-1.5 text-xs font-mono border border-racing-border px-3 py-2 text-racing-textDim hover:text-white transition-colors"><Edit3 size={11} /> Edit notes</button>
        {session.status === "pending" && <button onClick={() => onStatusChange(session.id, "confirmed")} className="flex items-center gap-1.5 text-xs font-mono border border-racing-green/40 px-3 py-2 text-racing-green hover:bg-racing-green/10 transition-colors"><CheckCircle2 size={11} /> Confirm</button>}
        {session.status === "confirmed" && <button onClick={() => onStatusChange(session.id, "completed")} className="flex items-center gap-1.5 text-xs font-mono border border-racing-blue/40 px-3 py-2 text-racing-blue hover:bg-racing-blue/10 transition-colors"><CheckCircle2 size={11} /> Complete</button>}
        <button onClick={() => { if (confirm("Delete session?")) onDelete(session.id); }} className="flex items-center gap-1.5 text-xs font-mono border border-racing-border px-3 py-2 text-racing-textDim hover:text-racing-red hover:border-racing-red/40 transition-colors ml-auto"><Trash2 size={11} /> Delete</button>
      </div>
    </div>
  );
}

function NotesForm({ session, onSave, onClose }: { session: Session; onSave: (notes: string) => void; onClose: () => void; }) {
  const [notes, setNotes] = useState(session.coachNotes);
  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-racing-textDim">{SESSION_TYPE_ICONS[session.type]} {session.type} · {formatDate(session.date)} · {session.time}</p>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-racing-surface border border-racing-border text-white text-sm p-3 font-body leading-relaxed focus:outline-none focus:border-racing-red/50 transition-colors resize-none" rows={8} placeholder="Write your post-session notes for the driver…" autoFocus />
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="text-xs font-mono border border-racing-border px-4 py-2 text-racing-textDim hover:text-white transition-colors">Cancel</button>
        <button onClick={() => onSave(notes)} className="text-xs font-mono racing-stripe px-4 py-2 text-white font-bold uppercase tracking-wider hover:opacity-90">Save notes</button>
      </div>
    </div>
  );
}

function NewSessionForm({ clients, preselectedClient, preselectDate, onSave, onClose }: { clients: Client[]; preselectedClient: Client | null; preselectDate?: string; onSave: (session: Session) => void; onClose: () => void; }) {
  const [clientId, setClientId] = useState(preselectedClient?.id ?? "");
  const [date, setDate] = useState(preselectDate ?? "");
  const [time, setTime] = useState("19:00");
  const [duration, setDuration] = useState(90);
  const [type, setType] = useState<SessionType>("free practice");
  const inputClass = "w-full bg-racing-surface border border-racing-border text-white text-sm px-3 py-2 focus:outline-none focus:border-racing-red/50 transition-colors font-mono";
  const labelClass = "text-xs font-mono text-racing-textDim uppercase tracking-wider block mb-1";
  const handleSubmit = () => {
    if (!clientId || !date) return;
    onSave({ id: generateId("s"), clientId, date, time, duration, type, status: "pending", coachNotes: "", createdAt: new Date().toISOString() });
  };
  return (
    <div className="space-y-4">
      <div><label className={labelClass}>Driver</label><select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}><option value="">— Select driver —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Time</label><select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass}>{TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Duration (min)</label><select value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className={inputClass}>{[30, 45, 60, 90, 120, 150, 180].map((d) => <option key={d} value={d}>{d} min</option>)}</select></div>
        <div><label className={labelClass}>Type</label><select value={type} onChange={(e) => setType(e.target.value as SessionType)} className={inputClass}>{SESSION_TYPES.map((t) => <option key={t} value={t}>{SESSION_TYPE_ICONS[t]} {t}</option>)}</select></div>
      </div>
      <div className="flex gap-2 justify-end pt-2 border-t border-racing-border">
        <button onClick={onClose} className="text-xs font-mono border border-racing-border px-4 py-2 text-racing-textDim hover:text-white transition-colors">Cancel</button>
        <button onClick={handleSubmit} disabled={!clientId || !date} className="text-xs font-mono racing-stripe px-4 py-2 text-white font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed">Create Session</button>
      </div>
    </div>
  );
}

function ClientForm({ existing, onSave, onClose }: { existing?: Client; onSave: (client: Client) => void; onClose: () => void; }) {
  const [name, setName] = useState(existing?.name ?? "");
  const [code, setCode] = useState(existing?.code ?? "");
  const [level, setLevel] = useState<ClientLevel>(existing?.level ?? "beginner");
  const [simulator, setSimulator] = useState<Simulator>(existing?.simulator ?? "iRacing");
  const [notes, setNotes] = useState(existing?.privateNotes ?? "");
  const inputClass = "w-full bg-racing-surface border border-racing-border text-white text-sm px-3 py-2 focus:outline-none focus:border-racing-red/50 transition-colors font-mono";
  const labelClass = "text-xs font-mono text-racing-textDim uppercase tracking-wider block mb-1";
  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) return;
    onSave({ id: existing?.id ?? generateId("c"), name: name.trim(), code: code.trim().toUpperCase(), level, simulator, privateNotes: notes, timezone: existing?.timezone ?? "", joinedAt: existing?.joinedAt ?? new Date().toISOString().split("T")[0], avatar: name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) });
  };
  return (
    <div className="space-y-4">
      <div><label className={labelClass}>Full name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Alex Rivera" autoFocus /></div>
      <div>
        <label className={labelClass}>Access code</label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={inputClass} placeholder="e.g. ALEX01" maxLength={10} />
        <p className="text-racing-textDim text-xs font-mono mt-1">The driver will use this code to log in</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Level</label><select value={level} onChange={(e) => setLevel(e.target.value as ClientLevel)} className={inputClass}>{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
        <div><label className={labelClass}>Simulator</label><select value={simulator} onChange={(e) => setSimulator(e.target.value as Simulator)} className={inputClass}>{SIMULATORS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
      </div>
      <div><label className={labelClass}>Private notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} rows={4} placeholder="Notes visible only to the coach…" /></div>
      <div className="flex gap-2 justify-end pt-2 border-t border-racing-border">
        <button onClick={onClose} className="text-xs font-mono border border-racing-border px-4 py-2 text-racing-textDim hover:text-white transition-colors">Cancel</button>
        <button onClick={handleSubmit} disabled={!name.trim() || !code.trim()} className="text-xs font-mono racing-stripe px-4 py-2 text-white font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed">{existing ? "Save changes" : "Create driver"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════ SETTINGS TAB ═══════════════════════════════════════

function SettingsTab({ clients, onReload }: { clients: Client[]; onReload: () => void }) {
  return (
    <div className="animate-fade-in space-y-8 max-w-xl">
      <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">Settings</h1>
      <ChangePinSection />
      <DriverCodesSection clients={clients} onReload={onReload} />
    </div>
  );
}

// ── Change Coach PIN ──────────────────────────────────────────────────────────

function ChangePinSection() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleChange = async () => {
    if (newPin.length < 4) { setMsg("PIN must be at least 4 digits"); setStatus("error"); return; }
    if (newPin !== confirmPin) { setMsg("PINs don't match"); setStatus("error"); return; }
    setStatus("loading");
    const correct = await getCoachPin();
    if (currentPin !== correct) { setMsg("Current PIN is incorrect"); setStatus("error"); setCurrentPin(""); return; }
    await setCoachPin(newPin);
    setMsg("PIN changed successfully!");
    setStatus("success");
    setCurrentPin(""); setNewPin(""); setConfirmPin("");
    setTimeout(() => { setStatus("idle"); setMsg(""); }, 3000);
  };

  const inputClass = "w-full bg-racing-surface border border-racing-border text-white text-sm px-3 py-2 focus:outline-none focus:border-racing-red/50 transition-colors font-mono tracking-widest";
  const labelClass = "text-xs font-mono text-racing-textDim uppercase tracking-wider block mb-1";

  return (
    <div className="bg-racing-card border border-racing-border p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-4 racing-stripe" />
        <h2 className="font-display font-bold text-white uppercase tracking-widest text-sm">Change Coach PIN</h2>
      </div>
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Current PIN</label>
          <input type="password" value={currentPin} onChange={(e) => { setCurrentPin(e.target.value.replace(/\D/g, "")); setStatus("idle"); }} maxLength={8} className={inputClass} placeholder="••••" />
        </div>
        <div>
          <label className={labelClass}>New PIN</label>
          <input type="password" value={newPin} onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, "")); setStatus("idle"); }} maxLength={8} className={inputClass} placeholder="••••" />
        </div>
        <div>
          <label className={labelClass}>Confirm New PIN</label>
          <input type="password" value={confirmPin} onChange={(e) => { setConfirmPin(e.target.value.replace(/\D/g, "")); setStatus("idle"); }} maxLength={8} className={inputClass} placeholder="••••" onKeyDown={(e) => e.key === "Enter" && handleChange()} />
        </div>
        {msg && (
          <p className={`text-xs font-mono ${status === "success" ? "text-racing-green" : "text-racing-red"}`}>
            {status === "success" ? "✓" : "⚠"} {msg}
          </p>
        )}
        <button onClick={handleChange} disabled={!currentPin || !newPin || !confirmPin || status === "loading"} className="w-full mt-2 py-2.5 racing-stripe text-white font-display font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
          {status === "loading" ? "Saving…" : "Update PIN"}
        </button>
      </div>
    </div>
  );
}

// ── Driver Access Codes ───────────────────────────────────────────────────────

function DriverCodesSection({ clients, onReload }: { clients: Client[]; onReload: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCode, setNewCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [codeError, setCodeError] = useState("");

  const handleSaveCode = async (client: Client) => {
    const trimmed = newCode.trim().toUpperCase();
    if (!trimmed) { setCodeError("Code cannot be empty"); return; }
    if (trimmed.length < 3) { setCodeError("At least 3 characters"); return; }
    // Check uniqueness
    const taken = clients.find((c) => c.id !== client.id && c.code.toUpperCase() === trimmed);
    if (taken) { setCodeError(`Code already used by ${taken.name}`); return; }
    setSaving(true);
    await saveClient({ ...client, code: trimmed });
    onReload();
    setSaving(false);
    setSavedId(client.id);
    setEditingId(null);
    setNewCode("");
    setCodeError("");
    setTimeout(() => setSavedId(null), 2500);
  };

  return (
    <div className="bg-racing-card border border-racing-border p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-4 bg-racing-blue" />
        <h2 className="font-display font-bold text-white uppercase tracking-widest text-sm">Driver Access Codes</h2>
      </div>
      <p className="text-racing-textDim text-xs font-mono mb-4">
        Each driver uses their code to log in. You can change it here at any time — give them the new code so they can access the app.
      </p>
      {clients.length === 0 && (
        <p className="text-racing-textDim text-xs font-mono">No drivers yet. Add them from the Drivers tab.</p>
      )}
      <div className="space-y-2">
        {clients.map((client) => (
          <div key={client.id} className="border border-racing-border bg-racing-surface p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-racing-muted border border-racing-border flex items-center justify-center flex-shrink-0">
                <span className="font-display font-black text-xs text-white">{client.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-white uppercase tracking-wide text-sm">{client.name}</p>
                {editingId !== client.id && (
                  <p className="text-xs font-mono text-racing-textDim mt-0.5">
                    Current code: <span className="text-white tracking-widest">{client.code}</span>
                    {savedId === client.id && <span className="text-racing-green ml-2">✓ Saved</span>}
                  </p>
                )}
              </div>
              {editingId !== client.id && (
                <button
                  onClick={() => { setEditingId(client.id); setNewCode(client.code); setCodeError(""); }}
                  className="text-xs font-mono border border-racing-border px-3 py-1.5 text-racing-textDim hover:text-white transition-colors flex-shrink-0"
                >
                  Change
                </button>
              )}
            </div>
            {editingId === client.id && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => { setNewCode(e.target.value.toUpperCase()); setCodeError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveCode(client)}
                  className="w-full bg-racing-card border border-racing-border text-white font-mono text-sm px-3 py-2 focus:outline-none focus:border-racing-blue/60 transition-colors tracking-widest uppercase"
                  placeholder="NEW CODE"
                  maxLength={12}
                  autoFocus
                />
                {codeError && <p className="text-racing-red text-xs font-mono">⚠ {codeError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(null); setNewCode(""); setCodeError(""); }} className="text-xs font-mono border border-racing-border px-3 py-1.5 text-racing-textDim hover:text-white transition-colors">Cancel</button>
                  <button onClick={() => handleSaveCode(client)} disabled={saving} className="text-xs font-mono bg-racing-blue px-3 py-1.5 text-white font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-opacity">
                    {saving ? "Saving…" : "Save code"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
