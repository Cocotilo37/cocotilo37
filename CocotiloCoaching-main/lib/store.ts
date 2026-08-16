"use client";

import { supabase } from "./supabase";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ClientLevel = "beginner" | "intermediate" | "advanced";
export type Simulator = "iRacing" | "ACC" | "AMS2" | "rFactor2" | "F1 24" | "Gran Turismo 7" | "Other";
export type SessionType = "free practice" | "telemetry analysis" | "race session" | "debriefing";
export type SessionStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Client {
  id: string;
  name: string;
  code: string;
  level: ClientLevel;
  simulator: Simulator;
  privateNotes: string;
  timezone: string; // IANA timezone, e.g. 'Europe/Madrid'
  joinedAt: string;
  avatar: string;
}

export interface Session {
  id: string;
  clientId: string;
  date: string;
  time: string;
  duration: number;
  type: SessionType;
  status: SessionStatus;
  coachNotes: string;
  createdAt: string;
}

export interface Availability {
  id: string;
  clientId: string;
  dayOfWeek: number;
  timeSlot: string;
  weekOf: string;
}

// ─── Coach PIN (stored in Supabase settings table) ────────────────────────────

export async function getCoachPin(): Promise<string> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "coach_pin")
    .single();
  if (error || !data) return "1234"; // fallback default
  return data.value as string;
}

export async function setCoachPin(pin: string): Promise<void> {
  await supabase
    .from("settings")
    .upsert({ key: "coach_pin", value: pin });
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

export const SESSION_TYPES: SessionType[] = [
  "free practice", "telemetry analysis", "race session", "debriefing",
];

export const SIMULATORS: Simulator[] = [
  "iRacing", "ACC", "AMS2", "rFactor2", "F1 24", "Gran Turismo 7", "Other",
];

export const LEVELS: ClientLevel[] = ["beginner", "intermediate", "advanced"];

export const SESSION_TYPE_ICONS: Record<SessionType, string> = {
  "free practice": "🏁",
  "telemetry analysis": "📊",
  "race session": "🏎️",
  "debriefing": "📋",
};

// ─── ID generator ─────────────────────────────────────────────────────────────

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Client helpers ───────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase.from("clients").select("*").order("joined_at", { ascending: true });
  if (error) { console.error(error); return []; }
  return (data ?? []).map(mapClient);
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error || !data) return undefined;
  return mapClient(data);
}

export async function getClientByCode(code: string): Promise<Client | undefined> {
  const { data, error } = await supabase.from("clients").select("*").ilike("code", code).single();
  if (error || !data) return undefined;
  return mapClient(data);
}

export async function saveClient(client: Client): Promise<void> {
  const row = {
    id: client.id, name: client.name, code: client.code, level: client.level,
    simulator: client.simulator, private_notes: client.privateNotes,
    timezone: client.timezone ?? "",
    joined_at: client.joinedAt, avatar: client.avatar,
  };
  const { error } = await supabase.from("clients").upsert(row);
  if (error) console.error(error);
}

export async function deleteClient(id: string): Promise<void> {
  await supabase.from("availability").delete().eq("client_id", id);
  await supabase.from("sessions").delete().eq("client_id", id);
  await supabase.from("clients").delete().eq("id", id);
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export async function getSessions(): Promise<Session[]> {
  const { data, error } = await supabase.from("sessions").select("*").order("date", { ascending: true });
  if (error) { console.error(error); return []; }
  return (data ?? []).map(mapSession);
}

export async function getSessionsByClientId(clientId: string): Promise<Session[]> {
  const { data, error } = await supabase.from("sessions").select("*").eq("client_id", clientId).order("date", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []).map(mapSession);
}

export async function saveSession(session: Session): Promise<void> {
  const row = {
    id: session.id, client_id: session.clientId, date: session.date, time: session.time,
    duration: session.duration, type: session.type, status: session.status,
    coach_notes: session.coachNotes, created_at: session.createdAt,
  };
  const { error } = await supabase.from("sessions").upsert(row);
  if (error) console.error(error);
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) console.error(error);
}

// ─── Availability helpers ─────────────────────────────────────────────────────

export async function getAvailability(): Promise<Availability[]> {
  const { data, error } = await supabase.from("availability").select("*");
  if (error) { console.error(error); return []; }
  return (data ?? []).map(mapAvailability);
}

export async function getAvailabilityByClient(clientId: string): Promise<Availability[]> {
  const { data, error } = await supabase.from("availability").select("*").eq("client_id", clientId);
  if (error) { console.error(error); return []; }
  return (data ?? []).map(mapAvailability);
}

export async function saveAvailability(avail: Availability[]): Promise<void> {
  if (avail.length === 0) return;
  const clientId = avail[0].clientId;
  const weekOf = avail[0].weekOf;
  await supabase.from("availability").delete().eq("client_id", clientId).eq("week_of", weekOf);
  const validSlots = avail.filter((a) => a.dayOfWeek >= 0 && a.timeSlot);
  if (validSlots.length === 0) return;
  const rows = validSlots.map((a) => ({ id: a.id, client_id: a.clientId, day_of_week: a.dayOfWeek, time_slot: a.timeSlot, week_of: a.weekOf }));
  const { error } = await supabase.from("availability").insert(rows);
  if (error) console.error(error);
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

function mapClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string, name: row.name as string, code: row.code as string,
    level: row.level as ClientLevel, simulator: row.simulator as Simulator,
    privateNotes: (row.private_notes as string) ?? "", timezone: (row.timezone as string) ?? "",
    joinedAt: row.joined_at as string, avatar: row.avatar as string,
  };
}

function mapSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string, clientId: row.client_id as string, date: row.date as string,
    time: row.time as string, duration: row.duration as number, type: row.type as SessionType,
    status: row.status as SessionStatus, coachNotes: (row.coach_notes as string) ?? "",
    createdAt: row.created_at as string,
  };
}

function mapAvailability(row: Record<string, unknown>): Availability {
  return {
    id: row.id as string, clientId: row.client_id as string, dayOfWeek: row.day_of_week as number,
    timeSlot: row.time_slot as string, weekOf: row.week_of as string,
  };
}

// ─── Date utilities ────────────────────────────────────────────────────────────

export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function isUpcoming(dateStr: string, timeStr: string): boolean {
  return new Date(`${dateStr}T${timeStr}:00`) > new Date();
}

export function getLevelColor(level: ClientLevel): string {
  switch (level) {
    case "beginner": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    case "intermediate": return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    case "advanced": return "text-racing-red bg-racing-red/10 border-racing-red/30";
  }
}

export function getStatusClass(status: SessionStatus): string {
  switch (status) {
    case "pending": return "status-pending";
    case "confirmed": return "status-confirmed";
    case "completed": return "status-completed";
    case "cancelled": return "status-cancelled";
  }
}

export function getStatusLabel(status: SessionStatus): string {
  switch (status) {
    case "pending": return "Pending";
    case "confirmed": return "Confirmed";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
  }
}
