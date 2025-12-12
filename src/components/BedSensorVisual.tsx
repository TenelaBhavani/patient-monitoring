import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, Heart, User, Wifi, ZapOff } from "lucide-react";
import type { Alert } from "@/types/monitoring";

interface SensorPoint {
  x: number;
  y: number;
  pressure: number;
  active: boolean;
}

interface BedSensorVisualProps {
  roomId: string;
  currentAlert?: Alert | null;
  isPaused?: boolean;
  sensorData?: {
    movement: number;
    heartRate: number;
    breathing: number;
    position: 'lying' | 'sitting' | 'leaving' | 'fallen';
  };
}

export function BedSensorVisual({
  roomId,
  currentAlert,
  isPaused = false,
  sensorData = { movement: 0, heartRate: 72, breathing: 16, position: 'lying' },
}: BedSensorVisualProps) {
  const [sensorPoints, setSensorPoints] = useState<SensorPoint[]>([]);
  const [waveOffset, setWaveOffset] = useState(0);

  // Generate sensor grid points
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const points: SensorPoint[] = [];
      const gridSize = 6;
      
      const isAlert = currentAlert && !currentAlert.acknowledged;
      const isFall = currentAlert?.type === 'fall';
      const isDistress = currentAlert?.type === 'distress';
      const isRisky = currentAlert?.type === 'risky_behavior';

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < 4; col++) {
          const baseX = 80 + col * 55;
          const baseY = 50 + row * 35;
          
          // Different patterns based on situation
          let pressure = 0;
          let active = false;

          if (isFall) {
            // Fall pattern - irregular pressure on floor area
            pressure = Math.random() * 0.3;
            active = row > 3 && Math.random() > 0.5;
          } else if (isDistress) {
            // Distress - high movement, erratic pressure
            pressure = 0.5 + Math.random() * 0.5;
            active = true;
          } else if (isRisky) {
            // Leaving bed - edge sensors active
            pressure = col === 0 || col === 3 ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3;
            active = col === 0 || col === 3;
          } else {
            // Normal lying - central sensors most active
            const centerWeight = 1 - Math.abs(col - 1.5) / 2;
            const headWeight = row < 2 ? 0.8 : row < 4 ? 0.6 : 0.4;
            pressure = centerWeight * headWeight * (0.6 + Math.random() * 0.2);
            active = pressure > 0.3;
          }

          points.push({
            x: baseX + (Math.random() - 0.5) * 5,
            y: baseY + (Math.random() - 0.5) * 3,
            pressure,
            active,
          });
        }
      }
      
      setSensorPoints(points);
      setWaveOffset(prev => (prev + 1) % 100);
    }, 150);

    return () => clearInterval(interval);
  }, [isPaused, currentAlert]);

  const isEmergency = currentAlert?.severity === 'critical';
  const isWarning = currentAlert?.severity === 'high' || currentAlert?.severity === 'medium';

  return (
    <div 
      className={cn(
        "relative w-full aspect-[16/10] rounded-2xl overflow-hidden transition-all duration-300",
        isEmergency && "ring-4 ring-status-critical glow-danger",
        isWarning && "ring-2 ring-status-warning glow-warning",
        !currentAlert && "ring-1 ring-primary/30 glow-primary"
      )}
      style={{
        background: isEmergency 
          ? 'linear-gradient(180deg, hsl(0 85% 15% / 0.9), hsl(220 25% 8%))' 
          : isWarning
          ? 'linear-gradient(180deg, hsl(45 95% 20% / 0.5), hsl(220 25% 8%))'
          : 'linear-gradient(180deg, hsl(220 25% 12%), hsl(220 25% 8%))',
      }}
    >
      {/* Emergency flash overlay */}
      {isEmergency && (
        <div className="absolute inset-0 bg-status-critical/20 emergency-flash pointer-events-none" />
      )}

      {/* Sensor Grid Pattern Background */}
      <div className="absolute inset-0 sensor-grid opacity-30" />

      {/* Bed visualization */}
      <svg
        viewBox="0 0 360 220"
        className="w-full h-full"
        style={{ maxHeight: "100%" }}
      >
        {/* Outer bed frame */}
        <rect
          x="60"
          y="30"
          width="240"
          height="180"
          rx="12"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
          strokeDasharray="0"
        />

        {/* Mattress area */}
        <rect
          x="70"
          y="40"
          width="220"
          height="160"
          rx="8"
          fill="hsl(var(--muted) / 0.5)"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          className={cn(
            isEmergency && "bed-sensor-alert",
            !isEmergency && "bed-sensor-active"
          )}
        />

        {/* Pillow area */}
        <rect
          x="85"
          y="50"
          width="190"
          height="40"
          rx="6"
          fill="hsl(var(--card) / 0.8)"
          stroke="hsl(var(--border) / 0.5)"
          strokeWidth="1"
        />

        {/* Sensor pressure points */}
        {sensorPoints.map((point, i) => (
          <g key={i}>
            {/* Pressure wave effect */}
            {point.active && (
              <circle
                cx={point.x}
                cy={point.y}
                r={12 + point.pressure * 8}
                fill={
                  isEmergency
                    ? `hsl(0 85% 55% / ${point.pressure * 0.4})`
                    : isWarning
                    ? `hsl(45 95% 55% / ${point.pressure * 0.4})`
                    : `hsl(185 85% 50% / ${point.pressure * 0.3})`
                }
                className="sensor-glow"
              />
            )}
            {/* Sensor point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={4 + point.pressure * 4}
              fill={
                isEmergency
                  ? `hsl(0 85% 55% / ${0.5 + point.pressure * 0.5})`
                  : isWarning
                  ? `hsl(45 95% 55% / ${0.4 + point.pressure * 0.4})`
                  : `hsl(185 85% 50% / ${0.3 + point.pressure * 0.4})`
              }
            />
          </g>
        ))}

        {/* Patient silhouette based on position */}
        {sensorData.position === 'lying' && !currentAlert && (
          <ellipse
            cx="180"
            cy="130"
            rx="80"
            ry="25"
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary) / 0.4)"
            strokeWidth="2"
            className="bed-breathing"
          />
        )}

        {/* Heartbeat wave line */}
        <path
          d={`M 320 110 
              ${Array.from({ length: 5 }, (_, i) => {
                const x = 320 + i * 15;
                const y = isEmergency 
                  ? 110 + Math.sin((waveOffset + i * 20) * 0.3) * 15
                  : 110 + Math.sin((waveOffset + i * 10) * 0.1) * 5;
                return `L ${x} ${y}`;
              }).join(' ')}`}
          stroke={isEmergency ? "hsl(var(--status-critical))" : "hsl(var(--success))"}
          strokeWidth="2"
          fill="none"
          className="heartbeat"
        />
      </svg>

      {/* Status indicators overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2",
            isEmergency ? "bg-status-critical text-destructive-foreground emergency-flash" 
              : isWarning ? "bg-status-warning/20 text-status-warning border border-status-warning/50"
              : "bg-primary/20 text-primary border border-primary/30"
          )}>
            <Wifi className="h-3 w-3" />
            {roomId}
          </div>
          {isEmergency && (
            <div className="px-3 py-1.5 rounded-full bg-status-critical text-destructive-foreground text-xs font-bold flex items-center gap-1.5 emergency-flash">
              <AlertTriangle className="h-3.5 w-3.5" />
              EMERGENCY
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            "h-2.5 w-2.5 rounded-full",
            isPaused ? "bg-status-offline" : "bg-status-normal status-pulse"
          )} />
          <span className="text-xs font-medium text-muted-foreground bg-card/80 px-2 py-1 rounded">
            {isPaused ? "PAUSED" : "LIVE"}
          </span>
        </div>
      </div>

      {/* Real-time vitals */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex gap-3">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono",
            "bg-card/80 backdrop-blur border border-border/50"
          )}>
            <Heart className={cn("h-3.5 w-3.5", isEmergency ? "text-status-critical heartbeat" : "text-success")} />
            <span className={isEmergency ? "text-status-critical" : "text-success"}>
              {sensorData.heartRate} BPM
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur border border-border/50 text-xs font-mono">
            <Activity className={cn("h-3.5 w-3.5", isWarning ? "text-status-warning" : "text-primary")} />
            <span className={isWarning ? "text-status-warning" : "text-primary"}>
              Movement: {Math.round(sensorData.movement * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur border border-border/50 text-xs font-mono">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground capitalize">{sensorData.position}</span>
        </div>
      </div>

      {/* Alert message banner */}
      {currentAlert && (
        <div className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "px-6 py-3 rounded-xl backdrop-blur-sm",
          "flex items-center gap-3 max-w-[80%]",
          isEmergency 
            ? "bg-status-critical/90 text-destructive-foreground shadow-lg" 
            : "bg-status-warning/90 text-warning-foreground"
        )}>
          <AlertTriangle className={cn("h-6 w-6 flex-shrink-0", isEmergency && "alert-pulse")} />
          <span className="font-semibold text-sm">{currentAlert.message}</span>
        </div>
      )}

      {/* Paused overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <ZapOff className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Sensor Feed Paused</p>
          </div>
        </div>
      )}
    </div>
  );
}