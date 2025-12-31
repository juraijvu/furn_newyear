import { Trash2, Copy, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  thumbnail: string;
  date: string;
}

interface ProjectGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects?: Project[];
  onProjectSelect?: (project: Project) => void;
  onProjectDelete?: (id: string) => void;
  onProjectDuplicate?: (id: string) => void;
}

export default function ProjectGallery({
  open,
  onOpenChange,
  projects = [],
  onProjectSelect,
  onProjectDelete,
  onProjectDuplicate
}: ProjectGalleryProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">My Projects</DialogTitle>
        </DialogHeader>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-8 mb-4">
              <Copy className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start customizing furniture to create your first project
            </p>
            <Button onClick={() => onOpenChange(false)} data-testid="button-start-project">
              Start Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 overflow-auto max-h-[60vh] p-1">
            {projects.map((project) => (
              <Card 
                key={project.id}
                className="group overflow-hidden hover-elevate cursor-pointer"
                onClick={() => {
                  onProjectSelect?.(project);
                  onOpenChange(false);
                }}
                data-testid={`project-card-${project.id}`}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={project.thumbnail} 
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectDuplicate?.(project.id);
                      }}
                      data-testid={`button-duplicate-${project.id}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectDelete?.(project.id);
                      }}
                      data-testid={`button-delete-${project.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium truncate">{project.name}</h4>
                  <p className="text-xs text-muted-foreground">{project.date}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
