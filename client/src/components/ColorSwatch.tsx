import { cn } from "@/lib/utils";
import type { ColorItem } from "@/data/colorPalette";

interface ColorSwatchProps {
  color: ColorItem;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function ColorSwatch({ color, isSelected, onClick, size = "md" }: ColorSwatchProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <button
      onClick={onClick}
      data-testid={`color-swatch-${color.id}`}
      className={cn(
        "group flex flex-col items-center gap-1 transition-all",
        onClick && "cursor-pointer"
      )}
    >
      <div
        className={cn(
          sizeClasses[size],
          "rounded-lg border-2 transition-all hover-elevate active-elevate-2",
          isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
        )}
        style={{ backgroundColor: color.hexColor }}
      />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-mono font-medium text-foreground">{color.code}</span>
        <span className="text-xs text-muted-foreground truncate max-w-[80px] group-hover:text-foreground transition-colors" title={color.name}>
          {color.name}
        </span>
      </div>
    </button>
  );
}
