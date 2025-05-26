
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, X, Image, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string | string[];
  onChange: (url: string | string[]) => void;
  bucket: 'product-images' | 'category-images';
  label: string;
  placeholder?: string;
  multiple?: boolean;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  bucket,
  label,
  placeholder = "https://example.com/image.jpg",
  multiple = false,
  maxImages = 5
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحويل القيمة إلى مصفوفة للتعامل مع الصور المتعددة
  const images = multiple 
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (Array.isArray(value) ? (value[0] || '') : (value || ''));

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // التحقق من عدد الصور إذا كان مخصص للصور المتعددة
    if (multiple && Array.isArray(images)) {
      const totalImages = images.length + files.length;
      if (totalImages > maxImages) {
        toast.error(`يمكنك رفع ${maxImages} صور كحد أقصى`);
        return;
      }
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('يرجى اختيار ملفات صور صالحة فقط');
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`حجم الملف ${file.name} كبير جداً. الحد الأقصى 5 ميجابايت`);
          continue;
        }

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

        uploadedUrls.push(data.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        if (multiple) {
          const currentImages = Array.isArray(images) ? images : [];
          onChange([...currentImages, ...uploadedUrls]);
        } else {
          onChange(uploadedUrls[0]);
        }
        toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('حدث خطأ أثناء رفع الصور');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      if (multiple) {
        const currentImages = Array.isArray(images) ? images : [];
        if (currentImages.length >= maxImages) {
          toast.error(`يمكنك إضافة ${maxImages} صور كحد أقصى`);
          return;
        }
        onChange([...currentImages, urlInput.trim()]);
      } else {
        onChange(urlInput.trim());
      }
      setUrlInput('');
      toast.success('تم إضافة رابط الصورة');
    }
  };

  const removeImage = (index: number) => {
    if (multiple && Array.isArray(images)) {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } else {
      onChange(multiple ? [] : '');
    }
  };

  const clearAllImages = () => {
    onChange(multiple ? [] : '');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {multiple && Array.isArray(images) && images.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAllImages}
            className="text-red-600 hover:text-red-700"
          >
            مسح جميع الصور
          </Button>
        )}
      </div>
      
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
              multiple={multiple}
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
                {multiple ? 'اضغط لاختيار صور أو اسحبها هنا' : 'اضغط لاختيار صورة أو اسحبها هنا'}
              </span>
              <span className="text-xs text-gray-400">
                PNG, JPG, GIF حتى 5MB {multiple ? `(${maxImages} صور كحد أقصى)` : ''}
              </span>
            </label>
          </div>
          {isUploading && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">جاري رفع الصور...</span>
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
              disabled={!urlInput.trim() || (multiple && Array.isArray(images) && images.length >= maxImages)}
            >
              إضافة
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* عرض الصور */}
      {multiple && Array.isArray(images) && images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`صورة ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                  رئيسية
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* عرض الصورة الواحدة */}
      {!multiple && images && (
        <div className="relative inline-block">
          <img
            src={images as string}
            alt="معاينة"
            className="w-24 h-24 object-cover rounded-lg border"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => removeImage(0)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
