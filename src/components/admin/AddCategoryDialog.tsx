
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import ImageUpload from '@/components/ImageUpload';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    nameHe: '',
    icon: '',
    image: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error('يرجى إضافة صورة للفئة');
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('categories')
        .insert([
          {
            name_ar: formData.nameAr,
            name_en: formData.nameEn,
            name_he: formData.nameHe,
            icon: formData.icon || '📦',
            image: formData.image,
            active: true
          }
        ]);

      if (error) throw error;

      toast.success(t('categoryAddedSuccessfully'));
      
      // Reset form
      setFormData({
        nameAr: '',
        nameEn: '',
        nameHe: '',
        icon: '',
        image: ''
      });
      
      // Refresh categories data
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess();
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(t('errorAddingCategory'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addCategory')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="nameAr">{t('categoryName')} (العربية)</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => handleInputChange('nameAr', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="nameEn">{t('categoryName')} (English)</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => handleInputChange('nameEn', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="nameHe">{t('categoryName')} (עברית)</Label>
              <Input
                id="nameHe"
                value={formData.nameHe}
                onChange={(e) => handleInputChange('nameHe', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="icon">{t('categoryIcon')} (Emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              placeholder="🛍️"
              maxLength={2}
            />
          </div>

          <ImageUpload
            value={formData.image}
            onChange={(url) => handleInputChange('image', url)}
            bucket="category-images"
            label={t('categoryImage')}
            placeholder="https://example.com/category-image.jpg"
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !formData.image}>
              {isLoading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
