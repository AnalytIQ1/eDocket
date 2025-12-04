import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { 
  Plus, Grid, List, FileText, Loader2 
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CaseCard from "@/components/cases/CaseCard";
import CaseFilters from "@/components/cases/CaseFilters";
import ExportButtons from "@/components/export/ExportButtons";
import { cn } from "@/lib/utils";

export default function Cases() {
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    crimeType: 'all',
    province: 'all',
    priority: 'all',
  });

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => base44.entities.Case.list('-created_date', 200),
  });

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          c.case_number?.toLowerCase().includes(searchLower) ||
          c.crime_type?.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower) ||
          c.district?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      
      // Crime type filter
      if (filters.crimeType !== 'all' && c.crime_type !== filters.crimeType) return false;
      
      // Province filter
      if (filters.province !== 'all' && c.province !== filters.province) return false;
      
      // Priority filter
      if (filters.priority !== 'all' && c.priority !== filters.priority) return false;
      
      return true;
    });
  }, [cases, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      crimeType: 'all',
      province: 'all',
      priority: 'all',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Case Management
            </h1>
            <p className="text-slate-500 mt-1">
              {filteredCases.length} cases found
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
                            <ExportButtons 
                              data={filteredCases} 
                              filename="saps-cases-export" 
                              title="SAPS Case Report"
                            />
                            <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className={cn(
                                  "rounded-md",
                                  viewMode === 'list' && "bg-[#003366]/10 text-[#003366]"
                                )}
                              >
                                <List className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                  "rounded-md",
                                  viewMode === 'grid' && "bg-[#003366]/10 text-[#003366]"
                                )}
                              >
                                <Grid className="h-4 w-4" />
                              </Button>
                            </div>
                            <Link to={createPageUrl("NewCase")}>
                              <Button className="bg-[#003366] hover:bg-[#002244] gap-2">
                                <Plus className="h-4 w-4" />
                                New Case
                              </Button>
                            </Link>
                          </div>
        </div>

        {/* Filters */}
        <CaseFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onClear={clearFilters}
        />

        {/* Cases List/Grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No cases found</h3>
              <p className="text-slate-500 mb-4">
                {cases.length === 0 
                  ? "Start by creating your first case" 
                  : "Try adjusting your filters"}
              </p>
              <Link to={createPageUrl("NewCase")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Case
                </Button>
              </Link>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                : "space-y-3"
            )}>
              {filteredCases.map(caseItem => (
                <CaseCard 
                  key={caseItem.id} 
                  caseData={caseItem}
                  compact={viewMode === 'grid'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}