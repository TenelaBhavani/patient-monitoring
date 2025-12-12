export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'fall' | 'risky_behavior' | 'distress' | 'system';
export type RoomStatus = 'normal' | 'warning' | 'critical' | 'offline';

export interface Alert {
  id: string;
  timestamp: Date;
  room_id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  confidence: number;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

export interface Room {
  id: string;
  name: string;
  status: RoomStatus;
  patientId?: string;
  lastActivity: Date;
  activeAlerts: number;
  metrics: {
    fps: number;
    latency: number;
    privacyMode: boolean;
  };
}

export interface DetectionConfig {
  fallDetection: {
    enabled: boolean;
    hipDropThreshold: number;
    angleChangeThreshold: number;
    sustainedFrames: number;
    confidenceThreshold: number;
  };
  riskyBehavior: {
    enabled: boolean;
    bedExitEnabled: boolean;
    wanderingEnabled: boolean;
    tubingRemovalEnabled: boolean;
    confidenceThreshold: number;
  };
  distressDetection: {
    enabled: boolean;
    emotionThreshold: number;
    sustainedSeconds: number;
    confidenceThreshold: number;
  };
  alerting: {
    cooldownSeconds: number;
    escalationEnabled: boolean;
    soundEnabled: boolean;
    escalationDelaySeconds: number;
  };
}

export interface SystemStats {
  totalRooms: number;
  activeAlerts: number;
  avgFps: number;
  avgLatency: number;
  uptime: string;
  privacyCompliant: boolean;
}
