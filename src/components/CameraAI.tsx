import React, { useState, useRef, useEffect } from "react";
import { Camera, CameraOff, AlertTriangle, Smile, Frown, Meh, Angry, User, Activity, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CameraAIProps {
  onEmergencyDetected: (type: "aggressive" | "fall" | "distress") => void;
  isEnabled: boolean;
  onToggle: () => void;
}

type EmotionType = 'happy' | 'sad' | 'neutral' | 'angry' | 'surprised' | 'fearful';
type PostureType = 'standing' | 'sitting' | 'lying' | 'bending' | 'fallen';

interface DetectionData {
  emotion: EmotionType;
  confidence: number;
  posture: PostureType;
  postureConfidence: number;
  heartRate?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function CameraAI({ onEmergencyDetected, isEnabled, onToggle }: CameraAIProps) {
  const [isActive, setIsActive] = useState(false);
  const [detection, setDetection] = useState<DetectionData>({
    emotion: 'neutral',
    confidence: 0,
    posture: 'sitting',
    postureConfidence: 0,
    heartRate: 72,
    riskLevel: 'low'
  });
  const [alertHistory, setAlertHistory] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate real-time AI detection
  useEffect(() => {
    if (!isActive || !isEnabled) return;

    const interval = setInterval(() => {
      // Simulate AI detection results
      const emotions: EmotionType[] = ['happy', 'sad', 'neutral', 'angry', 'surprised', 'fearful'];
      const postures: PostureType[] = ['standing', 'sitting', 'lying', 'bending', 'fallen'];
      
      const detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const detectedPosture = postures[Math.floor(Math.random() * postures.length)];
      const emotionConfidence = 0.7 + Math.random() * 0.3;
      const postureConfidence = 0.6 + Math.random() * 0.4;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      
      if (detectedEmotion === 'angry' && emotionConfidence > 0.8) {
        riskLevel = 'critical';
        onEmergencyDetected('aggressive');
        setAlertHistory(prev => [`${new Date().toLocaleTimeString()}: Aggressive behavior detected`, ...prev.slice(0, 4)]);
      } else if (detectedPosture === 'fallen') {
        riskLevel = 'critical';
        onEmergencyDetected('fall');
        setAlertHistory(prev => [`${new Date().toLocaleTimeString()}: Fall detected`, ...prev.slice(0, 4)]);
      } else if (detectedPosture === 'bending' && postureConfidence > 0.85) {
        riskLevel = 'high';
        onEmergencyDetected('fall');
        setAlertHistory(prev => [`${new Date().toLocaleTimeString()}: Potential fall risk - bending detected`, ...prev.slice(0, 4)]);
      } else if (detectedEmotion === 'fearful' || detectedEmotion === 'sad') {
        riskLevel = 'medium';
        if (Math.random() > 0.7) {
          onEmergencyDetected('distress');
          setAlertHistory(prev => [`${new Date().toLocaleTimeString()}: Emotional distress detected`, ...prev.slice(0, 4)]);
        }
      }

      setDetection({
        emotion: detectedEmotion,
        confidence: emotionConfidence,
        posture: detectedPosture,
        postureConfidence,
        heartRate: 70 + Math.floor(Math.random() * 30),
        riskLevel
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive, isEnabled, onEmergencyDetected]);

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
      alert('Camera access denied. Please allow camera permissions and refresh the page.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  const getEmotionIcon = (emotion: EmotionType) => {
    switch (emotion) {
      case 'happy': return <Smile className="h-5 w-5 text-green-400" />;
      case 'sad': return <Frown className="h-5 w-5 text-blue-400" />;
      case 'angry': return <Angry className="h-5 w-5 text-red-400" />;
      case 'surprised': return <Eye className="h-5 w-5 text-yellow-400" />;
      case 'fearful': return <EyeOff className="h-5 w-5 text-purple-400" />;
      default: return <Meh className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50';
      default: return 'text-green-400 bg-green-900/20 border-green-500/50';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-slate-600/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-cyan-400" />
              Camera AI Detection
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className={cn(
                  "text-xs h-8",
                  isEnabled ? "text-green-400 border-green-500/50" : "text-gray-400 border-gray-500/50"
                )}
              >
                {isEnabled ? "Enabled" : "Disabled"}
              </Button>
              <Button
                variant={isActive ? "destructive" : "default"}
                size="sm"
                onClick={isActive ? stopCamera : startCamera}
                disabled={!isEnabled}
                className="text-xs h-8"
              >
                {isActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                {isActive ? "Stop" : "Start"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera Feed */}
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
                  
                  {/* Face detection overlay */}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    width={640}
                    height={480}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Camera {isEnabled ? 'stopped' : 'disabled'}</p>
                  </div>
                </div>
              )}
              
              {/* Detection Overlay */}
              {isActive && (
                <div className="absolute top-2 left-2 right-2 flex justify-between">
                  <Badge variant="outline" className="bg-black/50 backdrop-blur-sm text-white border-gray-500/50">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                    LIVE AI
                  </Badge>
                  
                  <Badge 
                    variant="outline" 
                    className={cn("backdrop-blur-sm", getRiskColor(detection.riskLevel))}
                  >
                    Risk: {detection.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
            
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ display: 'none' }}
            />
          </div>

          {/* Detection Results */}
          {isActive && (
            <div className="grid grid-cols-2 gap-3">
              {/* Emotion Detection */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getEmotionIcon(detection.emotion)}
                    <span className="text-sm font-medium text-white">Emotion</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300 capitalize">{detection.emotion}</div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${detection.confidence * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400">{Math.round(detection.confidence * 100)}% confidence</div>
                  </div>
                </CardContent>
              </Card>

              {/* Posture Detection */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-medium text-white">Posture</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300 capitalize">{detection.posture}</div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-purple-400 transition-all duration-300"
                        style={{ width: `${detection.postureConfidence * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400">{Math.round(detection.postureConfidence * 100)}% confidence</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Vitals & Alerts */}
          {isActive && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-white">Heart Rate</span>
                </div>
                <span className="text-lg font-bold text-green-400">{detection.heartRate} BPM</span>
              </div>

              {/* Recent Alerts */}
              {alertHistory.length > 0 && (
                <Card className="bg-red-900/20 border-red-500/30">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Recent Alerts</span>
                    </div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {alertHistory.map((alert, index) => (
                        <div key={index} className="text-xs text-red-300 bg-red-900/20 p-1 rounded">
                          {alert}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}