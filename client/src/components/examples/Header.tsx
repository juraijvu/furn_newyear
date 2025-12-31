import { useState } from 'react';
import Header from '../Header';

export default function HeaderExample() {
  const [projectName, setProjectName] = useState("Modern Sofa Redesign");

  return (
    <div>
      <Header 
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onOpenGallery={() => console.log('Open gallery clicked')}
      />
    </div>
  );
}
