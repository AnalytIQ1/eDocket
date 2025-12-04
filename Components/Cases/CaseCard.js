import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CaseStatusBadge from "./CaseStatusBadge";
import CasePriorityBadge from "./CasePriorityBadge";
import moment from 'moment';
import { cn } from "@/lib/utils";

export default function CaseCard({ caseData, compact = false }) {
  const isUrgent = caseData.priority === "Critical" || caseData.priority === "High";

  return (
    <Card className={cn(
      "bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group",
      isUrgent && "ring-2 ring-red-200"
    )}>
      <CardContent className={cn("p-4", compact ? "p-3" : "p-4 md:p-6")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-mono text-sm font-semibold text-slate-900">
                {caseData.case_number}
              </span>
              <CasePriorityBadge priority={caseData.priority} />
            </div>

            {/* Crime Type */}
            <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">
              {caseData.crime_type}
            </h3>

            {/* Status */}
            <div className="mb-3">
              <CaseStatusBadge status={caseData.status} size="sm" />
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{caseData.province}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{moment(caseData.incident_date).format('DD MMM YYYY')}</span>
              </div>
              {caseData.assigned_officer_name && (
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[100px]">{caseData.assigned_officer_name}</span>
                </div>
              )}
            </div>

            {/* Description preview */}
            {!compact && caseData.description && (
              <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                {caseData.description}
              </p>
            )}
          </div>

          {/* Action */}
          <Link to={createPageUrl("CaseDetails") + `?id=${caseData.id}`}>
            <Button 
              variant="ghost" 
              size="icon"
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}