
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

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  name_he: string;
  description_ar: string;
  description_en: string;
  description_he: string;
  price: number;
  original_price?: number;
  wholesale_price?: number;
  image: string;
  images?: string[];
  category_id: string;
  in_stock: boolean;
  discount?: number;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  icon: string;
  count: number;
}

interface ProductFormData {
  name_ar: string;
  name_en: string;
  name_he: string;
  description_ar: string;
  description_en: string;
  description_he: string;
  price: number;
  original_price: number;
  wholesale_price: number;
  image: string;
  images: string[];
  category_id: string;
  in_stock: boolean;
  discount: number;
  featured: boolean;
  active: boolean;
  tags: string[];
  stock_quantity: number;
}

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
    images: [],
    category_id: '',
    in_stock: true,
    discount: 0,
    featured: false,
    active: true,
    tags: [],
    stock_quantity: 0,
  });

  useEffect(() => {
    if (product) {
      // تحضير الصور - التأكد من أن الصورة الرئيسية موجودة في مصفوفة الصور
      const productImages = product.images && Array.isArray(product.images) ? product.images : [];
      const allImages = productImages.length > 0 ? productImages : [product.image].filter(img => img);

      setFormData({
        name_ar: product.name_ar || '',
        name_en: product.name_en || '',
        name_he: product.name_he || '',
        description_ar: product.description_ar || '',
        description_en: product.description_en || '',
        description_he: product.description_he || '',
        price: product.price || 0,
        original_price: product.original_price || 0,
        wholesale_price: product.wholesale_price || 0,
        image: product.image || '',
        images: product.images || [product.image].filter(Boolean),
        category_id: product.category_id || '',
        in_stock: product.in_stock || false,
        discount: product.discount || 0,
        featured: product.featured || false,
        active: true,
        tags: [],
        stock_quantity: (product as any).stock_quantity || 0,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // التأكد من أن الصورة الرئيسية هي أول صورة في المصفوفة
      const finalImages = formData.images.length > 0 ? formData.images : [formData.image].filter(img => img);
      const mainImage = finalImages[0] || formData.image;

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
          image: mainImage,
          images: finalImages,
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

  const handleImagesChange = (images: string | string[]) => {
    const imageArray = Array.isArray(images) ? images : [images].filter(img => img);
    setFormData(prev => ({
      ...prev,
      images: imageArray,
      image: imageArray[0] || prev.image // تحديث الصورة الرئيسية
    }));
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
            value={formData.images}
            onChange={handleImagesChange}
            bucket="product-images"
            label="صور المنتج"
            multiple={true}
            maxImages={5}
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
