
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/hooks/useSupabaseData';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFormData } from '@/types/product';

interface ProductCategoryFieldProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

const ProductCategoryField: React.FC<ProductCategoryFieldProps> = ({
  formData,
  setFormData,
}) => {
  const { t } = useLanguage();
  const { data: categories = [], isLoading, error } = useCategories();

  console.log('ProductCategoryField - categories:', categories);
  console.log('ProductCategoryField - loading:', isLoading);
  console.log('ProductCategoryField - error:', error);

  if (isLoading) {
    return (
      <div>
        <Label htmlFor="category">{t('category')}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="جاري التحميل..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Label htmlFor="category">{t('category')}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="خطأ في تحميل الفئات" />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="category">{t('category')}</Label>
      <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
        <SelectTrigger>
          <SelectValue placeholder={t('selectCategory')} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductCategoryField;
