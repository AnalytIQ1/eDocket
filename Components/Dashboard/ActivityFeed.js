import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, AlertCircle, CheckCircle, UserPlus, 
  Upload, MessageSquare, Clock, Activity 
} from "lucide-react";
import { cn } from "@/lib/utils";
import moment from 'moment';

const activityIcons = {
  case_created: { icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  status_changed: { icon: Activity, color: "text-orange-500", bg: "bg-orange-50" },
  case_assigned: { icon: UserPlus, color: "text-purple-500", bg: "bg-purple-50" },
  evidence_uploaded: { icon: Upload, color: "text-green-500", bg: "bg-green-50" },
  note_added: { icon: MessageSquare, color: "text-cyan-500", bg: "bg-cyan-50" },
  case_closed: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
  alert_triggered: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" }
};

export default function ActivityFeed({ activities = [] }) {
  const getActivityStyle = (type) => {
    return activityIcons[type] || { icon: Clock, color: "text-slate-500", bg: "bg-slate-50" };
  };

  // Sort by most recent
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  ).slice(0, 15);

  return (
    <Card className="bg-white border-0 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Live Activity Feed
          <span className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-normal text-slate-400">Live</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-6">
          {sortedActivities.length > 0 ? (
            <div className="space-y-1 pb-4">
              {sortedActivities.map((activity, idx) => {
                const style = getActivityStyle(activity.action_type);
                const Icon = style.icon;
                
                return (
                  <div 
                    key={activity.id || idx}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-slate-50",
                      idx === 0 && "bg-blue-50/50"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", style.bg)}>
                      <Icon className={cn("h-4 w-4", style.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 leading-tight">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">
                          {moment(activity.created_date).fromNow()}
                        </span>
                        {activity.user_name && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">{activity.user_name}</span>
                          </>
                        )}
                        {activity.province && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">{activity.province}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}