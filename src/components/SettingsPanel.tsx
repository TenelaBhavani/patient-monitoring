import { Settings, Volume2, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { DetectionConfig } from "@/types/monitoring";

interface SettingsPanelProps {
  config: DetectionConfig;
  onConfigChange: (config: DetectionConfig) => void;
}

export function SettingsPanel({ config, onConfigChange }: SettingsPanelProps) {
  const updateConfig = (section: keyof DetectionConfig, key: string, value: any) => {
    onConfigChange({
      ...config,
      [section]: {
        ...config[section],
        [key]: value,
      },
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-slate-400" />
          Detection Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Fall Detection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <Label className="text-white font-medium">Fall Detection</Label>
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-300">Enable Detection</Label>
            <Switch
              checked={config.fallDetection.enabled}
              onCheckedChange={(checked) => 
                updateConfig('fallDetection', 'enabled', checked)
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">
              Confidence Threshold: {Math.round(config.fallDetection.confidenceThreshold * 100)}%
            </Label>
            <Slider
              value={[config.fallDetection.confidenceThreshold]}
              onValueChange={([value]) => 
                updateConfig('fallDetection', 'confidenceThreshold', value)
              }
              min={0.5}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>
        </div>

        {/* Risky Behavior Detection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-400" />
            <Label className="text-white font-medium">Risky Behavior</Label>
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-300">Enable Detection</Label>
            <Switch
              checked={config.riskyBehavior.enabled}
              onCheckedChange={(checked) => 
                updateConfig('riskyBehavior', 'enabled', checked)
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">
              Confidence Threshold: {Math.round(config.riskyBehavior.confidenceThreshold * 100)}%
            </Label>
            <Slider
              value={[config.riskyBehavior.confidenceThreshold]}
              onValueChange={([value]) => 
                updateConfig('riskyBehavior', 'confidenceThreshold', value)
              }
              min={0.5}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>
        </div>

        {/* Distress Detection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-purple-400" />
            <Label className="text-white font-medium">Distress Detection</Label>
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-300">Enable Detection</Label>
            <Switch
              checked={config.distressDetection.enabled}
              onCheckedChange={(checked) => 
                updateConfig('distressDetection', 'enabled', checked)
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">
              Confidence Threshold: {Math.round(config.distressDetection.confidenceThreshold * 100)}%
            </Label>
            <Slider
              value={[config.distressDetection.confidenceThreshold]}
              onValueChange={([value]) => 
                updateConfig('distressDetection', 'confidenceThreshold', value)
              }
              min={0.5}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>
        </div>

        {/* Alert Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-green-400" />
            <Label className="text-white font-medium">Alert Settings</Label>
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-300">Sound Enabled</Label>
            <Switch
              checked={config.alerting.soundEnabled}
              onCheckedChange={(checked) => 
                updateConfig('alerting', 'soundEnabled', checked)
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-300">Escalation Enabled</Label>
            <Switch
              checked={config.alerting.escalationEnabled}
              onCheckedChange={(checked) => 
                updateConfig('alerting', 'escalationEnabled', checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}