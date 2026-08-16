"use client";

import { useMemo } from "react";
import {
  Session,
  Client,
  getMondayOfWeek,
  DAYS_OF_WEEK,
  SESSION_TYPE_ICONS,
  getStatusClass,
  SessionStatus,
} from "@/lib/store";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyCalendarProps {
  sessions: Session[];
  clients: Client[];
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  onSessionClick: (session: Session) => void;
  onStatusChange: (sessionId: string, status: SessionStatus) => void;
}

export default function WeeklyCalendar({
  sessions,
  clients,
  weekOffset,
  onWeekChange,
  onSessionClick,
  onStatusChange,
}: WeeklyCalendarProps) {
  const weekDays = useMemo(() => {
    const monday = getMondayOfWeek(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    return `${fmt(start)} — ${fmt(end)}, ${start.getFullYear()}`;
  }, [weekDays]);

  const getSessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return sessions
      .filter((s) => s.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getClient = (clientId: string) => clients.find((c) => c.id === clientId);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div>
      {/* Week nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onWeekChange(weekOffset - 1)}
          className="p-2 border border-racing-border text-racing-textDim hover:text-white hover:border-racing-textDim transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-mono text-sm text-racing-textDim tracking-wider">
          {weekLabel}
        </span>
        <button
          onClick={() => onWeekChange(weekOffset + 1)}
          className="p-2 border border-racing-border text-racing-textDim hover:text-white hover:border-racing-textDim transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => {
          const daySessions = getSessionsForDay(day);
          const today = isToday(day);

          return (
            <div key={i} className="min-h-[120px]">
              {/* Day header */}
              <div
                className={`text-center py-2 mb-1 border-b ${
                  today
                    ? "border-racing-red bg-racing-red/10"
                    : "border-racing-border"
                }`}
              >
                <p
                  className={`text-xs font-mono uppercase tracking-widest ${
                    today ? "text-racing-red" : "text-racing-textDim"
                  }`}
                >
                  {DAYS_OF_WEEK[i]}
                </p>
                <p
                  className={`font-display font-bold text-lg leading-none mt-0.5 ${
                    today ? "text-racing-red" : "text-racing-textDim"
                  }`}
                >
                  {day.getDate()}
                </p>
              </div>

              {/* Sessions */}
              <div className="space-y-1 px-0.5">
                {daySessions.map((session) => {
                  const client = getClient(session.clientId);
                  const statusCls = getStatusClass(session.status);
                  return (
                    <button
                      key={session.id}
                      onClick={() => onSessionClick(session)}
                      className={`w-full text-left p-1.5 border transition-all hover:scale-[1.02] ${statusCls}`}
                    >
                      <p className="text-xs font-mono leading-none mb-0.5">
                        {session.time}
                      </p>
                      <p className="text-xs font-display font-bold truncate uppercase leading-tight">
                        {SESSION_TYPE_ICONS[session.type]}{" "}
                        {client?.name.split(" ")[0] ?? "?"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
