import { Shield, Clock, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SystemStats } from "@/types/monitoring";

interface HeaderProps {
  stats: SystemStats;
}

export function Header({ stats }: HeaderProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">
              Patient Monitor
            </h1>
          </div>
          
          <Badge variant="outline" className="text-green-400 border-green-500/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
            System Online
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Wifi className="h-4 w-4 text-green-400" />
            <span className="text-slate-300">
              Uptime: {stats.uptime}
            </span>
          </div>
          
          <Badge variant="outline" className="text-cyan-400 border-cyan-500/50">
            Privacy Mode
          </Badge>
        </div>
      </div>
    </header>
  );
}