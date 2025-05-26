
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ open, onOpenChange, categories }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    nameHe: '',
    descriptionAr: '',
    descriptionEn: '',
    descriptionHe: '',
    price: '',
    wholesalePrice: '',
    originalPrice: '',
    categoryId: '',
    image: '',
    stockQuantity: '',
    inStock: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement product creation
    console.log('Product data:', formData);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addProduct')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nameAr">{t('productName')} (العربية)</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => handleInputChange('nameAr', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="nameEn">{t('productName')} (English)</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => handleInputChange('nameEn', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="nameHe">{t('productName')} (עברית)</Label>
              <Input
                id="nameHe"
                value={formData.nameHe}
                onChange={(e) => handleInputChange('nameHe', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="descriptionAr">{t('productDescription')} (العربية)</Label>
              <Textarea
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="descriptionEn">{t('productDescription')} (English)</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="descriptionHe">{t('productDescription')} (עברית)</Label>
              <Textarea
                id="descriptionHe"
                value={formData.descriptionHe}
                onChange={(e) => handleInputChange('descriptionHe', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">{t('retailPrice')}</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="wholesalePrice">{t('wholesalePrice')}</Label>
              <Input
                id="wholesalePrice"
                type="number"
                value={formData.wholesalePrice}
                onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">{t('originalPrice')}</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">{t('category')}</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('category')} />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stockQuantity">{t('stockQuantity')}</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image">{t('productImage')} URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
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

export default AddProductDialog;
