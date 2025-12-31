import { useState } from "react";
import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import type { ColorItem } from "@/data/colorPalette";

interface PropertiesPanelProps {
  selectedColor?: ColorItem | null;
  opacity?: number;
  blendMode?: string;
  onOpacityChange?: (opacity: number) => void;
  onBlendModeChange?: (mode: string) => void;
  onDownload?: (filename: string, format: string, scale: number) => void;
  onSave?: () => void;
}

export default function PropertiesPanel({ 
  selectedColor, 
  opacity = 70,
  blendMode = "multiply",
  onOpacityChange,
  onBlendModeChange,
  onDownload,
  onSave 
}: PropertiesPanelProps) {
  const [fileName, setFileName] = useState("customized-furniture");
  const [format, setFormat] = useState("png");
  const [resolution, setResolution] = useState("1x");

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-wide uppercase text-sm">Properties</h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {selectedColor && (
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-medium">Active Selection</h3>
            
            <div className="space-y-2">
              <Label htmlFor="region-name" className="text-xs text-muted-foreground">Region Name</Label>
              <Input 
                id="region-name"
                data-testid="input-region-name"
                placeholder="e.g., Sofa Seat" 
                defaultValue="Selected Area"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Applied Color</Label>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <div 
                  className="h-10 w-10 rounded-md border-2 flex-shrink-0"
                  style={{ backgroundColor: selectedColor.hexColor }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedColor.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedColor.code}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="opacity" className="text-xs text-muted-foreground">Opacity</Label>
                <span className="text-xs font-mono">{Math.round(opacity)}%</span>
              </div>
              <Slider
                id="opacity"
                data-testid="slider-opacity"
                value={[opacity]}
                onValueChange={(val) => onOpacityChange?.(val[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blend-mode" className="text-xs text-muted-foreground">Blend Mode</Label>
              <Select value={blendMode} onValueChange={onBlendModeChange}>
                <SelectTrigger id="blend-mode" data-testid="select-blend-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="multiply">Multiply</SelectItem>
                  <SelectItem value="overlay">Overlay</SelectItem>
                  <SelectItem value="screen">Screen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}

        <Card className="p-4 space-y-4">
          <h3 className="text-sm font-medium">Export Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="file-name" className="text-xs text-muted-foreground">File Name</Label>
            <Input
              id="file-name"
              data-testid="input-filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format" className="text-xs text-muted-foreground">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format" data-testid="select-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution" className="text-xs text-muted-foreground">Resolution</Label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger id="resolution" data-testid="select-resolution">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1x">Original (1x)</SelectItem>
                <SelectItem value="2x">High (2x)</SelectItem>
                <SelectItem value="4x">Ultra (4x)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 space-y-2">
            <Button 
              className="w-full" 
              onClick={() => {
                const scale = resolution === "1x" ? 1 : resolution === "2x" ? 2 : 4;
                onDownload?.(fileName, format, scale);
              }}
              data-testid="button-download"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onSave}
              data-testid="button-save-project"
            >
              <Save className="h-4 w-4 mr-2" />
              Save to Gallery
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
