import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from "lucide-react";

const PROVINCE_COLORS = {
  "Gauteng": "#ef4444",
  "Western Cape": "#3b82f6",
  "KwaZulu-Natal": "#22c55e",
  "Eastern Cape": "#f59e0b",
  "Free State": "#8b5cf6",
  "Limpopo": "#ec4899",
  "Mpumalanga": "#14b8a6",
  "North West": "#6366f1",
  "Northern Cape": "#f97316"
};

export default function ProvinceComparison({ cases = [] }) {
  // Calculate cases per province
  const provinceCounts = {};
  cases.forEach(c => {
    if (c.province) {
      provinceCounts[c.province] = (provinceCounts[c.province] || 0) + 1;
    }
  });

  const data = Object.entries(provinceCounts)
    .map(([name, count]) => ({ name: name.replace(/-/g, ' '), count, fullName: name }))
    .sort((a, b) => b.count - a.count);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
          <p className="font-semibold text-slate-900">{payload[0].payload.fullName}</p>
          <p className="text-sm text-slate-600">{payload[0].value} active cases</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Cases by Province
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                layout="vertical" 
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                <Bar 
                  dataKey="count" 
                  radius={[0, 4, 4, 0]}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PROVINCE_COLORS[entry.fullName] || '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-400">
            No case data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}