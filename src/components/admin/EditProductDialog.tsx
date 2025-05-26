
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import ProductNameFields from './ProductNameFields';
import ProductDescriptionFields from './ProductDescriptionFields';
import ProductPricingFields from './ProductPricingFields';
import ProductCategoryField from './ProductCategoryField';
import ProductToggleFields from './ProductToggleFields';
import { Product, Category, ProductFormData } from '@/types/product';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  categories: Category[];
  onSuccess: () => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name_ar: '',
    name_en: '',
    name_he: '',
    description_ar: '',
    description_en: '',
    description_he: '',
    price: 0,
    original_price: 0,
    wholesale_price: 0,
    image: '',
    category_id: '',
    in_stock: true,
    discount: 0,
    featured: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name_ar: product.name_ar || '',
        name_en: product.name_en || '',
        name_he: product.name_he || '',
        description_ar: product.description_ar || '',
        description_en: product.description_en || '',
        description_he: product.description_he || '',
        price: Number(product.price) || 0,
        original_price: Number(product.original_price) || 0,
        wholesale_price: Number(product.wholesale_price) || 0,
        image: product.image || '',
        category_id: product.category_id || '',
        in_stock: product.in_stock || false,
        discount: Number(product.discount) || 0,
        featured: product.featured || false,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name_ar: formData.name_ar,
          name_en: formData.name_en,
          name_he: formData.name_he,
          description_ar: formData.description_ar,
          description_en: formData.description_en,
          description_he: formData.description_he,
          price: formData.price,
          original_price: formData.original_price || null,
          wholesale_price: formData.wholesale_price || null,
          image: formData.image,
          category_id: formData.category_id,
          in_stock: formData.in_stock,
          discount: formData.discount || null,
          featured: formData.featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: t('productUpdated'),
        description: t('productUpdatedSuccessfully'),
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: t('error'),
        description: t('errorUpdatingProduct'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editProduct')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ProductNameFields formData={formData} setFormData={setFormData} />
          
          <ProductDescriptionFields formData={formData} setFormData={setFormData} />

          <ImageUpload
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            bucket="product-images"
            label={t('productImage')}
          />

          <ProductCategoryField 
            formData={formData} 
            setFormData={setFormData} 
            categories={categories} 
          />

          <ProductPricingFields formData={formData} setFormData={setFormData} />

          <ProductToggleFields formData={formData} setFormData={setFormData} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('updating') : t('updateProduct')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
