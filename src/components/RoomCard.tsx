import { Monitor, AlertTriangle, Shield, Activity, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusIndicator } from "./StatusIndicator";
import type { Room } from "@/types/monitoring";

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
}

export function RoomCard({ room, onClick }: RoomCardProps) {
  const statusLabel = {
    normal: "Normal",
    warning: "Warning", 
    critical: "Critical",
    offline: "Offline",
  };

  const statusConfig = {
    normal: {
      bgGradient: "from-emerald-900/40 to-emerald-800/20",
      borderColor: "border-emerald-500/30 hover:border-emerald-400/50",
      textColor: "text-emerald-400",
      glowClass: "hover:shadow-emerald-500/20",
      iconBg: "bg-emerald-500/20",
    },
    warning: {
      bgGradient: "from-amber-900/40 to-amber-800/20", 
      borderColor: "border-amber-500/30 hover:border-amber-400/50",
      textColor: "text-amber-400",
      glowClass: "hover:shadow-amber-500/20",
      iconBg: "bg-amber-500/20",
    },
    critical: {
      bgGradient: "from-red-900/50 to-red-800/30",
      borderColor: "border-red-500/40 hover:border-red-400/60", 
      textColor: "text-red-400",
      glowClass: "shadow-red-500/30 hover:shadow-red-500/40",
      iconBg: "bg-red-500/20",
    },
    offline: {
      bgGradient: "from-slate-900/60 to-slate-800/40",
      borderColor: "border-slate-600/30 hover:border-slate-500/40",
      textColor: "text-slate-400", 
      glowClass: "hover:shadow-slate-500/10",
      iconBg: "bg-slate-600/20",
    },
  };

  const config = statusConfig[room.status];

  return (
    <Card
      className={`w-full h-32 relative overflow-hidden transition-all duration-300 cursor-pointer group
        bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm 
        border ${config.borderColor} ${config.glowClass}
        hover:scale-105 hover:shadow-xl transform-gpu
        ${room.status === 'critical' ? 'animate-pulse shadow-lg' : ''}
      `}
      onClick={onClick}
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Status indicator */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${config.textColor.replace('text-', 'bg-')} ${room.status === 'critical' ? 'animate-pulse' : ''}`}></div>

      {/* Privacy Mode Indicator */}
      {room.metrics.privacyMode && (
        <div className="absolute top-2 right-6 p-1 bg-cyan-500/20 rounded backdrop-blur-sm">
          <Shield className="h-3 w-3 text-cyan-400" />
        </div>
      )}

      <CardContent className="p-3 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 ${config.iconBg} rounded-lg`}>
              <Monitor className={`h-4 w-4 ${config.textColor}`} />
            </div>
            <div>
              <CardTitle className="text-white font-semibold text-sm">
                {room.name}
              </CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <StatusIndicator status={room.status} size="sm" />
                <Badge 
                  variant="outline"
                  className={`text-xs px-1 py-0 border-current ${config.textColor} bg-current/10`}
                >
                  {statusLabel[room.status]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {room.activeAlerts > 0 && (
            <div className="flex items-center gap-1 p-1 mb-2 rounded bg-red-500/20 border border-red-500/30">
              <AlertTriangle className="h-3 w-3 text-red-400" />
              <span className="text-xs font-semibold text-red-300">
                {room.activeAlerts} Alert{room.activeAlerts > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 p-1 rounded bg-slate-700/30">
              <Activity className="h-3 w-3 text-cyan-400" />
              <span className="text-slate-300">{room.metrics.fps} FPS</span>
            </div>
            <div className="flex items-center gap-1 p-1 rounded bg-slate-700/30">
              <Wifi className="h-3 w-3 text-purple-400" />
              <span className="text-slate-300">{room.metrics.latency}ms</span>
            </div>
          </div>

          {/* Patient Info */}
          {room.patientId && (
            <div className="flex items-center gap-1 pt-1 border-t border-slate-700/50">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <span className="text-xs text-slate-400">
                <span className="font-medium text-slate-200">{room.patientId}</span>
              </span>
            </div>
          )}

          {/* Connection status */}
          <div className="flex justify-end">
            {room.status !== 'offline' ? (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <span className="text-xs text-slate-500 font-medium">OFFLINE</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
