import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertTriangle, FileText, UserCheck, CheckCircle2 } from "lucide-react";
import moment from 'moment';
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const activityIcons = {
  case_created: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100' },
  status_changed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' },
  case_assigned: { icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-100' },
  evidence_uploaded: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-100' },
  alert_triggered: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100' },
  note_added: { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100' },
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('saps_read_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 20),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = activities.filter(a => !readIds.includes(a.id)).length;

  const markAsRead = (id) => {
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem('saps_read_notifications', JSON.stringify(newReadIds));
  };

  const markAllAsRead = () => {
    const allIds = activities.map(a => a.id);
    setReadIds(allIds);
    localStorage.setItem('saps_read_notifications', JSON.stringify(allIds));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-[#002244]">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-[#FFD700] text-[#003366] text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-[#003366]">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((activity) => {
                const config = activityIcons[activity.action_type] || activityIcons.note_added;
                const Icon = config.icon;
                const isUnread = !readIds.includes(activity.id);

                return (
                  <div 
                    key={activity.id}
                    onClick={() => markAsRead(activity.id)}
                    className={cn(
                      "p-4 hover:bg-slate-50 cursor-pointer transition-colors",
                      isUnread && "bg-blue-50/50"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", isUnread ? "font-medium text-slate-900" : "text-slate-600")}>
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">
                            {moment(activity.created_date).fromNow()}
                          </span>
                          {activity.case_number && (
                            <span className="text-xs font-mono text-[#003366]">
                              {activity.case_number}
                            </span>
                          )}
                        </div>
                      </div>
                      {isUnread && (
                        <div className="h-2 w-2 rounded-full bg-[#003366] shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}