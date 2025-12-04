import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const provinceCoordinates = {
  "Gauteng": { x: 55, y: 45 },
  "Western Cape": { x: 25, y: 85 },
  "KwaZulu-Natal": { x: 75, y: 60 },
  "Eastern Cape": { x: 50, y: 75 },
  "Free State": { x: 45, y: 55 },
  "Limpopo": { x: 60, y: 20 },
  "Mpumalanga": { x: 70, y: 35 },
  "North West": { x: 40, y: 35 },
  "Northern Cape": { x: 25, y: 50 }
};

export default function CrimeHeatMap({ cases = [], statistics = [] }) {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    // Calculate crime density per province
    const provinceCounts = {};
    
    cases.forEach(c => {
      if (c.province) {
        provinceCounts[c.province] = (provinceCounts[c.province] || 0) + 1;
      }
    });

    const maxCount = Math.max(...Object.values(provinceCounts), 1);
    
    const spots = Object.entries(provinceCounts).map(([province, count]) => ({
      province,
      count,
      intensity: count / maxCount,
      ...provinceCoordinates[province]
    }));

    setHotspots(spots);
  }, [cases]);

  const getHeatColor = (intensity) => {
    if (intensity > 0.8) return "bg-red-500";
    if (intensity > 0.6) return "bg-orange-500";
    if (intensity > 0.4) return "bg-yellow-500";
    if (intensity > 0.2) return "bg-green-400";
    return "bg-green-300";
  };

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Crime Heat Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden">
          {/* South Africa outline simplified */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20">
            <path 
              d="M20 30 Q30 20 50 15 Q70 10 80 25 Q90 40 85 60 Q80 80 60 90 Q40 95 25 85 Q10 70 15 50 Q15 35 20 30" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
              className="text-slate-400"
            />
          </svg>

          {/* Heat spots */}
          {hotspots.map((spot, idx) => (
            <div
              key={idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              {/* Pulsing effect */}
              <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-30",
                getHeatColor(spot.intensity)
              )} style={{ width: `${30 + spot.intensity * 40}px`, height: `${30 + spot.intensity * 40}px`, marginLeft: `-${(30 + spot.intensity * 40) / 2}px`, marginTop: `-${(30 + spot.intensity * 40) / 2}px` }} />
              
              {/* Main dot */}
              <div className={cn(
                "relative rounded-full flex items-center justify-center transition-transform hover:scale-110",
                getHeatColor(spot.intensity)
              )} style={{ width: `${20 + spot.intensity * 30}px`, height: `${20 + spot.intensity * 30}px` }}>
                <span className="text-white text-xs font-bold">{spot.count}</span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <p className="font-semibold">{spot.province}</p>
                <p>{spot.count} active cases</p>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <p className="text-xs font-medium text-slate-600 mb-2">Intensity</p>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-300" />
              <div className="w-4 h-4 rounded bg-green-400" />
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <div className="w-4 h-4 rounded bg-orange-500" />
              <div className="w-4 h-4 rounded bg-red-500" />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}