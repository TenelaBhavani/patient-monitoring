import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Alert } from "@/types/monitoring";

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (alertId: string) => void;
}

export function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-900/20 text-red-300';
      case 'high': return 'border-orange-500/50 bg-orange-900/20 text-orange-300';
      case 'medium': return 'border-yellow-500/50 bg-yellow-900/20 text-yellow-300';
      default: return 'border-blue-500/50 bg-blue-900/20 text-blue-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`${getSeverityColor(alert.severity)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {alert.acknowledged ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              getSeverityIcon(alert.severity)
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {alert.room_id}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {alert.severity}
              </Badge>
              <span className="text-xs text-gray-400">
                {alert.timestamp.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="text-sm font-medium mb-1">
              {alert.message}
            </div>
            
            <div className="text-xs text-gray-400">
              Type: {alert.type.replace('_', ' ')} • Confidence: {Math.round(alert.confidence * 100)}%
            </div>
          </div>
          
          {!alert.acknowledged && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAcknowledge(alert.id)}
              className="text-xs h-7"
            >
              Acknowledge
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}