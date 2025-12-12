import { AlertTriangle, Volume2, VolumeX, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Alert as AlertType } from "@/types/monitoring";

interface EmergencyAlertProps {
  alert: AlertType;
  onAcknowledge: (alertId: string) => void;
  onMute: () => void;
  isMuted: boolean;
}

export function EmergencyAlert({ alert, onAcknowledge, onMute, isMuted }: EmergencyAlertProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/50 border-red-500 text-red-300';
      case 'high': return 'bg-orange-900/50 border-orange-500 text-orange-300';
      case 'medium': return 'bg-yellow-900/50 border-yellow-500 text-yellow-300';
      default: return 'bg-blue-900/50 border-blue-500 text-blue-300';
    }
  };

  return (
    <Alert className={`relative animate-pulse ${getSeverityColor(alert.severity)}`}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {alert.room_id}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {alert.severity}
          </Badge>
          <span className="text-xs text-gray-300">
            {alert.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="font-semibold">{alert.message}</div>
        <div className="text-sm mt-1">
          Confidence: {Math.round(alert.confidence * 100)}%
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onMute}
          className="h-8 w-8 p-0"
        >
          {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        </Button>
        <Button
          size="sm"
          onClick={() => onAcknowledge(alert.id)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <X className="h-3 w-3 mr-1" />
          Acknowledge
        </Button>
      </div>
    </Alert>
  );
}