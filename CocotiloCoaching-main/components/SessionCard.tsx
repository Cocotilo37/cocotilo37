"use client";

import {
  Session,
  Client,
  getStatusClass,
  getStatusLabel,
  formatDate,
  SESSION_TYPE_ICONS,
  SessionStatus,
} from "@/lib/store";
import { Clock, User, FileText, CheckCircle, XCircle, Edit3 } from "lucide-react";

interface SessionCardProps {
  session: Session;
  client?: Client;
  onStatusChange?: (sessionId: string, status: SessionStatus) => void;
  onNotesEdit?: (session: Session) => void;
  showClient?: boolean;
  compact?: boolean;
}

export default function SessionCard({
  session,
  client,
  onStatusChange,
  onNotesEdit,
  showClient = true,
  compact = false,
}: SessionCardProps) {
  const statusClass = getStatusClass(session.status);
  const icon = SESSION_TYPE_ICONS[session.type];

  return (
    <div
      className={`card-accent bg-racing-card border border-racing-border hover:border-racing-muted transition-all duration-200 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Type icon */}
          <div className="w-9 h-9 bg-racing-muted border border-racing-border flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-base">{icon}</span>
          </div>

          {/* Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-white uppercase tracking-wide text-sm">
                {session.type}
              </span>
              <span
                className={`text-xs px-2 py-0.5 border font-mono tracking-wide ${statusClass}`}
              >
                {getStatusLabel(session.status).toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-racing-textDim text-xs font-mono flex items-center gap-1">
                <Clock size={10} />
                {formatDate(session.date)} · {session.time}
              </span>
              <span className="text-racing-textDim text-xs font-mono">
                {session.duration} min
              </span>
            </div>

            {showClient && client && (
              <div className="flex items-center gap-1 mt-1">
                <User size={10} className="text-racing-textDim" />
                <span className="text-racing-textDim text-xs font-mono">
                  {client.name}
                </span>
              </div>
            )}

            {session.coachNotes && !compact && (
              <div className="mt-2 bg-racing-muted/50 border-l-2 border-racing-blue/50 px-2 py-1.5">
                <p className="text-xs text-racing-textDim leading-relaxed line-clamp-2">
                  <FileText size={10} className="inline mr-1 text-racing-blue/70" />
                  {session.coachNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {(onStatusChange || onNotesEdit) && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            {onNotesEdit && (
              <button
                onClick={() => onNotesEdit(session)}
                className="p-1.5 border border-racing-border text-racing-textDim hover:text-white hover:border-racing-textDim transition-colors"
                title="Edit notes"
              >
                <Edit3 size={12} />
              </button>
            )}
            {onStatusChange && session.status === "pending" && (
              <>
                <button
                  onClick={() => onStatusChange(session.id, "confirmed")}
                  className="p-1.5 border border-racing-border text-racing-green hover:bg-racing-green/10 transition-colors"
                  title="Confirm"
                >
                  <CheckCircle size={12} />
                </button>
                <button
                  onClick={() => onStatusChange(session.id, "cancelled")}
                  className="p-1.5 border border-racing-border text-racing-red hover:bg-racing-red/10 transition-colors"
                  title="Cancel"
                >
                  <XCircle size={12} />
                </button>
              </>
            )}
            {onStatusChange && session.status === "confirmed" && (
              <button
                onClick={() => onStatusChange(session.id, "completed")}
                className="p-1.5 border border-racing-blue/40 text-racing-blue hover:bg-racing-blue/10 transition-colors text-xs font-mono"
                title="Mark as completed"
              >
                ✓
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
