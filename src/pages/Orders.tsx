
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS, he } from 'date-fns/locale';
import { Package, Eye } from 'lucide-react';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const dateLocales = { ar, en: enUS, he };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearchChange={() => {}}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('orders')}</h1>
          <p className="text-gray-600">
            {t('trackYourOrders')}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOrders')}</h3>
            <p className="text-gray-500 mb-6">{t('noOrdersDescription')}</p>
            <Button asChild>
              <a href="/products">{t('startShopping')}</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {t('orderNumber')}: #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(order.created_at), {
                          addSuffix: true,
                          locale: dateLocales[language]
                        })}
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge className={getStatusColor(order.status)}>
                        {t(order.status)}
                      </Badge>
                      <p className="text-lg font-bold mt-1">
                        {order.total} {t('currency')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.products?.image}
                          alt={item.products?.[`name_${language}`]}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {item.products?.[`name_${language}`]}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {t('quantity')}: {item.quantity} × {item.price} {t('currency')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <p>{t('paymentMethod')}: {t(order.payment_method)}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      {t('viewDetails')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Orders;
