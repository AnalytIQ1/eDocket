import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { 
  FileText, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, Shield, Plus, RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatCard from "@/components/dashboard/StatCard";

// SAPS Colors
const SAPS_BLUE = "#003366";
const SAPS_GOLD = "#FFD700";
import CrimeHeatMap from "@/components/dashboard/CrimeHeatMap";
import CrimeTrendChart from "@/components/dashboard/CrimeTrendChart";
import CrimeTypeBreakdown from "@/components/dashboard/CrimeTypeBreakdown";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProvinceComparison from "@/components/dashboard/ProvinceComparison";
import CaseCard from "@/components/cases/CaseCard";

export default function Dashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: cases = [], isLoading: casesLoading, refetch: refetchCases } = useQuery({
    queryKey: ['cases'],
    queryFn: () => base44.entities.Case.list('-created_date', 100),
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 20),
  });

  // Calculate stats
  const stats = {
    totalCases: cases.length,
    activeCases: cases.filter(c => !['Solved', 'Closed', 'Cold Case'].includes(c.status)).length,
    solvedCases: cases.filter(c => c.status === 'Solved').length,
    criticalCases: cases.filter(c => c.priority === 'Critical').length,
  };

  const recentCases = cases.slice(0, 4);

  const handleRefresh = () => {
    refetchCases();
    setLastRefresh(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Crime Analytics Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Real-time crime monitoring and case management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Link to={createPageUrl("NewCase")}>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="h-4 w-4" />
                New Case
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard 
            title="Total Cases"
            value={stats.totalCases.toLocaleString()}
            icon={FileText}
            iconBg="bg-blue-500"
          />
          <StatCard 
            title="Active Cases"
            value={stats.activeCases.toLocaleString()}
            icon={Clock}
            iconBg="bg-orange-500"
            change={12}
            changeLabel="vs last month"
            trend="up"
          />
          <StatCard 
            title="Cases Solved"
            value={stats.solvedCases.toLocaleString()}
            icon={CheckCircle}
            iconBg="bg-green-500"
            change={8}
            changeLabel="vs last month"
            trend="down"
          />
          <StatCard 
            title="Critical Priority"
            value={stats.criticalCases.toLocaleString()}
            icon={AlertTriangle}
            iconBg="bg-red-500"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Crime Heat Map - Takes 2 columns */}
          <div className="lg:col-span-2">
            <CrimeHeatMap cases={cases} />
          </div>
          
          {/* Activity Feed */}
          <div>
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CrimeTrendChart title="Crime Trends (2018-2023)" />
          <CrimeTypeBreakdown cases={cases} />
        </div>

        {/* Province Comparison and Recent Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProvinceComparison cases={cases} />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Cases</h2>
              <Link to={createPageUrl("Cases")}>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentCases.map(caseItem => (
                <CaseCard key={caseItem.id} caseData={caseItem} compact />
              ))}
              {recentCases.length === 0 && !casesLoading && (
                <div className="text-center py-8 text-slate-400">
                  No cases recorded yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}