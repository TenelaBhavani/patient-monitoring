import { useState, useEffect } from "react";
import { Bed, Activity, Heart, AlertTriangle, Wifi, WifiOff, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusIndicator } from "./StatusIndicator";
import type { Room } from "@/types/monitoring";

interface PatientBedCardProps {
  room: Room;
  onClick?: () => void;
  isSelected?: boolean;
}

export function PatientBedCard({ room, onClick, isSelected }: PatientBedCardProps) {
  const [heartRate, setHeartRate] = useState(72);
  const [movement, setMovement] = useState(0);

  useEffect(() => {
    if (room.status === 'offline') return;

    const interval = setInterval(() => {
      setHeartRate(prev => {
        const base = room.status === 'critical' ? 110 : room.status === 'warning' ? 90 : 72;
        return base + Math.floor(Math.random() * 10 - 5);
      });
      setMovement(
        room.status === 'critical' ? 0.8 + Math.random() * 0.2 :
        room.status === 'warning' ? 0.4 + Math.random() * 0.3 :
        Math.random() * 0.2
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [room.status]);

  const statusConfig = {
    normal: {
      bg: 'bg-gradient-to-br from-card to-card/80',
      border: 'border-border/50 hover:border-primary/50',
      glow: '',
      icon: 'text-success',
    },
    warning: {
      bg: 'bg-gradient-to-br from-status-warning/10 to-card',
      border: 'border-status-warning/50 hover:border-status-warning',
      glow: 'glow-warning',
      icon: 'text-status-warning',
    },
    critical: {
      bg: 'bg-gradient-to-br from-status-critical/15 to-card',
      border: 'border-status-critical/60',
      glow: 'glow-danger',
      icon: 'text-status-critical',
    },
    offline: {
      bg: 'bg-muted/50',
      border: 'border-border/30',
      glow: '',
      icon: 'text-muted-foreground',
    },
  };

  const config = statusConfig[room.status];

  return (
    <Card
      className={cn(
        "h-32 w-32 relative overflow-hidden transition-all duration-300 cursor-pointer group card-shine",
        config.bg,
        config.glow,
        "border-2",
        config.border,
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        room.status === 'critical' && "alert-pulse"
      )}
      onClick={onClick}
    >
      {/* Status glow effect */}
      {room.status === 'critical' && (
        <div className="absolute inset-0 bg-status-critical/5 pointer-events-none" />
      )}

      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              room.status === 'critical' ? "bg-status-critical/20" :
              room.status === 'warning' ? "bg-status-warning/20" :
              "bg-primary/20"
            )}>
              <Bed className={cn("h-4 w-4", config.icon)} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{room.name}</h3>
              {room.patientId && (
                <p className="text-xs text-muted-foreground">{room.patientId}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status={room.status} size="sm" />
            {room.status !== 'offline' ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Alert banner */}
        {room.activeAlerts > 0 && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 mb-3 rounded-md",
            room.status === 'critical' 
              ? "bg-status-critical/20 border border-status-critical/40" 
              : "bg-status-warning/20 border border-status-warning/40"
          )}>
            <AlertTriangle className={cn(
              "h-4 w-4",
              room.status === 'critical' ? "text-status-critical alert-pulse" : "text-status-warning"
            )} />
            <span className={cn(
              "text-sm font-semibold",
              room.status === 'critical' ? "text-status-critical" : "text-status-warning"
            )}>
              {room.activeAlerts} Alert{room.activeAlerts > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Mini bed visualization - centered and expanded */}
        <div className="flex-1 flex items-center justify-center mb-3">
          <div className={cn(
            "relative w-full aspect-[2/1] rounded-md overflow-hidden",
            "bg-gradient-to-r from-muted/50 to-muted/30",
            "border border-border/50"
          )}>
            {room.status !== 'offline' && (
              <>
                {/* Sensor activity visualization */}
                <div className="absolute inset-0 flex items-center justify-center gap-1 p-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 rounded-full transition-all duration-300",
                        room.status === 'critical' ? "bg-status-critical" :
                        room.status === 'warning' ? "bg-status-warning" :
                        "bg-primary"
                      )}
                      style={{
                        height: `${25 + Math.random() * (room.status === 'critical' ? 40 : room.status === 'warning' ? 30 : 20)}%`,
                        opacity: 0.4 + movement * 0.6,
                      }}
                    />
                  ))}
                </div>
                
                {/* Patient indicator */}
                <div className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  "w-14 h-7 rounded-full opacity-40",
                  room.status === 'critical' ? "bg-status-critical" :
                  room.status === 'warning' ? "bg-status-warning" :
                  "bg-primary",
                  "bed-breathing"
                )} />
              </>
            )}
            
            {room.status === 'offline' && (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground">
                Offline
              </div>
            )}
          </div>
        </div>

        {/* Vitals */}
        {room.status !== 'offline' && (
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md",
              "bg-muted/50 border border-border/30"
            )}>
              <Heart className={cn(
                "h-4 w-4",
                room.status === 'critical' ? "text-status-critical heartbeat" : "text-success"
              )} />
              <span className="text-sm font-mono font-semibold">{heartRate}</span>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md",
              "bg-muted/50 border border-border/30"
            )}>
              <Activity className={cn(
                "h-4 w-4",
                movement > 0.5 ? "text-status-warning" : "text-primary"
              )} />
              <span className="text-sm font-mono font-semibold">{Math.round(movement * 100)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}