"use client";

import { useState, useEffect } from "react";
import { Client, Session, getLevelColor, getSessionsByClientId } from "@/lib/store";
import { ChevronRight } from "lucide-react";

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  selected?: boolean;
}

export default function ClientCard({ client, onClick, selected }: ClientCardProps) {
  const [upcomingCount, setUpcomingCount] = useState(0);
  const levelColor = getLevelColor(client.level);

  useEffect(() => {
    getSessionsByClientId(client.id).then((sessions: Session[]) => {
      const count = sessions.filter(
        (s) =>
          (s.status === "confirmed" || s.status === "pending") &&
          new Date(`${s.date}T${s.time}`) > new Date()
      ).length;
      setUpcomingCount(count);
    });
  }, [client.id]);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left card-accent bg-racing-card border transition-all duration-200 p-4 group ${
        selected ? "border-racing-red" : "border-racing-border hover:border-racing-muted"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-racing-muted border border-racing-border flex items-center justify-center flex-shrink-0">
          <span className="font-display font-black text-sm text-white">{client.avatar}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white text-sm uppercase tracking-wide truncate">{client.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 border font-mono ${levelColor}`}>{client.level.toUpperCase()}</span>
            <span className="text-racing-textDim text-xs font-mono">{client.simulator}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          {upcomingCount > 0 && (
            <span className="text-xs bg-racing-red/15 border border-racing-red/30 text-racing-red font-mono px-1.5 py-0.5">
              {upcomingCount} upcoming
            </span>
          )}
          <ChevronRight size={14} className="text-racing-textDim group-hover:text-white transition-colors" />
        </div>
      </div>
    </button>
  );
}
