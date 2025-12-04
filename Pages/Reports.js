import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  FileText, Download, Calendar as CalendarIcon, Map, 
  Loader2, CheckCircle, BarChart3, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import moment from 'moment';
import { toast } from "sonner";

const PROVINCES = [
  "All Provinces", "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", 
  "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"
];

const REPORT_TYPES = [
  { id: 'summary', name: 'Executive Summary', desc: 'High-level overview of crime statistics' },
  { id: 'detailed', name: 'Detailed Crime Report', desc: 'Comprehensive breakdown by type and area' },
  { id: 'trend', name: 'Trend Analysis', desc: 'Historical comparison and patterns' },
  { id: 'clearance', name: 'Clearance Rate Report', desc: 'Case resolution metrics' },
];

export default function Reports() {
  const [selectedProvince, setSelectedProvince] = useState("All Provinces");
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedReport, setSelectedReport] = useState(null);

  const { data: cases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: () => base44.entities.Case.list('-created_date', 500),
  });

  // Filter cases by date and province
  const filteredCases = cases.filter(c => {
    const caseDate = new Date(c.created_date);
    const matchesDate = caseDate >= startDate && caseDate <= endDate;
    const matchesProvince = selectedProvince === "All Provinces" || c.province === selectedProvince;
    return matchesDate && matchesProvince;
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportType) => {
      const report = REPORT_TYPES.find(r => r.id === reportType);
      
      // Calculate stats for report
      const stats = {
        total: filteredCases.length,
        solved: filteredCases.filter(c => c.status === 'Solved').length,
        inProgress: filteredCases.filter(c => c.status === 'Under Investigation').length,
        critical: filteredCases.filter(c => c.priority === 'Critical').length,
        byType: {},
        byProvince: {},
      };

      filteredCases.forEach(c => {
        stats.byType[c.crime_type] = (stats.byType[c.crime_type] || 0) + 1;
        stats.byProvince[c.province] = (stats.byProvince[c.province] || 0) + 1;
      });

      // Generate report content using LLM
      const prompt = `Generate a professional ${report.name} for South African Police Services (SAPS).

Date Range: ${format(startDate, 'dd MMM yyyy')} to ${format(endDate, 'dd MMM yyyy')}
Province: ${selectedProvince}

Statistics:
- Total Cases: ${stats.total}
- Solved Cases: ${stats.solved} (${stats.total > 0 ? ((stats.solved/stats.total)*100).toFixed(1) : 0}% clearance rate)
- Under Investigation: ${stats.inProgress}
- Critical Priority: ${stats.critical}

Crime Type Distribution:
${Object.entries(stats.byType).map(([type, count]) => `- ${type}: ${count} cases`).join('\n')}

${selectedProvince === "All Provinces" ? `Province Distribution:
${Object.entries(stats.byProvince).map(([prov, count]) => `- ${prov}: ${count} cases`).join('\n')}` : ''}

Create a detailed, professional report with:
1. Executive Summary
2. Key Findings
3. Recommendations
4. Conclusion`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            executive_summary: { type: "string" },
            key_findings: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            conclusion: { type: "string" }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setSelectedReport(data);
      toast.success("Report generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate report");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Ministerial Reports
            </h1>
            <p className="text-slate-500 mt-1">
              Generate official reports and briefings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Configuration */}
          <div className="space-y-6">
            {/* Filters */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Report Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Province */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Province</label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="w-full">
                      <Map className="h-4 w-4 mr-2 text-slate-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map(province => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Summary Stats */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-500 mb-2">Data Summary</p>
                  <p className="text-2xl font-bold text-slate-900">{filteredCases.length}</p>
                  <p className="text-sm text-slate-500">cases in selected period</p>
                </div>
              </CardContent>
            </Card>

            {/* Report Types */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Report Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {REPORT_TYPES.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => generateReportMutation.mutate(report.id)}
                    disabled={generateReportMutation.isPending}
                    className="w-full p-4 text-left rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{report.name}</p>
                        <p className="text-sm text-slate-500">{report.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Report Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-sm h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Report Preview</CardTitle>
                {selectedReport && (
                  <Button 
                    variant="outline" 
                    className="gap-2 border-[#003366] text-[#003366]"
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>${selectedReport.title || 'SAPS Report'}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 40px; }
                            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #003366; padding-bottom: 20px; }
                            .logo { font-size: 24px; font-weight: bold; color: #003366; }
                            .logo span { color: #FFD700; }
                            h1 { color: #003366; }
                            h2 { color: #003366; margin-top: 20px; }
                            ul { margin: 10px 0; padding-left: 20px; }
                            li { margin: 8px 0; }
                            .conclusion { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px; }
                            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="logo">SAPS <span>CrimeWatch</span></div>
                            <h1>${selectedReport.title || 'Crime Report'}</h1>
                            <p>Generated: ${new Date().toLocaleDateString('en-ZA', { dateStyle: 'full' })}</p>
                          </div>
                          <h2>Executive Summary</h2>
                          <p>${selectedReport.executive_summary}</p>
                          <h2>Key Findings</h2>
                          <ul>${selectedReport.key_findings?.map(f => `<li>${f}</li>`).join('') || ''}</ul>
                          <h2>Recommendations</h2>
                          <ul>${selectedReport.recommendations?.map(r => `<li>${r}</li>`).join('') || ''}</ul>
                          <div class="conclusion">
                            <h2>Conclusion</h2>
                            <p>${selectedReport.conclusion}</p>
                          </div>
                          <div class="footer">
                            <p>South African Police Service - Crime Analytics Platform</p>
                            <p>This document is confidential and for official use only.</p>
                          </div>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.onload = () => printWindow.print();
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {generateReportMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                    <p className="text-slate-600">Generating report...</p>
                  </div>
                ) : selectedReport ? (
                  <div className="prose prose-slate max-w-none">
                    {/* Report Header */}
                    <div className="text-center mb-8 pb-6 border-b">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 rounded-full bg-blue-100">
                          <BarChart3 className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {selectedReport.title || "SAPS Crime Report"}
                      </h2>
                      <p className="text-slate-500">
                        {format(startDate, "dd MMM yyyy")} - {format(endDate, "dd MMM yyyy")} | {selectedProvince}
                      </p>
                    </div>

                    {/* Executive Summary */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Executive Summary
                      </h3>
                      <p className="text-slate-700 leading-relaxed">
                        {selectedReport.executive_summary}
                      </p>
                    </div>

                    {/* Key Findings */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Findings</h3>
                      <ul className="space-y-2">
                        {selectedReport.key_findings?.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-slate-700">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {selectedReport.recommendations?.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mt-0.5 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-slate-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Conclusion */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Conclusion</h3>
                      <p className="text-slate-700">{selectedReport.conclusion}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <FileText className="h-12 w-12 mb-4 opacity-50" />
                    <p>Select a report type to generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}