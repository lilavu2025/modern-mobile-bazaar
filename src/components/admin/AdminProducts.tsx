
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts, useCategories } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AdminProductsHeader from './AdminProductsHeader';
import AdminProductsEmptyState from './AdminProductsEmptyState';
import AdminProductsTable from './AdminProductsTable';
import AdminProductsDialogs from './AdminProductsDialogs';

const AdminProducts: React.FC = () => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { data: products = [], isLoading: productsLoading, refetch } = useProducts();
  const { data: categories = [] } = useCategories();

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
        variant: 'destructive',
      });
    }
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
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
        categories={categories}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default AdminProducts;
