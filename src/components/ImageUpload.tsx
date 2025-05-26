
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
  placeholder?: string;
}

const ImageUpload = ({ 
  value, 
  onChange, 
  multiple = false, 
  label = 'Image', 
  placeholder = 'Enter image URL' 
}: ImageUploadProps) => {
  const { t } = useLanguage();
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleSingleImageChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleMultipleImageAdd = () => {
    if (!newImageUrl.trim()) return;
    
    const currentImages = Array.isArray(value) ? value : [];
    onChange([...currentImages, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleMultipleImageRemove = (index: number) => {
    if (!Array.isArray(value)) return;
    
    const updatedImages = value.filter((_, i) => i !== index);
    onChange(updatedImages);
  };

  if (multiple) {
    const images = Array.isArray(value) ? value : [];
    
    return (
      <div className="space-y-4">
        <Label>{label}</Label>
        
        {/* Display existing images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleMultipleImageRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new image */}
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder={placeholder}
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleMultipleImageAdd();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleMultipleImageAdd}
            disabled={!newImageUrl.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Single image upload
  const imageUrl = typeof value === 'string' ? value : '';
  
  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {imageUrl && (
        <div className="relative w-32 h-32">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg border"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => handleSingleImageChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <Input
        type="url"
        placeholder={placeholder}
        value={imageUrl}
        onChange={(e) => handleSingleImageChange(e.target.value)}
      />
    </div>
  );
};

export default ImageUpload;
