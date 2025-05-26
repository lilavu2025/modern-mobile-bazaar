
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Edit,
  Trash,
  Eye,
  FolderOpen
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AddCategoryDialog from './AddCategoryDialog';

const AdminCategories: React.FC = () => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">{t('manageCategories')}</h1>
          <p className="text-gray-600 mt-1">
            {categories.length} {t('categories')}
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addCategory')}
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noCategories')}</h3>
              <p className="text-gray-500 mb-6">{t('addYourFirstCategory')}</p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('addCategory')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('categories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('categoryImage')}</TableHead>
                  <TableHead>{t('categoryName')}</TableHead>
                  <TableHead>{t('categoryIcon')}</TableHead>
                  <TableHead>عدد المنتجات</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <span className="text-2xl">{category.icon}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category.count}</Badge>
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

      <AddCategoryDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default AdminCategories;
