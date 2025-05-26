
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts, useCategories } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Edit,
  Trash,
  Eye,
  Package
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AddProductDialog from './AddProductDialog';

const AdminProducts: React.FC = () => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('manageProducts')}</h1>
          <p className="text-gray-600 mt-1">
            {products.length} {t('products')}
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addProduct')}
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noProducts')}</h3>
              <p className="text-gray-500 mb-6">{t('addYourFirstProduct')}</p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('addProduct')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('products')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('productImage')}</TableHead>
                  <TableHead>{t('productName')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead>{t('stockQuantity')}</TableHead>
                  <TableHead>{t('inStock')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price} {t('currency')}</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>
                      <Badge variant={product.inStock ? 'default' : 'destructive'}>
                        {product.inStock ? t('inStock') : t('outOfStock')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AddProductDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        categories={categories}
      />
    </div>
  );
};

export default AdminProducts;
