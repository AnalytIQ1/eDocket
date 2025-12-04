import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    toast.error("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header];
        if (cell === null || cell === undefined) cell = '';
        if (typeof cell === 'object') cell = JSON.stringify(cell);
        // Escape quotes and wrap in quotes if contains comma
        cell = String(cell).replace(/"/g, '""');
        if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("Excel/CSV exported successfully");
}

export function exportToPDF(data, filename, title) {
  if (!data || data.length === 0) {
    toast.error("No data to export");
    return;
  }

  const headers = Object.keys(data[0]).filter(h => 
    !['id', 'created_by', 'updated_date', 'status_history', 'case_notes', 'evidence_files'].includes(h)
  );

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #003366; padding-bottom: 20px; }
        .header h1 { color: #003366; margin: 0; }
        .header p { color: #666; margin-top: 5px; }
        .logo { font-size: 24px; font-weight: bold; color: #003366; }
        .logo span { color: #FFD700; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th { background-color: #003366; color: white; padding: 10px 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 10px; border-top: 1px solid #ddd; padding-top: 20px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #003366; }
        .stat-label { font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">SAPS <span>CrimeWatch</span></div>
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-ZA', { dateStyle: 'full' })}</p>
      </div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${data.length}</div>
          <div class="stat-label">Total Records</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(h => {
                let val = row[h];
                if (val === null || val === undefined) val = '-';
                if (typeof val === 'object') val = JSON.stringify(val);
                if (String(val).length > 50) val = String(val).substring(0, 50) + '...';
                return `<td>${val}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>South African Police Service - Crime Analytics Platform</p>
        <p>This document is confidential and for official use only.</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
  toast.success("PDF ready for printing/saving");
}

export default function ExportButtons({ data, filename = 'export', title = 'SAPS Report' }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (type) => {
    setExporting(true);
    try {
      if (type === 'csv') {
        exportToCSV(data, filename);
      } else {
        exportToPDF(data, filename, title);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 border-[#003366] text-[#003366]">
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          Export as Excel (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2 text-red-600" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}