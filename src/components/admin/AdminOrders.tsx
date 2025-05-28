
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Eye, Package, Clock, CheckCircle, XCircle, Plus, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useSupabaseData';
import { useAdminUsers } from '@/hooks/useAdminUsers';

// واجهة الطلب
interface Order {
  id: string;
  user_id: string;
  items: any;
  total: number;
  status: string;
  payment_method: string;
  shipping_address: any;
  notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email?: string;
    phone?: string;
  };
}

// واجهة عنصر الطلب
interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name: string;
}

// واجهة نموذج الطلب الجديد
interface NewOrderForm {
  user_id: string;
  payment_method: string;
  status: string;
  notes: string;
  items: OrderItem[];
  shipping_address: {
    full_name: string;
    phone: string;
    city: string;
    street: string;
    building: string;
    apartment?: string;
    floor?: string;
  };
}

const AdminOrders: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // حالات النموذج الجديد
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  
  // جلب البيانات المطلوبة
  const { data: products = [] } = useProducts();
  const { users, isLoading: usersLoading } = useAdminUsers();

  // Handle filter from dashboard navigation
  useEffect(() => {
    if (location.state?.filterStatus) {
      setStatusFilter(location.state.filterStatus);
    }
  }, [location.state]);
  
  // النموذج الأولي للطلب الجديد
  const initialOrderForm: NewOrderForm = {
    user_id: '',
    payment_method: 'cash',
    status: 'pending',
    notes: '',
    items: [],
    shipping_address: {
      full_name: '',
      phone: '',
      city: '',
      street: '',
      building: '',
      apartment: '',
      floor: ''
    }
  };
  
  const [orderForm, setOrderForm] = useState<NewOrderForm>(initialOrderForm);
  
  // جلب الطلبات من قاعدة البيانات
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setOrders(data || []);
    } catch (err: any) {
      console.error('خطأ في جلب الطلبات:', err);
      setError(err.message);
      toast.error('فشل في جلب الطلبات');
    } finally {
      setIsLoading(false);
    }
  };
  
  // تحديث حالة الطلب
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // تحديث الحالة محلياً
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));
      
      toast.success('تم تحديث حالة الطلب بنجاح');
    } catch (err: any) {
      console.error('خطأ في تحديث حالة الطلب:', err);
      toast.error('فشل في تحديث حالة الطلب');
    }
  };
  
  // إضافة عنصر جديد للطلب
  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      product_id: '',
      quantity: 1,
      price: 0,
      product_name: ''
    };
    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  
  // حذف عنصر من الطلب
  const removeOrderItem = (itemId: string) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };
  
  // تحديث عنصر في الطلب
  const updateOrderItem = (itemId: string, field: keyof OrderItem, value: any) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // إذا تم تغيير المنتج، نحديث الاسم والسعر
          if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id === value);
            if (selectedProduct) {
              updatedItem.product_name = selectedProduct.name;
              updatedItem.price = selectedProduct.price;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };
  
  // حساب المجموع الكلي
  const calculateTotal = () => {
    return orderForm.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // إضافة طلب جديد
  const handleAddOrder = async () => {
    try {
      setIsAddingOrder(true);
      
      // التحقق من صحة البيانات
      if (!orderForm.user_id) {
        toast.error('يرجى اختيار العميل');
        return;
      }
      
      if (orderForm.items.length === 0) {
        toast.error('يرجى إضافة منتج واحد على الأقل');
        return;
      }
      
      if (!orderForm.shipping_address.full_name || !orderForm.shipping_address.phone) {
        toast.error('يرجى إدخال معلومات الشحن الأساسية');
        return;
      }
      
      const total = calculateTotal();
      
      // إنشاء الطلب
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderForm.user_id,
          items: JSON.stringify(orderForm.items),
          total,
          status: orderForm.status,
          payment_method: orderForm.payment_method,
          shipping_address: JSON.stringify(orderForm.shipping_address),
          notes: orderForm.notes || null,
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('خطأ في إنشاء الطلب:', orderError);
        throw orderError;
      }
      
      // إنشاء عناصر الطلب
      const orderItems = orderForm.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('خطأ في إنشاء عناصر الطلب:', itemsError);
        throw itemsError;
      }
      
      toast.success('تم إضافة الطلب بنجاح');
      setShowAddOrder(false);
      setOrderForm(initialOrderForm);
      fetchOrders(); // إعادة جلب الطلبات
      
    } catch (error: any) {
      console.error('خطأ في إضافة الطلب:', error);
      toast.error(error.message || 'فشل في إضافة الطلب');
    } finally {
      setIsAddingOrder(false);
    }
  };
  
  // الحصول على لون الحالة
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
  
  // الحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Package className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  // Filter orders based on status - moved before early returns to maintain hook order
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, []);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('manageOrders')}</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('manageOrders')}</h1>
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">خطأ في تحميل الطلبات</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchOrders}>إعادة المحاولة</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('manageOrders')}</h1>
        <div className="flex gap-2">
          <Dialog open={showAddOrder} onOpenChange={setShowAddOrder}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة طلب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة طلب جديد</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* اختيار العميل */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user_id">العميل *</Label>
                    <Select 
                      value={orderForm.user_id} 
                      onValueChange={(value) => setOrderForm(prev => ({ ...prev, user_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="payment_method">طريقة الدفع</Label>
                    <Select 
                      value={orderForm.payment_method} 
                      onValueChange={(value) => setOrderForm(prev => ({ ...prev, payment_method: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقداً</SelectItem>
                        <SelectItem value="card">بطاقة ائتمان</SelectItem>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* معلومات الشحن */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">معلومات الشحن</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">الاسم الكامل *</Label>
                      <Input
                        id="full_name"
                        value={orderForm.shipping_address.full_name}
                        onChange={(e) => setOrderForm(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, full_name: e.target.value }
                        }))}
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        value={orderForm.shipping_address.phone}
                        onChange={(e) => setOrderForm(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, phone: e.target.value }
                        }))}
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">المدينة</Label>
                      <Input
                        id="city"
                        value={orderForm.shipping_address.city}
                        onChange={(e) => setOrderForm(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, city: e.target.value }
                        }))}
                        placeholder="أدخل المدينة"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="street">الشارع</Label>
                      <Input
                        id="street"
                        value={orderForm.shipping_address.street}
                        onChange={(e) => setOrderForm(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, street: e.target.value }
                        }))}
                        placeholder="أدخل الشارع"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="building">رقم المبنى</Label>
                      <Input
                        id="building"
                        value={orderForm.shipping_address.building}
                        onChange={(e) => setOrderForm(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, building: e.target.value }
                        }))}
                        placeholder="أدخل رقم المبنى"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="apartment">رقم الشقة</Label>
                      <Input
                        id="apartment"
                        value={orderForm.shipping_address.apartment || ''}
                        onChange={(e) => setOrderForm(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, apartment: e.target.value }
                        }))}
                        placeholder="أدخل رقم الشقة (اختياري)"
                      />
                    </div>
                  </div>
                </div>
                
                {/* المنتجات */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">المنتجات</h3>
                    <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة منتج
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {orderForm.items.map((item, index) => (
                      <div key={item.id} className="flex gap-3 items-end p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label>المنتج</Label>
                          <Select 
                            value={item.product_id} 
                            onValueChange={(value) => updateOrderItem(item.id, 'product_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المنتج" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {product.price} ₪
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="w-24">
                          <Label>الكمية</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        
                        <div className="w-24">
                          <Label>السعر</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateOrderItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <Button 
                          type="button" 
                          onClick={() => removeOrderItem(item.id)} 
                          variant="destructive" 
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {orderForm.items.length > 0 && (
                    <div className="text-right mt-3">
                      <p className="text-lg font-semibold">
                        المجموع الكلي: {calculateTotal().toFixed(2)} ₪
                      </p>
                    </div>
                  )}
                </div>
                
                {/* ملاحظات */}
                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="أدخل أي ملاحظات إضافية"
                    rows={3}
                  />
                </div>
                
                {/* أزرار الحفظ */}
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddOrder(false)}
                    disabled={isAddingOrder}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddOrder}
                    disabled={isAddingOrder}
                  >
                    {isAddingOrder ? 'جاري الإضافة...' : 'إضافة الطلب'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={fetchOrders} variant="outline">
            تحديث
          </Button>
        </div>
      </div>
      
      {/* Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Label htmlFor="status-filter">فلترة حسب الحالة:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطلبات</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="processing">قيد المعالجة</SelectItem>
                <SelectItem value="shipped">تم الشحن</SelectItem>
                <SelectItem value="delivered">تم التسليم</SelectItem>
                <SelectItem value="cancelled">ملغية</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              عرض {filteredOrders.length} من {orders.length} طلب
            </div>
          </div>
        </CardContent>
      </Card>
      
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === 'all' ? t('noOrders') : `لا توجد طلبات ${statusFilter === 'pending' ? 'في الانتظار' : statusFilter === 'processing' ? 'قيد المعالجة' : statusFilter === 'shipped' ? 'مشحونة' : statusFilter === 'delivered' ? 'مسلمة' : 'ملغية'}`}
              </h3>
              <p className="text-gray-500">{statusFilter === 'all' ? t('ordersWillAppearHere') : 'جرب تغيير الفلتر لعرض طلبات أخرى'}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">طلب #{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      العميل: {order.profiles?.full_name || 'غير محدد'}
                    </p>
                    <p className="text-sm text-gray-600">
                      التاريخ: {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="mr-1">
                        {order.status === 'pending' && 'في الانتظار'}
                        {order.status === 'processing' && 'قيد المعالجة'}
                        {order.status === 'shipped' && 'تم الشحن'}
                        {order.status === 'delivered' && 'تم التسليم'}
                        {order.status === 'cancelled' && 'ملغي'}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">تفاصيل الطلب:</h4>
                    <p className="text-sm text-gray-600">المجموع: {order.total} ₪</p>
                    <p className="text-sm text-gray-600">طريقة الدفع: {order.payment_method}</p>
                    {order.notes && (
                      <p className="text-sm text-gray-600">ملاحظات: {order.notes}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">معلومات الاتصال:</h4>
                    <p className="text-sm text-gray-600">الهاتف: {order.profiles?.phone || 'غير محدد'}</p>
                    <p className="text-sm text-gray-600">الإيميل: {order.profiles?.email || 'غير محدد'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateOrderStatus(order.id, 'pending')}
                    disabled={order.status === 'pending'}
                  >
                    في الانتظار
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateOrderStatus(order.id, 'processing')}
                    disabled={order.status === 'processing'}
                  >
                    قيد المعالجة
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                    disabled={order.status === 'shipped' || order.status === 'delivered'}
                  >
                    تم الشحن
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    disabled={order.status === 'delivered'}
                  >
                    تم التسليم
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    disabled={order.status === 'cancelled' || order.status === 'delivered'}
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
