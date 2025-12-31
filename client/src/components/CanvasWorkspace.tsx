import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FurniturePart {
  maskId: string;
  maskData: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  partLabel: string;
  confidence: number;
  area: number;
}

interface CanvasWorkspaceProps {
  imageUrl?: string;
  selectedColor?: string;
  imageId?: string;
  className?: string;
  furnitureParts?: FurniturePart[];
}

interface ColoredMask {
  id: string;
  maskUrl: string;
  color: string;
  opacity: number;
  clickX: number;
  clickY: number;
}

export function CanvasWorkspace({ 
  imageUrl, 
  selectedColor = "#FF0000",
  imageId,
  className 
}: CanvasWorkspaceProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const baseImageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(100);
  const [masks, setMasks] = useState<ColoredMask[]>([]);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
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
        renderCanvas();
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

  const renderCanvas = async () => {
    const canvas = canvasRef.current;
    const baseImage = baseImageRef.current;
    if (!canvas || !baseImage || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const mask of masks) {
      try {
        const maskImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = mask.maskUrl;
        });

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) continue;

        tempCtx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        tempCtx.clearRect(0, 0, canvas.width, canvas.height);
        tempCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
        const maskData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        const maskPixels = maskData.data;

        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : { r: 0, g: 0, b: 0 };
        };

        const colorRgb = hexToRgb(mask.color);

        for (let i = 0; i < pixels.length; i += 4) {
          const maskAlpha = maskPixels[i + 3] / 255;
          
          if (maskAlpha > 0.01) {
            const origR = pixels[i];
            const origG = pixels[i + 1];
            const origB = pixels[i + 2];
            
            const brightness = (0.299 * origR + 0.587 * origG + 0.114 * origB) / 255;
            
            const tintedR = colorRgb.r * brightness;
            const tintedG = colorRgb.g * brightness;
            const tintedB = colorRgb.b * brightness;
            
            pixels[i] = origR + (tintedR - origR) * maskAlpha;
            pixels[i + 1] = origG + (tintedG - origG) * maskAlpha;
            pixels[i + 2] = origB + (tintedB - origB) * maskAlpha;
          }
        }

        tempCtx.putImageData(imageData, 0, 0);
        ctx.globalAlpha = mask.opacity;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalAlpha = 1;

      } catch (error) {
        console.error('Failed to render mask:', error);
      }
    }
  };

  useEffect(() => {
    renderCanvas();
  }, [masks, imageDimensions, imageLoaded]);

  const floodFillMask = (x: number, y: number): string => {
    const baseImage = baseImageRef.current;
    if (!baseImage) return '';

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = baseImage.naturalWidth;
    tempCanvas.height = baseImage.naturalHeight;
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '';

    ctx.drawImage(baseImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    const tolerance = 35;
    const targetPos = (y * tempCanvas.width + x) * 4;
    const targetR = data[targetPos];
    const targetG = data[targetPos + 1];
    const targetB = data[targetPos + 2];

    const visited = new Uint8Array(tempCanvas.width * tempCanvas.height);
    const queue: [number, number][] = [[x, y]];
    let head = 0;
    
    const colorMatch = (pos: number) => {
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      const a = data[pos + 3];
      
      if (a < 10) return false;
      
      const dr = Math.abs(r - targetR);
      const dg = Math.abs(g - targetG);
      const db = Math.abs(b - targetB);
      const euclidean = Math.sqrt(dr * dr + dg * dg + db * db);
      
      return euclidean <= tolerance * 1.7;
    };

    while (head < queue.length) {
      const [cx, cy] = queue[head++];
      if (cx < 0 || cx >= tempCanvas.width || cy < 0 || cy >= tempCanvas.height) continue;
      
      const index = cy * tempCanvas.width + cx;
      if (visited[index]) continue;
      
      const pos = index * 4;
      if (!colorMatch(pos)) continue;
      
      visited[index] = 255;
      
      queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    const smoothed = new Uint8Array(tempCanvas.width * tempCanvas.height);
    for (let y = 1; y < tempCanvas.height - 1; y++) {
      for (let x = 1; x < tempCanvas.width - 1; x++) {
        const idx = y * tempCanvas.width + x;
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += visited[(y + dy) * tempCanvas.width + (x + dx)];
          }
        }
        smoothed[idx] = sum > 1275 ? 255 : 0;
      }
    }

    const maskData = ctx.createImageData(tempCanvas.width, tempCanvas.height);
    for (let i = 0; i < smoothed.length; i++) {
      const alpha = smoothed[i];
      maskData.data[i * 4] = 255;
      maskData.data[i * 4 + 1] = 255;
      maskData.data[i * 4 + 2] = 255;
      maskData.data[i * 4 + 3] = alpha;
    }
    
    ctx.putImageData(maskData, 0, 0);
    return tempCanvas.toDataURL();
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageUrl || isSegmenting) return;

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = imageDimensions.width > 0 ? baseImageRef.current!.naturalWidth / imageDimensions.width : 1;
    const scaleY = imageDimensions.height > 0 ? baseImageRef.current!.naturalHeight / imageDimensions.height : 1;

    const actualX = Math.round(x * scaleX);
    const actualY = Math.round(y * scaleY);

    setIsSegmenting(true);

    try {
      const maskUrl = floodFillMask(actualX, actualY);
      
      if (!maskUrl) {
        throw new Error('Failed to create mask');
      }

      const newMask: ColoredMask = {
        id: crypto.randomUUID(),
        maskUrl,
        color: selectedColor,
        opacity: 0.7,
        clickX: actualX,
        clickY: actualY
      };

      setMasks(prev => [...prev, newMask]);

      toast({
        title: "Part selected!",
        description: "Selected similar-colored area. Click to select more parts or change colors.",
      });

    } catch (error) {
      console.error('Segmentation error:', error);
      toast({
        title: "Selection failed",
        description: "Failed to select area. Please try clicking a different spot.",
        variant: "destructive"
      });
    } finally {
      setIsSegmenting(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleReset = () => {
    setZoom(100);
    setMasks([]);
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    const baseImage = baseImageRef.current;
    if (!canvas || !baseImage) return;

    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = baseImage.naturalWidth;
    downloadCanvas.height = baseImage.naturalHeight;
    const ctx = downloadCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(baseImage, 0, 0);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    for (const mask of masks) {
      try {
        const maskImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = mask.maskUrl;
        });

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = downloadCanvas.width;
        tempCanvas.height = downloadCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) continue;

        tempCtx.drawImage(baseImage, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;

        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(maskImg, 0, 0);
        const maskData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const maskPixels = maskData.data;

        const colorRgb = hexToRgb(mask.color);

        for (let i = 0; i < pixels.length; i += 4) {
          const maskAlpha = maskPixels[i + 3] / 255;
          
          if (maskAlpha > 0.01) {
            const origR = pixels[i];
            const origG = pixels[i + 1];
            const origB = pixels[i + 2];
            
            const brightness = (0.299 * origR + 0.587 * origG + 0.114 * origB) / 255;
            
            const tintedR = colorRgb.r * brightness;
            const tintedG = colorRgb.g * brightness;
            const tintedB = colorRgb.b * brightness;
            
            pixels[i] = origR + (tintedR - origR) * maskAlpha * mask.opacity;
            pixels[i + 1] = origG + (tintedG - origG) * maskAlpha * mask.opacity;
            pixels[i + 2] = origB + (tintedB - origB) * maskAlpha * mask.opacity;
          }
        }

        tempCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      } catch (error) {
        console.error('Failed to apply mask to download:', error);
      }
    }

    downloadCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customized-furniture.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleUpdateLastMaskColor = () => {
    if (masks.length === 0) return;

    setMasks(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        color: selectedColor
      };
      return updated;
    });
  };

  useEffect(() => {
    if (selectedColor && masks.length > 0) {
      handleUpdateLastMaskColor();
    }
  }, [selectedColor]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 p-4 border-b bg-background">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 50}
          data-testid="button-zoom-out"
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
            data-testid="slider-zoom"
          />
          <span className="text-sm font-medium w-12 text-right" data-testid="text-zoom-level">{zoom}%</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 200}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          data-testid="button-reset"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          disabled={!imageLoaded}
          data-testid="button-download"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div 
        ref={canvasContainerRef}
        className="flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
        data-testid="canvas-container"
      >
        {!imageUrl && (
          <div className="text-center text-muted-foreground" data-testid="text-no-image">
            <p>Upload an image to get started</p>
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
            data-testid="canvas-clickable-area"
          >
            <img
              ref={baseImageRef}
              alt="Furniture"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
              data-testid="img-base-furniture"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              data-testid="canvas-overlay"
            />
            {isSegmenting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm" data-testid="loading-segmentation">
                <div className="bg-background p-4 rounded-lg shadow-lg flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">Detecting furniture part...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {masks.length > 0 && (
        <div className="p-2 border-t bg-background text-sm text-muted-foreground" data-testid="text-masks-count">
          {masks.length} part{masks.length !== 1 ? 's' : ''} colored
        </div>
      )}
    </div>
  );
}
