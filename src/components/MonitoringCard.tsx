import { Activity, Heart, Thermometer, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Room } from "@/types/monitoring";

interface MonitoringCardProps {
  room: Room;
  sensorData?: {
    movement: number;
    heartRate: number;
    breathing: number;
    position: 'lying' | 'sitting' | 'leaving' | 'fallen';
  };
  onTriggerEvent: (type: "fall" | "risky_behavior" | "distress") => void;
}

export function MonitoringCard({
  room,
  sensorData = { movement: 0, heartRate: 72, breathing: 16, position: 'lying' },
  onTriggerEvent,
}: MonitoringCardProps) {
  const currentAlert = room.activeAlerts > 0 ? {
    id: 'current',
    timestamp: new Date(),
    room_id: room.id,
    type: 'fall' as const,
    severity: room.status === 'critical' ? 'critical' as const : 'medium' as const,
    message: 'Alert detected',
    confidence: 0.8,
    acknowledged: false
  } : null;

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'lying': return 'text-green-400';
      case 'sitting': return 'text-yellow-400';
      case 'leaving': return 'text-orange-400';
      case 'fallen': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getHeartRateStatus = (rate: number) => {
    if (rate < 60) return { color: 'text-blue-400', status: 'Low' };
    if (rate > 100) return { color: 'text-red-400', status: 'High' };
    return { color: 'text-green-400', status: 'Normal' };
  };

  const heartRateStatus = getHeartRateStatus(sensorData.heartRate);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Live Monitoring - {room.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vital Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Heart Rate */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className={`h-6 w-6 ${heartRateStatus.color}`} />
                  <div>
                    <div className="text-sm text-slate-300">Heart Rate</div>
                    <div className={`text-xs ${heartRateStatus.color}`}>{heartRateStatus.status}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {sensorData.heartRate} <span className="text-sm text-slate-400">BPM</span>
                </div>
                <Progress 
                  value={(sensorData.heartRate / 140) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Breathing Rate */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="h-6 w-6 text-blue-400" />
                  <div>
                    <div className="text-sm text-slate-300">Breathing</div>
                    <div className="text-xs text-blue-400">Regular</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {sensorData.breathing} <span className="text-sm text-slate-400">RPM</span>
                </div>
                <Progress 
                  value={(sensorData.breathing / 30) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Movement */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Thermometer className="h-6 w-6 text-orange-400" />
                  <div>
                    <div className="text-sm text-slate-300">Movement</div>
                    <div className={`text-xs capitalize ${getPositionColor(sensorData.position)}`}>
                      {sensorData.position}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {Math.round(sensorData.movement * 100)}%
                </div>
                <Progress 
                  value={sensorData.movement * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Alert Trigger Buttons */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Emergency Simulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => onTriggerEvent('fall')}
                  variant="outline"
                  className="bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/40"
                >
                  Simulate Fall
                </Button>
                <Button
                  onClick={() => onTriggerEvent('risky_behavior')}
                  variant="outline"
                  className="bg-orange-900/20 border-orange-500/50 text-orange-400 hover:bg-orange-900/40"
                >
                  Risky Behavior
                </Button>
                <Button
                  onClick={() => onTriggerEvent('distress')}
                  variant="outline"
                  className="bg-purple-900/20 border-purple-500/50 text-purple-400 hover:bg-purple-900/40"
                >
                  Patient Distress
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Room Status */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300">Room Status</div>
                  <div className="text-lg font-semibold text-white capitalize">
                    {room.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-300">Last Activity</div>
                  <div className="text-sm text-slate-400">
                    {room.lastActivity.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}