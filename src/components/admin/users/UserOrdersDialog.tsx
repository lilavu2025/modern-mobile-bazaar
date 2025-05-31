import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Eye, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../../../utils/languageContextUtils';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  user_type: 'admin' | 'wholesale' | 'retail';
  created_at: string;
  email?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
}

interface ShippingAddress {
  full_name: string;
  street: string;
  area: string;
  city: string;
  [key: string]: unknown;
}

interface Order {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  shipping_address: ShippingAddress;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    products: {
      name_ar: string;
      name_en: string;
      image: string;
    };
  }>;
}

interface UserOrdersDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserOrdersDialog: React.FC<UserOrdersDialogProps> = ({ user, open, onOpenChange }) => {
  const { isRTL } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name_ar,
              name_en,
              image
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Map shipping_address from JSON to ShippingAddress
      return (data || []).map((order: Record<string, unknown>) => ({
        ...order,
        shipping_address: typeof order.shipping_address === 'string'
          ? mapShippingAddressFromDb(JSON.parse(order.shipping_address as string))
          : mapShippingAddressFromDb(order.shipping_address as Record<string, unknown>),
      })) as Order[];
    },
    enabled: open,
  });

  // Helper: Convert snake_case to camelCase for ShippingAddress
  function mapShippingAddressFromDb(dbAddress: Record<string, unknown>): ShippingAddress {
    return {
      full_name: dbAddress['full_name'] as string,
      street: dbAddress['street'] as string,
      area: dbAddress['area'] as string,
      city: dbAddress['city'] as string,
      // Add more fields if needed
    };
  }

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'processing': return 'قيد المعالجة';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'card': return 'بطاقة';
      case 'transfer': return 'حوالة';
      default: return method;
    }
  };

  if (selectedOrder) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                تفاصيل الطلبية #{selectedOrder.id.slice(0, 8)}
              </DialogTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedOrder(null)}
              >
                العودة للطلبيات
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">معلومات الطلبية</h3>
                    <p className="text-sm text-gray-600">
                      تاريخ الطلبية: {format(new Date(selectedOrder.created_at), 'PPp')}
                    </p>
                  </div>
                  <div className="text-left">
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                    <p className="text-lg font-bold mt-2">
                      {selectedOrder.total} ش.ج
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">طريقة الدفع:</span>
                    <span className="text-sm">{getPaymentMethodText(selectedOrder.payment_method)}</span>
                  </div>
                  
                  {selectedOrder.shipping_address && (
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm text-gray-600">عنوان الشحن:</span>
                        <div className="text-sm">
                          {selectedOrder.shipping_address.full_name}<br />
                          {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.area}<br />
                          {selectedOrder.shipping_address.city}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">عناصر الطلبية</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedOrder.order_items?.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-4">
                        <img
                          src={item.products?.image || '/placeholder.svg'}
                          alt={item.products?.name_ar}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.products?.name_ar}</h4>
                          <p className="text-sm text-gray-600">
                            الكمية: {item.quantity} × {item.price} ش.ج
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">
                            {(item.quantity * Number(item.price)).toFixed(2)} ش.ج
                          </p>
                        </div>
                      </div>
                      {index < selectedOrder.order_items.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            طلبيات المستخدم: {user.full_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">جاري تحميل الطلبيات...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبيات</h3>
              <p className="text-gray-500">لم يقم هذا المستخدم بأي طلبيات بعد</p>
            </div>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h4 className="font-medium">
                          طلبية #{order.id.slice(0, 8)}
                        </h4>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(order.created_at), 'PPp')}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {getPaymentMethodText(order.payment_method)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.order_items?.length || 0} عنصر
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <p className="text-lg font-bold mb-2">
                        {order.total} ش.ج
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedOrder(order)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserOrdersDialog;
