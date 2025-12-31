import UploadZone from '../UploadZone';

export default function UploadZoneExample() {
  return (
    <div className="p-8 max-w-2xl">
      <UploadZone 
        onImageUpload={(file) => {
          console.log('File uploaded:', file.name);
        }}
      />
    </div>
  );
}
