import React, { useState } from 'react';
import { useLanguage } from '../../utils/languageContextUtils';
import { useProducts, useCategories } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AdminProductsHeader from './AdminProductsHeader';
import AdminProductsEmptyState from './AdminProductsEmptyState';
import AdminProductsTable from './AdminProductsTable';
import AdminProductsDialogs from './AdminProductsDialogs';
import { Product, ProductFormData, AdminProductForm } from '@/types/product';
import { mapCategoryToProductCategory } from '@/types/index';

const AdminProducts: React.FC = () => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProductForm | null>(null);
  const { data: productsData, loading: productsLoading, refetch } = useProducts();
  const products = productsData && Array.isArray(productsData.data) ? productsData.data : [];
  const { data: categoriesData } = useCategories();
  const categories = categoriesData && Array.isArray(categoriesData.data) ? categoriesData.data : [];
  // تحويل قائمة الفئات إلى النوع الصحيح قبل تمريرها للمكونات الفرعية
  const productCategories = categories.map(mapCategoryToProductCategory);

  const mapProductToFormData = (product: Product): AdminProductForm => ({
    id: product.id,
    name_ar: product.name || '',
    name_en: product.nameEn || '',
    name_he: '', // Map if available
    description_ar: product.description || '',
    description_en: product.descriptionEn || '',
    description_he: '', // Map if available
    price: product.price,
    original_price: product.originalPrice || 0,
    wholesale_price: product.wholesalePrice || 0,
    category_id: product.category,
    category: product.category,
    image: product.image,
    images: product.images || [],
    in_stock: product.inStock,
    stock_quantity: product.stock_quantity || 0,
    featured: product.featured || false,
    active: product.active ?? true,
    discount: product.discount || 0,
    tags: product.tags || [],
  });

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: t('productDeleted'),
        description: `${t('productDeletedSuccessfully')} ${productName}`,
      });

      refetch();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: t('error'),
        description: t('errorDeletingProduct'),
      });
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(mapProductToFormData(product));
    setShowViewDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(mapProductToFormData(product));
    setShowEditDialog(true);
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminProductsHeader
        productCount={products.length}
        onAddProduct={() => setShowAddDialog(true)}
      />

      {products.length === 0 ? (
        <AdminProductsEmptyState onAddProduct={() => setShowAddDialog(true)} />
      ) : (
        <AdminProductsTable
          products={products}
          onViewProduct={handleViewProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      <AdminProductsDialogs
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        showViewDialog={showViewDialog}
        setShowViewDialog={setShowViewDialog}
        selectedProduct={selectedProduct}
        categories={productCategories}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default AdminProducts;
