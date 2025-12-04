import React from 'react';
import { 
  AlertCircle, Search, FileSearch, UserSearch, 
  Clock, Lock, Scale, CheckCircle, XCircle, Snowflake 
} from "lucide-react";
import { cn } from "@/lib/utils";
import moment from 'moment';

const statusFlow = [
  { key: "Reported", icon: AlertCircle, color: "yellow" },
  { key: "Under Investigation", icon: Search, color: "blue" },
  { key: "Evidence Collection", icon: FileSearch, color: "orange" },
  { key: "Suspect Identified", icon: UserSearch, color: "purple" },
  { key: "Awaiting Arrest", icon: Clock, color: "pink" },
  { key: "Arrest Made", icon: Lock, color: "indigo" },
  { key: "In Court", icon: Scale, color: "cyan" },
  { key: "Solved", icon: CheckCircle, color: "green" },
];

const colorMap = {
  yellow: { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-700", icon: "text-yellow-600" },
  blue: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700", icon: "text-blue-600" },
  orange: { bg: "bg-orange-100", border: "border-orange-500", text: "text-orange-700", icon: "text-orange-600" },
  purple: { bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-700", icon: "text-purple-600" },
  pink: { bg: "bg-pink-100", border: "border-pink-500", text: "text-pink-700", icon: "text-pink-600" },
  indigo: { bg: "bg-indigo-100", border: "border-indigo-500", text: "text-indigo-700", icon: "text-indigo-600" },
  cyan: { bg: "bg-cyan-100", border: "border-cyan-500", text: "text-cyan-700", icon: "text-cyan-600" },
  green: { bg: "bg-green-100", border: "border-green-500", text: "text-green-700", icon: "text-green-600" },
};

export default function StatusTimeline({ currentStatus, statusHistory = [] }) {
  const currentIndex = statusFlow.findIndex(s => s.key === currentStatus);
  
  // Create a map for quick lookup of history dates
  const historyMap = {};
  statusHistory.forEach(h => {
    historyMap[h.status] = h;
  });

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-slate-200" />

      <div className="space-y-4">
        {statusFlow.map((status, idx) => {
          const Icon = status.icon;
          const colors = colorMap[status.color];
          const isPast = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const historyEntry = historyMap[status.key];
          
          return (
            <div 
              key={status.key}
              className={cn(
                "relative flex items-center gap-4 pl-2",
                !isPast && !isCurrent && "opacity-40"
              )}
            >
              {/* Icon circle */}
              <div className={cn(
                "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2",
                isCurrent ? `${colors.bg} ${colors.border}` : 
                isPast ? "bg-green-100 border-green-500" : 
                "bg-slate-100 border-slate-300"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  isCurrent ? colors.icon : 
                  isPast ? "text-green-600" : 
                  "text-slate-400"
                )} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={cn(
                  "font-medium",
                  isCurrent ? colors.text : 
                  isPast ? "text-slate-900" : 
                  "text-slate-500"
                )}>
                  {status.key}
                  {isCurrent && (
                    <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </p>
                {historyEntry && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {moment(historyEntry.date).format('DD MMM YYYY, HH:mm')}
                    {historyEntry.changed_by && ` • ${historyEntry.changed_by}`}
                  </p>
                )}
              </div>

              {/* Checkmark for completed */}
              {isPast && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}