
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import ImageUpload from '@/components/ImageUpload';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
  onSuccess: () => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ open, onOpenChange, categories, onSuccess }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error('يرجى إضافة صورة للمنتج');
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert([
          {
            name_ar: formData.nameAr,
            name_en: formData.nameEn,
            name_he: formData.nameHe,
            description_ar: formData.descriptionAr,
            description_en: formData.descriptionEn,
            description_he: formData.descriptionHe,
            price: Number(formData.price),
            wholesale_price: formData.wholesalePrice ? Number(formData.wholesalePrice) : null,
            original_price: formData.originalPrice ? Number(formData.originalPrice) : null,
            category_id: formData.categoryId,
            image: formData.image,
            stock_quantity: formData.stockQuantity ? Number(formData.stockQuantity) : 0,
            in_stock: formData.inStock,
            active: true
          }
        ]);

      if (error) throw error;

      toast.success(t('productAddedSuccessfully'));
      
      // Reset form
      setFormData({
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
      
      // Refresh products data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess();
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(t('errorAddingProduct'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (url: string | string[]) => {
    const imageUrl = Array.isArray(url) ? url[0] || '' : url;
    handleInputChange('image', imageUrl);
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
                  <SelectValue placeholder={t('selectCategory')} />
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

          <ImageUpload
            value={formData.image}
            onChange={handleImageChange}
            bucket="product-images"
            label={t('productImage')}
            placeholder="https://example.com/product-image.jpg"
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

export default AddProductDialog;
