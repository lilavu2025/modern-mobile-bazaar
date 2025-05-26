import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { ShoppingCart, CreditCard, Banknote } from 'lucide-react';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();

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

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: t('error'),
        description: t('pleaseLogin'),
        variant: 'destructive',
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: t('error'),
        description: t('cartIsEmpty'),
        variant: 'destructive',
      });
      return;
    }

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city || 
        !shippingAddress.area || !shippingAddress.street || !shippingAddress.building) {
      toast({
        title: t('error'),
        description: t('fillRequiredFields'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: getTotalPrice(),
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and redirect
      clearCart();
      
      toast({
        title: t('success'),
        description: t('orderPlaced'),
      });

      navigate('/orders');
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: t('error'),
        description: error.message || t('orderFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('checkout')}</h1>
          <p className="text-gray-600">{t('completeYourOrder')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>{t('shippingAddress')}</CardTitle>
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

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>{t('paymentMethod')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: 'cash' | 'card') => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5" />
                      <span>{t('cashOnDelivery')}</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                    <RadioGroupItem value="card" id="card" disabled />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-not-allowed flex-1">
                      <CreditCard className="h-5 w-5" />
                      <span>{t('creditCard')} ({t('comingSoon')})</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {item.product.price} {t('currency')}
                    </p>
                  </div>
                  <p className="font-medium">
                    {item.quantity * item.product.price} {t('currency')}
                  </p>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t('total')}</span>
                <span>{getTotalPrice()} {t('currency')}</span>
              </div>
              
              <Button 
                onClick={handlePlaceOrder} 
                className="w-full" 
                size="lg"
                disabled={isLoading}
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
