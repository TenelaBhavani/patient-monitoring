import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, CameraOff, AlertTriangle, Activity, Heart, Eye, User, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/monitoring";

interface MediaPipeMonitorProps {
  room: Room;
  sensorData?: {
    movement: number;
    heartRate: number;
    breathing: number;
    position: 'lying' | 'sitting' | 'leaving' | 'fallen';
  };
  onTriggerEvent: (type: "fall" | "risky_behavior" | "distress") => void;
  isPaused?: boolean;
}

interface PoseKeypoint {
  x: number;
  y: number;
  visibility: number;
  z?: number;
}

interface DetectionResult {
  pose: PoseKeypoint[];
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful';
  emotionConfidence: number;
  isPersonDetected: boolean;
  fallRisk: number;
  movementIntensity: number;
}

export function MediaPipeMonitor({ 
  room, 
  sensorData = { movement: 0, heartRate: 72, breathing: 16, position: 'lying' },
  onTriggerEvent,
  isPaused = false
}: MediaPipeMonitorProps) {
  const [isActive, setIsActive] = useState(false);
  const [detection, setDetection] = useState<DetectionResult>({
    pose: [],
    emotion: 'neutral',
    emotionConfidence: 0,
    isPersonDetected: false,
    fallRisk: 0,
    movementIntensity: 0
  });
  const [alertHistory, setAlertHistory] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate MediaPipe pose detection
  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      // Simulate realistic pose keypoints
      const centerX = 320;
      const centerY = 240;
      const variation = Math.random() * 20 - 10;
      
      // Simulate different poses based on room status
      const isEmergency = room.status === 'critical';
      const isWarning = room.status === 'warning';
      
      let poseType = 'normal';
      if (isEmergency) {
        poseType = Math.random() > 0.7 ? 'fallen' : 'distressed';
      } else if (isWarning) {
        poseType = 'moving';
      }

      const pose: PoseKeypoint[] = generatePoseKeypoints(centerX, centerY, variation, poseType);
      const emotion = isEmergency ? 'fearful' : isWarning ? 'surprised' : 'neutral';
      const emotionConfidence = 0.7 + Math.random() * 0.3;
      
      // Calculate fall risk based on pose
      let fallRisk = 0;
      if (poseType === 'fallen') {
        fallRisk = 0.9 + Math.random() * 0.1;
        onTriggerEvent('fall');
        setAlertHistory(prev => [`${new Date().toLocaleTimeString()}: Fall detected via pose analysis`, ...prev.slice(0, 4)]);
      } else if (poseType === 'distressed') {
        fallRisk = 0.6 + Math.random() * 0.3;
        if (Math.random() > 0.8) {
          onTriggerEvent('distress');
          setAlertHistory(prev => [`${new Date().toLocaleTimeString()}: Distress detected via facial expression`, ...prev.slice(0, 4)]);
        }
      } else if (poseType === 'moving') {
        fallRisk = 0.3 + Math.random() * 0.4;
        if (Math.random() > 0.9) {
          onTriggerEvent('risky_behavior');
          setAlertHistory(prev => [`${new Date().toLocaleTimeString()}: Risky movement detected`, ...prev.slice(0, 4)]);
        }
      }

      setDetection({
        pose,
        emotion: emotion as any,
        emotionConfidence,
        isPersonDetected: true,
        fallRisk,
        movementIntensity: sensorData.movement
      });

      // Draw pose on canvas
      drawPoseOnCanvas(pose, fallRisk);
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, isPaused, room.status, sensorData.movement, onTriggerEvent]);

  const generatePoseKeypoints = (centerX: number, centerY: number, variation: number, poseType: string): PoseKeypoint[] => {
    const baseKeypoints = [
      { name: 'nose', x: centerX + variation, y: centerY - 60 + variation },
      { name: 'leftEye', x: centerX - 15 + variation, y: centerY - 70 + variation },
      { name: 'rightEye', x: centerX + 15 + variation, y: centerY - 70 + variation },
      { name: 'leftShoulder', x: centerX - 50 + variation, y: centerY - 20 },
      { name: 'rightShoulder', x: centerX + 50 + variation, y: centerY - 20 },
      { name: 'leftElbow', x: centerX - 80 + variation, y: centerY + 20 },
      { name: 'rightElbow', x: centerX + 80 + variation, y: centerY + 20 },
      { name: 'leftWrist', x: centerX - 100 + variation, y: centerY + 60 },
      { name: 'rightWrist', x: centerX + 100 + variation, y: centerY + 60 },
      { name: 'leftHip', x: centerX - 30 + variation, y: centerY + 80 },
      { name: 'rightHip', x: centerX + 30 + variation, y: centerY + 80 },
      { name: 'leftKnee', x: centerX - 35 + variation, y: centerY + 140 },
      { name: 'rightKnee', x: centerX + 35 + variation, y: centerY + 140 },
      { name: 'leftAnkle', x: centerX - 40 + variation, y: centerY + 200 },
      { name: 'rightAnkle', x: centerX + 40 + variation, y: centerY + 200 },
    ];

    // Adjust pose based on type
    return baseKeypoints.map((point, index) => {
      let { x, y } = point;
      let visibility = 0.8 + Math.random() * 0.2;

      if (poseType === 'fallen') {
        // Simulate fallen pose - body horizontal
        y += 50;
        if (index > 2) { // Below head
          x += (index % 2 === 0 ? -1 : 1) * 30;
          y -= 20;
        }
        visibility *= 0.7; // Lower visibility when fallen
      } else if (poseType === 'distressed') {
        // Simulate distressed pose - arms raised, body tense
        if (index === 6 || index === 7) { // Elbows
          y -= 40;
        }
        if (index === 8 || index === 9) { // Wrists
          y -= 80;
        }
      } else if (poseType === 'moving') {
        // Simulate movement with more variation
        x += (Math.random() - 0.5) * 30;
        y += (Math.random() - 0.5) * 20;
      }

      return {
        x: Math.max(0, Math.min(640, x)),
        y: Math.max(0, Math.min(480, y)),
        visibility,
        z: Math.random() * 10 - 5
      };
    });
  };

  const drawPoseOnCanvas = useCallback((pose: PoseKeypoint[], fallRisk: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set drawing style based on risk level
    const color = fallRisk > 0.7 ? '#ef4444' : fallRisk > 0.4 ? '#f59e0b' : '#10b981';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    // Draw skeleton connections
    const connections = [
      [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8],
      [3, 9], [4, 10], [9, 10], [9, 11], [10, 12], [11, 13], [12, 14]
    ];

    connections.forEach(([start, end]) => {
      if (pose[start] && pose[end] && pose[start].visibility > 0.5 && pose[end].visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(pose[start].x, pose[start].y);
        ctx.lineTo(pose[end].x, pose[end].y);
        ctx.stroke();
      }
    });

    // Draw keypoints
    pose.forEach((point, index) => {
      if (point.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, index === 0 ? 8 : 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw confidence indicator
        ctx.globalAlpha = point.visibility;
        ctx.beginPath();
        ctx.arc(point.x, point.y, (index === 0 ? 8 : 4) + 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw fall risk indicator
    if (fallRisk > 0.3) {
      ctx.fillStyle = `rgba(239, 68, 68, ${fallRisk})`;
      ctx.fillRect(10, 10, 100, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText(`Fall Risk: ${Math.round(fallRisk * 100)}%`, 15, 25);
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setDetection({
      pose: [],
      emotion: 'neutral',
      emotionConfidence: 0,
      isPersonDetected: false,
      fallRisk: 0,
      movementIntensity: 0
    });
  };

  const getRiskColor = (risk: number) => {
    if (risk > 0.7) return 'text-red-400 bg-red-900/20 border-red-500/50';
    if (risk > 0.4) return 'text-orange-400 bg-orange-900/20 border-orange-500/50';
    if (risk > 0.1) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50';
    return 'text-green-400 bg-green-900/20 border-green-500/50';
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'surprised': return '😮';
      case 'fearful': return '😨';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-slate-600/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              MediaPipe Live Monitoring - {room.name}
            </CardTitle>
            <Button
              variant={isActive ? "destructive" : "default"}
              size="sm"
              onClick={isActive ? stopCamera : startCamera}
              className="text-xs h-8"
            >
              {isActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              {isActive ? "Stop" : "Start"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera Feed with Pose Overlay */}
          <div className="relative">
            <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-600/50">
              {isActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  
                  {/* Pose detection overlay */}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1]"
                    width={640}
                    height={480}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">MediaPipe Camera Stopped</p>
                    <p className="text-xs text-slate-500">Start camera to begin pose detection</p>
                  </div>
                </div>
              )}
              
              {/* Live indicators */}
              {isActive && (
                <div className="absolute top-2 left-2 right-2 flex justify-between">
                  <Badge variant="outline" className="bg-black/50 backdrop-blur-sm text-white border-gray-500/50">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                    MEDIAPIPE LIVE
                  </Badge>
                  
                  <Badge 
                    variant="outline" 
                    className={cn("backdrop-blur-sm", getRiskColor(detection.fallRisk))}
                  >
                    Risk: {Math.round(detection.fallRisk * 100)}%
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Analysis */}
          {isActive && detection.isPersonDetected && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Emotion Detection */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getEmotionIcon(detection.emotion)}</span>
                    <span className="text-sm font-medium text-white">Emotion</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300 capitalize">{detection.emotion}</div>
                    <Progress value={detection.emotionConfidence * 100} className="h-1.5" />
                    <div className="text-xs text-slate-400">{Math.round(detection.emotionConfidence * 100)}% confidence</div>
                  </div>
                </CardContent>
              </Card>

              {/* Fall Risk */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={cn("h-5 w-5", detection.fallRisk > 0.7 ? "text-red-400" : "text-orange-400")} />
                    <span className="text-sm font-medium text-white">Fall Risk</span>
                  </div>
                  <div className="space-y-1">
                    <div className={cn("text-xs font-bold", getRiskColor(detection.fallRisk).split(' ')[0])}>
                      {Math.round(detection.fallRisk * 100)}%
                    </div>
                    <Progress value={detection.fallRisk * 100} className="h-1.5" />
                    <div className="text-xs text-slate-400">Based on pose analysis</div>
                  </div>
                </CardContent>
              </Card>

              {/* Movement Activity */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span className="text-sm font-medium text-white">Movement</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300">{Math.round(detection.movementIntensity * 100)}% intensity</div>
                    <Progress value={detection.movementIntensity * 100} className="h-1.5" />
                    <div className="text-xs text-slate-400">Real-time activity level</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pose Keypoints Info */}
          {isActive && detection.pose.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Pose Detection</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Keypoints:</span>
                    <span className="text-purple-400">{detection.pose.filter(p => p.visibility > 0.5).length}/17</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Avg Confidence:</span>
                    <span className="text-purple-400">
                      {Math.round(detection.pose.reduce((sum, p) => sum + p.visibility, 0) / detection.pose.length * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Person:</span>
                    <span className="text-green-400">Detected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vitals Integration */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-white">Heart Rate</span>
                </div>
                <div className="text-lg font-bold text-red-400">{sensorData.heartRate} BPM</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Position</span>
                </div>
                <div className="text-lg font-bold text-blue-400 capitalize">{sensorData.position}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent AI Alerts */}
          {alertHistory.length > 0 && (
            <Card className="bg-red-900/20 border-red-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">AI Detection Alerts</span>
                </div>
                <div className="space-y-1 max-h-16 overflow-y-auto">
                  {alertHistory.map((alert, index) => (
                    <div key={index} className="text-xs text-red-300 bg-red-900/20 p-1 rounded">
                      {alert}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Actions */}
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Emergency Simulation</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => onTriggerEvent('fall')}
                  variant="outline"
                  size="sm"
                  className="bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/40 text-xs h-8"
                >
                  Fall Alert
                </Button>
                <Button
                  onClick={() => onTriggerEvent('risky_behavior')}
                  variant="outline"
                  size="sm"
                  className="bg-orange-900/20 border-orange-500/50 text-orange-400 hover:bg-orange-900/40 text-xs h-8"
                >
                  Risky Move
                </Button>
                <Button
                  onClick={() => onTriggerEvent('distress')}
                  variant="outline"
                  size="sm"
                  className="bg-purple-900/20 border-purple-500/50 text-purple-400 hover:bg-purple-900/40 text-xs h-8"
                >
                  Distress
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}