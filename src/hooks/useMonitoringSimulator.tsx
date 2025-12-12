import { useState, useEffect, useCallback } from "react";
import type { Alert, Room, SystemStats, DetectionConfig } from "@/types/monitoring";
import { useAlertSound } from "./useAlertSound";

const defaultConfig: DetectionConfig = {
  fallDetection: {
    enabled: true,
    hipDropThreshold: 80,
    angleChangeThreshold: 45,
    sustainedFrames: 5,
    confidenceThreshold: 0.75,
  },
  riskyBehavior: {
    enabled: true,
    bedExitEnabled: true,
    wanderingEnabled: true,
    tubingRemovalEnabled: true,
    confidenceThreshold: 0.7,
  },
  distressDetection: {
    enabled: true,
    emotionThreshold: 0.6,
    sustainedSeconds: 5,
    confidenceThreshold: 0.65,
  },
  alerting: {
    cooldownSeconds: 30,
    escalationEnabled: true,
    soundEnabled: true,
    escalationDelaySeconds: 60,
  },
};

const initialRooms: Room[] = [
  {
    id: "BED-101",
    name: "Bed 101",
    status: "normal",
    patientId: "John D.",
    lastActivity: new Date(),
    activeAlerts: 0,
    metrics: { fps: 12, latency: 45, privacyMode: true },
  },
  {
    id: "BED-102", 
    name: "Bed 102",
    status: "normal",
    patientId: "Sarah M.",
    lastActivity: new Date(),
    activeAlerts: 0,
    metrics: { fps: 11, latency: 52, privacyMode: true },
  },
  {
    id: "BED-103",
    name: "Bed 103", 
    status: "normal",
    patientId: "Robert K.",
    lastActivity: new Date(),
    activeAlerts: 0,
    metrics: { fps: 12, latency: 48, privacyMode: true },
  },
  {
    id: "BED-104",
    name: "Bed 104",
    status: "offline",
    lastActivity: new Date(Date.now() - 3600000),
    activeAlerts: 0,
    metrics: { fps: 0, latency: 0, privacyMode: true },
  },
];

const alertMessages = {
  fall: [
    "⚠️ Patient fall detected from bed sensor!",
    "🚨 Sudden pressure change - Patient may have fallen!",
    "❗ Bed sensor detected patient on floor",
  ],
  risky_behavior: [
    "Patient attempting to leave bed unassisted",
    "Unusual movement pattern - Patient may be agitated", 
    "Edge sensors triggered - Patient at risk of falling",
  ],
  distress: [
    "Elevated stress patterns detected from bed sensor",
    "Abnormal movement indicating patient distress",
    "Patient showing signs of agitation or discomfort",
  ],
};

export function useMonitoringSimulator() {
  const [config, setConfig] = useState<DetectionConfig>(defaultConfig);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("BED-101");
  const [isPaused, setIsPaused] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [sensorData, setSensorData] = useState({
    movement: 0,
    heartRate: 72,
    breathing: 16,
    position: 'lying' as 'lying' | 'sitting' | 'leaving' | 'fallen',
  });

  const { playEmergencySound, playWarningSound, playMovementSound, stopSound } = useAlertSound();

  const stats: SystemStats = {
    totalRooms: rooms.filter(r => r.status !== 'offline').length,
    activeAlerts: alerts.filter((a) => !a.acknowledged).length,
    avgFps: Math.round(
      rooms.filter((r) => r.status !== "offline").reduce((sum, r) => sum + r.metrics.fps, 0) /
        Math.max(1, rooms.filter((r) => r.status !== "offline").length)
    ),
    avgLatency: Math.round(
      rooms.filter((r) => r.status !== "offline").reduce((sum, r) => sum + r.metrics.latency, 0) /
        Math.max(1, rooms.filter((r) => r.status !== "offline").length)
    ),
    uptime: "99.7%",
    privacyCompliant: true,
  };

  const generateAlert = useCallback(() => {
    const activeRooms = rooms.filter((r) => r.status !== "offline");
    if (activeRooms.length === 0 || isPaused) return;

    const randomRoom = activeRooms[Math.floor(Math.random() * activeRooms.length)];
    const now = Date.now();

    if (
      lastAlertTime[randomRoom.id] &&
      now - lastAlertTime[randomRoom.id] < config.alerting.cooldownSeconds * 1000
    ) {
      return;
    }

    const types: Array<"fall" | "risky_behavior" | "distress"> = [];
    if (config.fallDetection.enabled) types.push("fall");
    if (config.riskyBehavior.enabled) types.push("risky_behavior");
    if (config.distressDetection.enabled) types.push("distress");

    if (types.length === 0) return;

    const type = types[Math.floor(Math.random() * types.length)];
    const messages = alertMessages[type];
    const message = messages[Math.floor(Math.random() * messages.length)];

    let threshold = 0.7;
    if (type === "fall") threshold = config.fallDetection.confidenceThreshold;
    else if (type === "risky_behavior") threshold = config.riskyBehavior.confidenceThreshold;
    else if (type === "distress") threshold = config.distressDetection.confidenceThreshold;

    const confidence = threshold + Math.random() * (1 - threshold);

    const severities: Array<"low" | "medium" | "high" | "critical"> = 
      type === "fall" ? ["high", "critical"] :
      type === "risky_behavior" ? ["medium", "high"] :
      ["low", "medium", "high"];
    
    const severity = severities[Math.floor(Math.random() * severities.length)];

    const newAlert: Alert = {
      id: `ALT-${Date.now()}`,
      timestamp: new Date(),
      room_id: randomRoom.id,
      type,
      severity,
      message,
      confidence,
      acknowledged: false,
    };

    setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
    setLastAlertTime((prev) => ({ ...prev, [randomRoom.id]: now }));

    setRooms((prev) =>
      prev.map((room) =>
        room.id === randomRoom.id
          ? {
              ...room,
              status: severity === "critical" ? "critical" : severity === "high" ? "warning" : room.status,
              activeAlerts: room.activeAlerts + 1,
              lastActivity: new Date(),
            }
          : room
      )
    );

    // Play alert sound
    if (config.alerting.soundEnabled && !isMuted) {
      if (severity === "critical") {
        playEmergencySound();
      } else if (severity === "high") {
        playWarningSound();
      } else {
        playMovementSound();
      }
    }
  }, [rooms, isPaused, config, lastAlertTime, isMuted, playEmergencySound, playWarningSound, playMovementSound]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    stopSound();
    
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );

    setAlerts((prev) => {
      const alert = prev.find((a) => a.id === alertId);
      if (alert) {
        setRooms((rooms) =>
          rooms.map((room) => {
            if (room.id === alert.room_id) {
              const remainingAlerts = prev.filter(
                (a) => a.room_id === room.id && !a.acknowledged && a.id !== alertId
              );
              const hasCritical = remainingAlerts.some((a) => a.severity === "critical");
              const hasHigh = remainingAlerts.some((a) => a.severity === "high");
              
              return {
                ...room,
                activeAlerts: Math.max(0, room.activeAlerts - 1),
                status: hasCritical ? "critical" : hasHigh ? "warning" : "normal",
              };
            }
            return room;
          })
        );
      }
      return prev;
    });

    // Reset sensor data
    setSensorData({
      movement: Math.random() * 0.2,
      heartRate: 70 + Math.floor(Math.random() * 10),
      breathing: 14 + Math.floor(Math.random() * 4),
      position: 'lying',
    });
  }, [stopSound]);

  const triggerEvent = useCallback((type: "fall" | "risky_behavior" | "distress") => {
    const room = rooms.find((r) => r.id === selectedRoom);
    if (!room || room.status === "offline") return;

    const messages = alertMessages[type];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const severity = type === "fall" ? "critical" : type === "risky_behavior" ? "high" : "medium";
    const confidence = 0.85 + Math.random() * 0.12;

    const newAlert: Alert = {
      id: `ALT-${Date.now()}`,
      timestamp: new Date(),
      room_id: room.id,
      type,
      severity,
      message,
      confidence,
      acknowledged: false,
    };

    setAlerts((prev) => [newAlert, ...prev].slice(0, 50));

    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id
          ? {
              ...r,
              status: severity === "critical" ? "critical" : "warning",
              activeAlerts: r.activeAlerts + 1,
              lastActivity: new Date(),
            }
          : r
      )
    );

    // Update sensor data based on event type
    setSensorData(prev => ({
      ...prev,
      movement: type === 'fall' ? 0.9 : type === 'risky_behavior' ? 0.7 : 0.5,
      heartRate: type === 'fall' ? 120 : type === 'distress' ? 100 : 90,
      position: type === 'fall' ? 'fallen' : type === 'risky_behavior' ? 'leaving' : 'lying',
    }));

    // Play sound
    if (config.alerting.soundEnabled && !isMuted) {
      if (severity === "critical") {
        playEmergencySound();
      } else if (severity === "high") {
        playWarningSound();
      }
    }
  }, [rooms, selectedRoom, config.alerting.soundEnabled, isMuted, playEmergencySound, playWarningSound]);

  const toggleMute = useCallback(() => {
    if (!isMuted) {
      stopSound();
    }
    setIsMuted(!isMuted);
  }, [isMuted, stopSound]);

  // Random alert generation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.08) {
        generateAlert();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [generateAlert, isPaused]);

  // Update sensor data periodically
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const currentRoom = rooms.find(r => r.id === selectedRoom);
      if (!currentRoom || currentRoom.status === 'offline') return;

      setSensorData(prev => {
        const hasAlert = currentRoom.activeAlerts > 0;
        return {
          movement: hasAlert 
            ? Math.min(1, prev.movement + (Math.random() - 0.3) * 0.2)
            : Math.max(0, Math.min(0.3, prev.movement + (Math.random() - 0.5) * 0.1)),
          heartRate: hasAlert
            ? Math.min(140, Math.max(60, prev.heartRate + Math.floor((Math.random() - 0.3) * 8)))
            : Math.min(85, Math.max(65, prev.heartRate + Math.floor((Math.random() - 0.5) * 3))),
          breathing: Math.min(25, Math.max(12, prev.breathing + Math.floor((Math.random() - 0.5) * 2))),
          position: hasAlert ? prev.position : 'lying',
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, rooms, selectedRoom]);

  // Update room metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms((prev) =>
        prev.map((room) =>
          room.status !== "offline"
            ? {
                ...room,
                metrics: {
                  ...room.metrics,
                  fps: 10 + Math.floor(Math.random() * 5),
                  latency: 40 + Math.floor(Math.random() * 20),
                },
              }
            : room
        )
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentAlert = alerts.find(
    (a) => a.room_id === selectedRoom && !a.acknowledged
  );

  return {
    config,
    setConfig,
    rooms,
    alerts,
    stats,
    selectedRoom,
    setSelectedRoom,
    isPaused,
    setIsPaused,
    acknowledgeAlert,
    triggerEvent,
    currentAlert,
    isMuted,
    toggleMute,
    sensorData,
  };
}