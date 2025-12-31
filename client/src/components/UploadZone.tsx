import { useCallback, useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onImageUpload?: (file: File) => void;
  className?: string;
}

export default function UploadZone({ onImageUpload, className }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onImageUpload?.(files[0]);
    }
  }, [onImageUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageUpload?.(files[0]);
    }
  }, [onImageUpload]);

  return (
    <div
      data-testid="upload-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative min-h-96 border-2 border-dashed rounded-xl transition-all hover-elevate cursor-pointer",
        isDragging ? "border-primary bg-primary/5" : "border-border",
        className
      )}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        data-testid="input-file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Upload className="h-16 w-16 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-medium mb-2">
          Drag & Drop Furniture Image
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          or click to browse • JPG, PNG up to 10MB
        </p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card/50 hover-elevate">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sofa</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card/50 hover-elevate">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Chair</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card/50 hover-elevate">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Table</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card/50 hover-elevate">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Other</span>
          </div>
        </div>
      </div>
    </div>
  );
}
