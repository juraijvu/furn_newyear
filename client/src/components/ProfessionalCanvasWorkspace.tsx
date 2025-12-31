import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Download, Loader2, Palette, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProfessionalCanvasWorkspaceProps {
  imageUrl?: string;
  selectedColor?: string;
  imageId?: string;
  className?: string;
  onResultGenerated?: (resultUrl: string) => void;
}

interface ProcessingState {
  isSegmenting: boolean;
  isInpainting: boolean;
  currentStep: string;
}

const MATERIAL_OPTIONS = [
  { value: 'leather', label: 'Premium Leather' },
  { value: 'fabric', label: 'High-End Fabric' },
  { value: 'velvet', label: 'Luxurious Velvet' },
  { value: 'linen', label: 'Natural Linen' },
  { value: 'cotton', label: 'Premium Cotton' },
  { value: 'microfiber', label: 'Soft Microfiber' },
  { value: 'wood', label: 'Natural Wood' },
  { value: 'metal', label: 'Brushed Metal' }
];

const FURNITURE_PARTS = [
  { value: 'cushion', label: 'Cushion' },
  { value: 'seat', label: 'Seat' },
  { value: 'backrest', label: 'Backrest' },
  { value: 'armrest', label: 'Armrest' },
  { value: 'leg', label: 'Leg' },
  { value: 'table_top', label: 'Table Top' },
  { value: 'drawer', label: 'Drawer' },
  { value: 'door', label: 'Door' },
  { value: 'frame', label: 'Frame' }
];

export function ProfessionalCanvasWorkspace({ 
  imageUrl, 
  selectedColor = "#FF0000",
  imageId,
  className,
  onResultGenerated
}: ProfessionalCanvasWorkspaceProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const baseImageRef = useRef<HTMLImageElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(100);
  const [processing, setProcessing] = useState<ProcessingState>({
    isSegmenting: false,
    isInpainting: false,
    currentStep: ""
  });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [selectedMaterial, setSelectedMaterial] = useState('fabric');
  const [selectedPart, setSelectedPart] = useState('cushion');
  const [currentMask, setCurrentMask] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (imageUrl && baseImageRef.current) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const container = canvasContainerRef.current;
        if (!container) return;

        const containerWidth = container.clientWidth || 800;
        const containerHeight = container.clientHeight || 600;
        
        const scale = Math.min(
          containerWidth / img.width,
          containerHeight / img.height,
          1
        ) * 0.9;

        const displayWidth = img.width * scale;
        const displayHeight = img.height * scale;

        setImageDimensions({
          width: displayWidth,
          height: displayHeight
        });

        if (baseImageRef.current) {
          baseImageRef.current.src = img.src;
        }
        
        setImageLoaded(true);
        setResultImage(null); // Reset result when new image loads
      };
      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load image",
          variant: "destructive"
        });
      };
      img.src = imageUrl;
    }
  }, [imageUrl, toast]);

  const drawClickIndicator = (x: number, y: number) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw crosshair
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();

    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageUrl || processing.isSegmenting || processing.isInpainting) return;

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to image coordinates
    const scaleX = imageDimensions.width > 0 ? baseImageRef.current!.naturalWidth / imageDimensions.width : 1;
    const scaleY = imageDimensions.height > 0 ? baseImageRef.current!.naturalHeight / imageDimensions.height : 1;

    const actualX = Math.round(x * scaleX);
    const actualY = Math.round(y * scaleY);

    // Draw click indicator
    drawClickIndicator(x, y);

    setProcessing({
      isSegmenting: true,
      isInpainting: false,
      currentStep: "Analyzing furniture part..."
    });

    try {
      // Professional recolor workflow using Replicate API
      const response = await apiRequest('/api/professional-recolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          clickX: actualX,
          clickY: actualY,
          color: selectedColor,
          material: selectedMaterial,
          furniturePart: selectedPart,
          imageId,
          autoSegment: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const result = await response.json();
      
      console.log('API Response:', result);
      
      if (!result.resultUrl) {
        throw new Error('No result URL received from server');
      }
      
      setCurrentMask(result.maskUrl);
      setResultImage(result.resultUrl);
      
      if (onResultGenerated) {
        onResultGenerated(result.resultUrl);
      }

      toast({
        title: "Success!",
        description: `Applied ${selectedMaterial} texture in ${result.settings.color} to ${result.partLabel}`,
      });

    } catch (error) {
      console.error('Professional recolor error:', error);
      
      let errorMessage = "Failed to apply professional material change. Please try again.";
      let errorDetails = "";
      
      if (error instanceof Error) {
        errorDetails = error.message;
      }
      
      // Try to parse error response for more details
      if (typeof error === 'object' && error !== null) {
        const errorObj = error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        }
        if (errorObj.details) {
          errorDetails = errorObj.details;
        }
      }
      
      toast({
        title: "Processing failed",
        description: `${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`,
        variant: "destructive"
      });
    } finally {
      setProcessing({
        isSegmenting: false,
        isInpainting: false,
        currentStep: ""
      });
    }
  };

  const handleAutoSegment = async () => {
    if (!imageUrl || processing.isSegmenting || processing.isInpainting) return;

    setProcessing({
      isSegmenting: true,
      isInpainting: false,
      currentStep: "Auto-detecting furniture parts..."
    });

    try {
      const response = await apiRequest('/api/professional-recolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          color: selectedColor,
          material: selectedMaterial,
          furniturePart: selectedPart,
          imageId,
          autoSegment: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to auto-segment image');
      }

      const result = await response.json();
      
      console.log('Auto-segment API Response:', result);
      
      if (!result.resultUrl) {
        throw new Error('No result URL received from server');
      }
      
      setCurrentMask(result.maskUrl);
      setResultImage(result.resultUrl);
      
      if (onResultGenerated) {
        onResultGenerated(result.resultUrl);
      }

      toast({
        title: "Auto-detection complete!",
        description: `Applied ${selectedMaterial} texture to detected ${result.partLabel}`,
      });

    } catch (error) {
      console.error('Auto-segment error:', error);
      
      let errorMessage = "Failed to automatically detect furniture parts. Try clicking manually.";
      let errorDetails = "";
      
      if (error instanceof Error) {
        errorDetails = error.message;
      }
      
      // Try to parse error response for more details
      if (typeof error === 'object' && error !== null) {
        const errorObj = error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        }
        if (errorObj.details) {
          errorDetails = errorObj.details;
        }
      }
      
      toast({
        title: "Auto-detection failed",
        description: `${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`,
        variant: "destructive"
      });
    } finally {
      setProcessing({
        isSegmenting: false,
        isInpainting: false,
        currentStep: ""
      });
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  
  const handleReset = () => {
    setZoom(100);
    setCurrentMask(null);
    setResultImage(null);
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = 'professional-furniture-recolor.png';
    a.click();
  };

  const displayImage = resultImage || imageUrl;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Controls */}
      <div className="flex items-center gap-2 p-4 border-b bg-background">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 50}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 min-w-[120px]">
          <Slider
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
            min={50}
            max={200}
            step={10}
            className="flex-1"
          />
          <span className="text-sm font-medium w-12 text-right">{zoom}%</span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 200}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {/* Material Selection */}
        <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MATERIAL_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Part Selection */}
        <Select value={selectedPart} onValueChange={setSelectedPart}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FURNITURE_PARTS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleAutoSegment}
          disabled={!imageLoaded || processing.isSegmenting || processing.isInpainting}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Auto-Detect
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          disabled={!resultImage}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasContainerRef}
        className="flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
      >
        {!imageUrl && (
          <div className="text-center text-muted-foreground">
            <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Professional Furniture Customizer</p>
            <p className="text-sm">Upload an image to get started with precision color matching</p>
          </div>
        )}
        
        {imageUrl && (
          <div 
            className="relative cursor-crosshair"
            style={{
              width: `${imageDimensions.width}px`,
              height: `${imageDimensions.height}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
            onClick={handleCanvasClick}
          >
            <img
              ref={baseImageRef}
              src={displayImage}
              alt="Furniture"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 pointer-events-none"
            />
            
            {(processing.isSegmenting || processing.isInpainting) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="bg-background p-6 rounded-lg shadow-lg flex items-center gap-4 max-w-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">Processing...</p>
                    <p className="text-sm text-muted-foreground">{processing.currentStep}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t bg-background text-sm text-muted-foreground flex items-center justify-between">
        <div>
          {resultImage ? (
            <span className="text-green-600 font-medium">✓ Professional recolor applied</span>
          ) : imageLoaded ? (
            <span>Click on furniture part to apply professional material change</span>
          ) : (
            <span>Ready for professional furniture customization</span>
          )}
        </div>
        {selectedColor && (
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: selectedColor }}
            />
            <span>Selected Color</span>
          </div>
        )}
      </div>
    </div>
  );
}