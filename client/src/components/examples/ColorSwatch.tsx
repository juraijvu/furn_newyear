import ColorSwatch from '../ColorSwatch';

export default function ColorSwatchExample() {
  return (
    <div className="p-8 flex gap-6">
      <ColorSwatch 
        color={{ id: "ss02", code: "SS02", name: "Hairline S/S", hexColor: "#C0C0C0" }}
        onClick={() => console.log('Color clicked')}
      />
      <ColorSwatch 
        color={{ id: "ss03", code: "SS03", name: "Rose Gold Plating", hexColor: "#B76E79" }}
        isSelected
        onClick={() => console.log('Selected color clicked')}
      />
      <ColorSwatch 
        color={{ id: "pc8", code: "PC8", name: "Coffee", hexColor: "#6F4E37" }}
        size="lg"
        onClick={() => console.log('Large color clicked')}
      />
    </div>
  );
}
