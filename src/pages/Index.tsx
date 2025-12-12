import { useMonitoringSimulator } from "@/hooks/useMonitoringSimulator";
import { Header } from "@/components/Header";
import { RoomCard } from "@/components/RoomCard";
import { MonitoringCard } from "@/components/MonitoringCard";
import { AlertItem } from "@/components/AlertItem";
import { SettingsPanel } from "@/components/SettingsPanel";
import { EmergencyAlert } from "@/components/EmergencyAlert";
import { CameraAI } from "@/components/CameraAI";
import { MediaPipeMonitor } from "@/components/MediaPipeMonitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2, VolumeX, AlertTriangle, Activity, Users, Wifi, Camera, Target } from "lucide-react";
import { useState } from "react";

export default function Index() {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const {
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
  } = useMonitoringSimulator();

  return (
    <div className="min-h-screen bg-slate-900">
      <Header stats={stats} />
      
      <div className="p-6 space-y-6">
        {currentAlert && (
          <EmergencyAlert
            alert={currentAlert}
            onAcknowledge={acknowledgeAlert}
            onMute={toggleMute}
            isMuted={isMuted}
          />
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">
                Patient Monitor Dashboard
              </h1>
              
              <div className="flex items-center gap-3">
                <Button
                  variant={isPaused ? "default" : "outline"}
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-2"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={toggleMute}
                  className="flex items-center gap-2"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-slate-800 border-slate-700 h-20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-300">Total Rooms</div>
                      <div className="text-xl font-bold text-white">{stats.totalRooms}</div>
                    </div>
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 h-20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-300">Active Alerts</div>
                      <div className="text-xl font-bold text-red-400">{stats.activeAlerts}</div>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 h-20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-300">Avg FPS</div>
                      <div className="text-xl font-bold text-white">{stats.avgFps}</div>
                    </div>
                    <Activity className="h-4 w-4 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 h-20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-300">System Uptime</div>
                      <div className="text-xl font-bold text-white">{stats.uptime}</div>
                    </div>
                    <Wifi className="h-4 w-4 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="rooms" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-slate-800">
                <TabsTrigger value="rooms">Room Overview</TabsTrigger>
                <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
                <TabsTrigger value="mediapipe">MediaPipe AI</TabsTrigger>
                <TabsTrigger value="alerts">Alert History</TabsTrigger>
                <TabsTrigger value="camera">Camera AI</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rooms" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onClick={() => setSelectedRoom(room.id)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="monitoring">
                <MonitoringCard
                  room={rooms.find(r => r.id === selectedRoom)!}
                  sensorData={sensorData}
                  onTriggerEvent={triggerEvent}
                />
              </TabsContent>
              
              <TabsContent value="mediapipe">
                <MediaPipeMonitor
                  room={rooms.find(r => r.id === selectedRoom)!}
                  sensorData={sensorData}
                  onTriggerEvent={triggerEvent}
                  isPaused={isPaused}
                />
              </TabsContent>
              
              <TabsContent value="alerts">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {alerts.length === 0 ? (
                          <p className="text-slate-400 text-center py-8">
                            No alerts in the system
                          </p>
                        ) : (
                          alerts.map((alert) => (
                            <AlertItem
                              key={alert.id}
                              alert={alert}
                              onAcknowledge={acknowledgeAlert}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="camera">
                <CameraAI
                  isEnabled={cameraEnabled}
                  onToggle={() => setCameraEnabled(!cameraEnabled)}
                  onEmergencyDetected={(type) => {
                    if (type === 'aggressive' || type === 'distress') {
                      triggerEvent('distress');
                    } else if (type === 'fall') {
                      triggerEvent('fall');
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:w-96">
            <SettingsPanel
              config={config}
              onConfigChange={setConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
}