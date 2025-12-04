import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityConfig = {
  "Low": { color: "bg-slate-100 text-slate-700 border-slate-200" },
  "Medium": { color: "bg-blue-100 text-blue-700 border-blue-200" },
  "High": { color: "bg-orange-100 text-orange-700 border-orange-200" },
  "Critical": { color: "bg-red-100 text-red-700 border-red-200 animate-pulse" }
};

export default function CasePriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig["Medium"];

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium border", config.color)}
    >
      {priority}
    </Badge>
  );
}