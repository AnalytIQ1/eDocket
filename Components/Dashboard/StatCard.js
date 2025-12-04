import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  iconBg = "bg-[#003366]",
  trend = "neutral"
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-red-500" : trend === "down" ? "text-green-500" : "text-slate-400";

  return (
    <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-[#003366] mt-2">{value}</p>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{change}%</span>
              <span className="text-xs text-slate-400 ml-1">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <Icon className="h-6 w-6 text-[#FFD700]" />
        </div>
      </div>
    </Card>
  );
}