
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

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    nameHe: '',
    icon: '',
    image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement category creation
    console.log('Category data:', formData);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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

          <div>
            <Label htmlFor="image">{t('categoryImage')} URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
