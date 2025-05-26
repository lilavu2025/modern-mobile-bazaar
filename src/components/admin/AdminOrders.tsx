
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('manageOrders')}</h1>
      
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOrders')}</h3>
            <p className="text-gray-500">{t('ordersWillAppearHere')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
