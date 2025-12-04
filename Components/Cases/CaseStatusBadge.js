import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, Search, FileSearch, UserSearch, 
  Clock, Lock, Scale, CheckCircle, XCircle, Snowflake 
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  "Reported": { 
    icon: AlertCircle, 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Reported"
  },
  "Under Investigation": { 
    icon: Search, 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Under Investigation"
  },
  "Evidence Collection": { 
    icon: FileSearch, 
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Evidence Collection"
  },
  "Suspect Identified": { 
    icon: UserSearch, 
    color: "bg-purple-100 text-purple-800 border-purple-200",
    label: "Suspect Identified"
  },
  "Awaiting Arrest": { 
    icon: Clock, 
    color: "bg-pink-100 text-pink-800 border-pink-200",
    label: "Awaiting Arrest"
  },
  "Arrest Made": { 
    icon: Lock, 
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    label: "Arrest Made"
  },
  "In Court": { 
    icon: Scale, 
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    label: "In Court"
  },
  "Solved": { 
    icon: CheckCircle, 
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Solved"
  },
  "Closed": { 
    icon: XCircle, 
    color: "bg-slate-100 text-slate-800 border-slate-200",
    label: "Closed"
  },
  "Cold Case": { 
    icon: Snowflake, 
    color: "bg-gray-100 text-gray-600 border-gray-200",
    label: "Cold Case"
  }
};

export default function CaseStatusBadge({ status, size = "default" }) {
  const config = statusConfig[status] || statusConfig["Reported"];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border inline-flex items-center gap-1.5",
        config.color,
        sizeClasses[size]
      )}
    >
      <Icon className={cn(
        size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
      )} />
      {config.label}
    </Badge>
  );
}