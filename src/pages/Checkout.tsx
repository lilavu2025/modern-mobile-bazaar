// صفحة الدفع والشراء - تتيح للمستخدم إتمام عملية الشراء
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useLanguage } from '@/utils/languageContextUtils';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, CreditCard, Banknote, ArrowLeft } from 'lucide-react';
import { Product } from '@/types';

// واجهة بيانات الشراء المباشر
interface DirectBuyState {
  directBuy?: boolean;
  product?: Product;
  quantity?: number;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: t('error'),
        description: t('pleaseLoginToCheckout') || 'Please login to proceed with checkout',
      });
      navigate('/auth', { replace: true });
    }
  }, [user, navigate, toast, t]);

  // الحصول على بيانات الشراء المباشر من التنقل
  const directBuyState = location.state as DirectBuyState;
  const isDirectBuy = directBuyState?.directBuy || false;
  const directProduct = directBuyState?.product;
  const directQuantity = directBuyState?.quantity || 1;

  // حالات المكون
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    city: '',
    area: '',
    street: '',
    building: '',
    floor: '',
    apartment: '',
  });
  const [notes, setNotes] = useState('');

  // تحديد العناصر المراد شراؤها (من السلة أو الشراء المباشر)
  const itemsToCheckout = isDirectBuy && directProduct 
    ? [{ product: directProduct, quantity: directQuantity }]
    : cartItems;

  // حساب السعر الإجمالي
  const totalPrice = isDirectBuy && directProduct
    ? directProduct.price * directQuantity
    : getTotalPrice();

  // وظيفة إتمام الطلب
  const handlePlaceOrder = async () => {
    // التحقق من تسجيل الدخول
    if (!user) {
      toast({
        title: t('error'),
        description: t('pleaseLogin'),
      });
      return;
    }

    // التحقق من وجود عناصر للشراء
    if (itemsToCheckout.length === 0) {
      toast({
        title: t('error'),
        description: t('cartIsEmpty'),
      });
      return;
    }

    // التحقق من صحة عنوان الشحن
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city || 
        !shippingAddress.area || !shippingAddress.street || !shippingAddress.building) {
      toast({
        title: t('error'),
        description: t('fillRequiredFields'),
      });
      return;
    }

    setIsLoading(true);

    try {
      // إنشاء الطلب في قاعدة البيانات
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: totalPrice,
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          notes: notes || null,
          status: 'pending', // حالة الطلب: في الانتظار
        })
        .select()
        .single();

      if (orderError) {
        console.error('خطأ في إنشاء الطلب:', orderError);
        throw orderError;
      }

      // إنشاء عناصر الطلب
      const orderItems = itemsToCheckout.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('خطأ في إنشاء عناصر الطلب:', itemsError);
        throw itemsError;
      }

      // مسح السلة والتوجه لصفحة الطلبات (فقط إذا لم يكن شراء مباشر)
      if (!isDirectBuy) {
        clearCart();
      }
      
      toast({
        title: t('success'),
        description: t('orderPlaced'),
      });

      // التوجه لصفحة الطلبات
      navigate('/orders');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: t('error'),
        description: err.message || t('errorPlacingOrder'),
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // وظيفة العودة للصفحة السابقة
  const handleGoBack = () => {
    if (isDirectBuy) {
      navigate(-1); // العودة للصفحة السابقة
    } else {
      navigate('/cart'); // العودة للسلة
    }
  };

  // عرض رسالة السلة الفارغة (فقط إذا لم يكن شراء مباشر)
  if (!isDirectBuy && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onSearchChange={() => {}}
          onCartClick={() => {}}
          onMenuClick={() => {}}
        />
        
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cartIsEmpty')}</h2>
            <p className="text-gray-600 mb-6">{t('addItemsToCheckout')}</p>
            <Button onClick={() => navigate('/products')}>
              {t('continueShopping')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearchChange={() => {}}
        onCartClick={() => {}}
        onMenuClick={() => {}}
      />

      <div className="container mx-auto px-4 py-6">
        {/* رأس الصفحة مع زر العودة */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack}
              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              {t('back')}
            </Button>
            {isDirectBuy && (
              <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                {t('directPurchase')}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('checkout')}</h1>
          <p className="text-gray-600">
            {isDirectBuy 
              ? t('completeDirectPurchase') 
              : t('completeYourOrder')
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* قسم الشحن والدفع */}
          <div className="lg:col-span-2 space-y-6">
            {/* عنوان الشحن */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{t('shippingAddress')}</span>
                  <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('fullName')} *</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('city')} *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">{t('area')} *</Label>
                    <Input
                      id="area"
                      value={shippingAddress.area}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, area: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">{t('street')} *</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="building">{t('building')} *</Label>
                    <Input
                      id="building"
                      value={shippingAddress.building}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, building: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor">{t('floor')}</Label>
                    <Input
                      id="floor"
                      value={shippingAddress.floor}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, floor: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment">{t('apartment')}</Label>
                    <Input
                      id="apartment"
                      value={shippingAddress.apartment}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, apartment: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t('orderNotes')}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t('orderNotesPlaceholder')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* طريقة الدفع */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{t('paymentMethod')}</span>
                  <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: 'cash' | 'card') => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <div>
                        <span className="font-medium">{t('cashOnDelivery')}</span>
                        <p className="text-sm text-gray-500">{t('payOnDeliveryDescription')}</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                    <RadioGroupItem value="card" id="card" disabled />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-not-allowed flex-1">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <span>{t('creditCard')}</span>
                        <p className="text-sm text-gray-500">({t('comingSoon')})</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* ملخص الطلب */}
          <Card className="h-fit sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('orderSummary')}</span>
                <span className="text-sm font-normal text-gray-500">
                  ({itemsToCheckout.length} {t('items')})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* عرض المنتجات */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {itemsToCheckout.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                      <p className="text-xs text-gray-600">
                        {item.quantity} × {item.product.price} {t('currency')}
                      </p>
                    </div>
                    <p className="font-medium text-sm">
                      {item.quantity * item.product.price} {t('currency')}
                    </p>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* تفاصيل التكلفة */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('subtotal')}</span>
                  <span>{totalPrice} {t('currency')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('shipping')}</span>
                  <span className="text-green-600">{t('free')}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t('total')}</span>
                  <span className="text-primary">{totalPrice} {t('currency')}</span>
                </div>
              </div>
              
              {/* زر إتمام الطلب */}
              <Button 
                onClick={handlePlaceOrder} 
                className="w-full bg-primary hover:bg-primary/90" 
                size="lg"
                disabled={isLoading || itemsToCheckout.length === 0}
              >
                {isLoading ? t('placingOrder') : t('placeOrder')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
