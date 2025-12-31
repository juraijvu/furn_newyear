import { useState } from 'react';
import ColorPalette from '../ColorPalette';
import type { ColorItem } from '@/data/colorPalette';

export default function ColorPaletteExample() {
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);
  
  const recentColors: ColorItem[] = [
    { id: "ss02", code: "SS02", name: "Hairline S/S", hexColor: "#C0C0C0" },
    { id: "pc8", code: "PC8", name: "Coffee", hexColor: "#6F4E37" },
    { id: "sq1", code: "SQ1", name: "Black Walnut", hexColor: "#3A2F2F" },
  ];

  return (
    <div className="h-[600px] w-80 border rounded-lg bg-card">
      <ColorPalette 
        selectedColor={selectedColor}
        onColorSelect={(color) => {
          setSelectedColor(color);
          console.log('Selected color:', color);
        }}
        recentColors={recentColors}
      />
    </div>
  );
}
