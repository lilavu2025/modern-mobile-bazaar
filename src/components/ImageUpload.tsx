
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string | string[];
  onChange: (url: string | string[]) => void;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  maxImages?: number;
  bucket?: string;
}

const ImageUpload = ({ 
  value, 
  onChange, 
  label = "Image", 
  placeholder = "Upload image", 
  multiple = false,
  maxImages = 5,
  bucket = "product-images"
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : [];
        const filesToUpload = Array.from(files).slice(0, maxImages - currentUrls.length);
        
        const uploadPromises = filesToUpload.map(file => uploadImage(file));
        const newUrls = await Promise.all(uploadPromises);
        
        onChange([...currentUrls, ...newUrls]);
        toast.success(`${newUrls.length} image(s) uploaded successfully`);
      } else {
        const url = await uploadImage(files[0]);
        onChange(url);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexOrUrl: number | string) => {
    if (multiple && Array.isArray(value)) {
      const newUrls = typeof indexOrUrl === 'number' 
        ? value.filter((_, i) => i !== indexOrUrl)
        : value.filter(url => url !== indexOrUrl);
      onChange(newUrls);
    } else {
      onChange('');
    }
  };

  const renderImagePreview = () => {
    if (multiple && Array.isArray(value)) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      );
    } else if (typeof value === 'string' && value) {
      return (
        <div className="relative group inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-24 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeImage(value)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }
    return null;
  };

  const canAddMore = multiple 
    ? Array.isArray(value) ? value.length < maxImages : true
    : !value;

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {renderImagePreview()}
      
      {canAddMore && (
        <div className="flex gap-2">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple={multiple}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : placeholder}
          </Button>
        </div>
      )}
      
      {multiple && Array.isArray(value) && (
        <p className="text-sm text-gray-500">
          {value.length} / {maxImages} images uploaded
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
