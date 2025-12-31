import { Palette, HelpCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  onOpenGallery?: () => void;
}

export default function Header({ 
  projectName = "Untitled Project", 
  onProjectNameChange,
  onOpenGallery 
}: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-semibold">Furniture Customizer</h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <Input
          data-testid="input-project-name"
          value={projectName}
          onChange={(e) => onProjectNameChange?.(e.target.value)}
          className="text-center font-medium"
          placeholder="Project name..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={onOpenGallery}
          data-testid="button-open-gallery"
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          My Projects
        </Button>
        <Button size="icon" variant="ghost" data-testid="button-help">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
