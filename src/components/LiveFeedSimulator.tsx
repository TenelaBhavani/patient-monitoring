import { useState, useEffect } from "react";
import { Camera, Shield, Pause, Play, AlertTriangle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Alert } from "@/types/monitoring";

interface LiveFeedSimulatorProps {
  roomId: string;
  currentAlert?: Alert | null;
  isPaused?: boolean;
  onTogglePause?: () => void;
}

export function LiveFeedSimulator({
  roomId,
  currentAlert,
  isPaused = false,
  onTogglePause,
}: LiveFeedSimulatorProps) {
  const [posePoints, setPosePoints] = useState<{ x: number; y: number }[]>([]);

  // Simulate pose keypoints
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Generate simulated pose keypoints
      const baseX = 150 + Math.random() * 50;
      const baseY = 100 + Math.random() * 30;
      
      // If there's a fall alert, simulate fallen pose
      const isFall = currentAlert?.type === "fall";
      
      const points = [
        { x: baseX, y: baseY - 50 + (isFall ? 80 : 0) }, // head
        { x: baseX, y: baseY + (isFall ? 40 : 0) }, // neck
        { x: baseX - 40, y: baseY + 30 + (isFall ? 20 : 0) }, // left shoulder
        { x: baseX + 40, y: baseY + 30 + (isFall ? 20 : 0) }, // right shoulder
        { x: baseX - 50, y: baseY + 80 + (isFall ? -30 : 0) }, // left elbow
        { x: baseX + 50, y: baseY + 80 + (isFall ? -30 : 0) }, // right elbow
        { x: baseX, y: baseY + 100 + (isFall ? -40 : 0) }, // hip
        { x: baseX - 30, y: baseY + 160 + (isFall ? -100 : 0) }, // left knee
        { x: baseX + 30, y: baseY + 160 + (isFall ? -100 : 0) }, // right knee
      ];
      
      setPosePoints(points);
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, currentAlert]);

  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden">
      {/* Simulated anonymized video feed */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 300 200"
          className="w-full h-full"
          style={{ maxHeight: "100%" }}
        >
          {/* Room outline */}
          <rect
            x="20"
            y="20"
            width="260"
            height="160"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="4"
          />
          
          {/* Bed region */}
          <rect
            x="180"
            y="100"
            width="80"
            height="60"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            rx="4"
          />
          <text
            x="220"
            y="135"
            textAnchor="middle"
            fontSize="10"
            fill="hsl(var(--muted-foreground))"
          >
            BED
          </text>

          {/* Pose skeleton */}
          {posePoints.length > 0 && (
            <>
              {/* Skeleton lines */}
              <g stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round">
                {/* Head to neck */}
                <line x1={posePoints[0].x} y1={posePoints[0].y} x2={posePoints[1].x} y2={posePoints[1].y} />
                {/* Neck to shoulders */}
                <line x1={posePoints[1].x} y1={posePoints[1].y} x2={posePoints[2].x} y2={posePoints[2].y} />
                <line x1={posePoints[1].x} y1={posePoints[1].y} x2={posePoints[3].x} y2={posePoints[3].y} />
                {/* Shoulders to elbows */}
                <line x1={posePoints[2].x} y1={posePoints[2].y} x2={posePoints[4].x} y2={posePoints[4].y} />
                <line x1={posePoints[3].x} y1={posePoints[3].y} x2={posePoints[5].x} y2={posePoints[5].y} />
                {/* Neck to hip */}
                <line x1={posePoints[1].x} y1={posePoints[1].y} x2={posePoints[6].x} y2={posePoints[6].y} />
                {/* Hip to knees */}
                <line x1={posePoints[6].x} y1={posePoints[6].y} x2={posePoints[7].x} y2={posePoints[7].y} />
                <line x1={posePoints[6].x} y1={posePoints[6].y} x2={posePoints[8].x} y2={posePoints[8].y} />
              </g>
              
              {/* Joint points */}
              {posePoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={i === 0 ? 12 : 4}
                  fill={i === 0 ? "hsl(var(--muted))" : "hsl(var(--primary))"}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
              ))}
              
              {/* Anonymized face (blur effect) */}
              <circle
                cx={posePoints[0].x}
                cy={posePoints[0].y}
                r="12"
                fill="hsl(var(--muted))"
                stroke="hsl(var(--success))"
                strokeWidth="2"
              />
              <User 
                x={posePoints[0].x - 6} 
                y={posePoints[0].y - 6}
                width="12"
                height="12"
                className="text-muted-foreground"
              />
            </>
          )}
        </svg>
      </div>

      {/* Alert overlay */}
      {currentAlert && currentAlert.severity === "critical" && (
        <div className="absolute inset-0 bg-status-critical/10 animate-pulse flex items-center justify-center">
          <div className="bg-status-critical/90 text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">{currentAlert.message}</span>
          </div>
        </div>
      )}

      {/* Top overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-card/80 backdrop-blur">
            <Camera className="h-3 w-3 mr-1" />
            {roomId}
          </Badge>
          <Badge variant="secondary" className="bg-card/80 backdrop-blur text-success">
            <Shield className="h-3 w-3 mr-1" />
            Privacy On
          </Badge>
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="bg-card/80 backdrop-blur h-7"
          onClick={onTogglePause}
        >
          {isPaused ? (
            <Play className="h-3 w-3" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Bottom overlay - metrics */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-card/80 backdrop-blur text-xs font-mono">
            FPS: 12
          </Badge>
          <Badge variant="outline" className="bg-card/80 backdrop-blur text-xs font-mono">
            Latency: 45ms
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-status-normal animate-pulse" />
          <span className="text-xs text-foreground bg-card/80 backdrop-blur px-2 py-0.5 rounded">
            LIVE
          </span>
        </div>
      </div>

      {/* Paused overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Pause className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Feed Paused</p>
          </div>
        </div>
      )}
    </div>
  );
}