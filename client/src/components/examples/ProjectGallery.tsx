import { useState } from 'react';
import ProjectGallery from '../ProjectGallery';
import { Button } from '@/components/ui/button';
import sofaImage from '@assets/generated_images/Modern_grey_sofa_furniture_4bccca05.png';
import chairImage from '@assets/generated_images/Beige_dining_chair_c4cca64b.png';
import officeChairImage from '@assets/generated_images/Brown_office_chair_3fdc19ca.png';

export default function ProjectGalleryExample() {
  const [open, setOpen] = useState(false);

  const mockProjects = [
    { id: '1', name: 'Modern Grey Sofa', thumbnail: sofaImage, date: 'Nov 1, 2025' },
    { id: '2', name: 'Beige Dining Chair', thumbnail: chairImage, date: 'Oct 30, 2025' },
    { id: '3', name: 'Office Chair Design', thumbnail: officeChairImage, date: 'Oct 28, 2025' },
  ];

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)} data-testid="button-open-gallery-example">
        Open Gallery
      </Button>
      <ProjectGallery 
        open={open}
        onOpenChange={setOpen}
        projects={mockProjects}
        onProjectSelect={(project) => console.log('Selected:', project)}
        onProjectDelete={(id) => console.log('Delete:', id)}
        onProjectDuplicate={(id) => console.log('Duplicate:', id)}
      />
    </div>
  );
}
