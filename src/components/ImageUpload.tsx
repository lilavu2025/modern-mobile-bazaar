
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, X, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: 'product-images' | 'category-images';
  label: string;
  placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  bucket,
  label,
  placeholder = "https://example.com/image.jpg"
}) => {
  const [urlInput, setUrlInput] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      toast.success('تم تحديث رابط الصورة');
    }
  };

  const clearImage = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            رفع من الجهاز
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <Link className="h-4 w-4" />
            رابط الصورة
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id={`file-upload-${bucket}`}
            />
            <label
              htmlFor={`file-upload-${bucket}`}
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <span className="text-sm text-gray-600">
                اضغط لاختيار صورة أو اسحبها هنا
              </span>
              <span className="text-xs text-gray-400">
                PNG, JPG, GIF حتى 5MB
              </span>
            </label>
          </div>
          {isUploading && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">جاري رفع الصورة...</span>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder={placeholder}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
            >
              تطبيق
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
