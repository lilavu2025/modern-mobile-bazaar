
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, ProductFormData } from '@/types/product';

interface ProductCategoryFieldProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  categories: Category[];
}

const ProductCategoryField: React.FC<ProductCategoryFieldProps> = ({
  formData,
  setFormData,
  categories,
}) => {
  const { t } = useLanguage();

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
              {category.name} - {category.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductCategoryField;
