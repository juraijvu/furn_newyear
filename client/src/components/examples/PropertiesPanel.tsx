import PropertiesPanel from '../PropertiesPanel';

export default function PropertiesPanelExample() {
  const selectedColor = {
    id: "ss03",
    code: "SS03",
    name: "Rose Gold Plating",
    hexColor: "#B76E79"
  };

  return (
    <div className="h-[700px] w-80 border rounded-lg bg-card">
      <PropertiesPanel 
        selectedColor={selectedColor}
        onDownload={() => console.log('Download clicked')}
        onSave={() => console.log('Save clicked')}
      />
    </div>
  );
}
