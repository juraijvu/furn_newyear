import { useState } from 'react';
import CanvasWorkspace from '../CanvasWorkspace';
import sofaImage from '@assets/generated_images/Modern_grey_sofa_furniture_4bccca05.png';

export default function CanvasWorkspaceExample() {
  const [hasSelection, setHasSelection] = useState(false);

  return (
    <div className="h-[700px] w-full max-w-4xl border rounded-lg overflow-hidden">
      <CanvasWorkspace 
        imageUrl={sofaImage}
        selectedColor="#B76E79"
        onSelectionChange={(selection) => {
          setHasSelection(selection);
          console.log('Selection changed:', selection);
        }}
      />
    </div>
  );
}
