import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCart = () => {
  const { t } = useLanguage(); // ترجمة النصوص حسب اللغة المختارة
  const { user } = useAuth(); // بيانات المستخدم الحالي
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // تخزين عناصر السلة
  const [isLoading, setIsLoading] = useState(false); // حالة تحميل العمليات المتعلقة بالسلة
  const [error, setError] = useState<Error | null>(null); // حالة الخطأ

  // دالة لتحويل المنتج من قاعدة البيانات إلى واجهة المنتج المطلوبة في التطبيق
  const transformProduct = (dbProduct: any): Product => ({
    id: dbProduct.id,
    name: dbProduct.name_ar,
    nameEn: dbProduct.name_en,
    description: dbProduct.description_ar,
    descriptionEn: dbProduct.description_en,
    price: dbProduct.price,
    originalPrice: dbProduct.original_price,
    wholesalePrice: dbProduct.wholesale_price,
    image: dbProduct.image,
    images: dbProduct.images || [],
    category: dbProduct.category_id,
    inStock: dbProduct.in_stock ?? true,
    rating: dbProduct.rating || 0,
    reviews: dbProduct.reviews_count || 0,
    discount: dbProduct.discount,
    featured: dbProduct.featured || false,
    tags: dbProduct.tags || []
  });

  // جلب بيانات السلة من Supabase عند تحميل الصفحة أو تغير المستخدم
  const fetchCartItems = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('*, product:products(*)')
        .eq('user_id', user.id);
      setIsLoading(false);
      if (error) {
        setError(error);
        console.error('Error fetching cart from Supabase:', error);
        return;
      } else {
        setError(null);
      }
      if (Array.isArray(data)) {
        const transformedItems = data.map((row: any) => ({
          id: row.id,
          product: transformProduct(row.product),
          quantity: row.quantity,
        }));
        console.log('fetchCartItems: fetched items:', transformedItems);
        setCartItems(transformedItems);
      }
    } catch (error) {
      setIsLoading(false);
      setError(error instanceof Error ? error : new Error(String(error)));
      console.error('Exception in fetchCartItems:', error);
    }
  };

  // عند تغير المستخدم (تسجيل دخول/خروج)، نجلب بيانات السلة وندير الاشتراك للتحديثات المباشرة
  useEffect(() => {
    if (user) {
      fetchCartItems();

      // الاشتراك للتغييرات الفورية في جدول السلة
      console.log('Setting up realtime subscription for cart changes for user:', user.id);
      const subscription = supabase
        .channel('cart_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('Realtime event received for cart changes, refetching cart...');
            fetchCartItems();
          }
        )
        .subscribe();

      return () => {
        console.log('Unsubscribing from cart_changes realtime channel');
        subscription.unsubscribe();
      };
    } else {
      console.log('User logged out, clearing cartItems');
      setCartItems([]);
    }
  }, [user]);

  // حفظ السلة في localStorage (اختياري)
  useEffect(() => {
    try {
      console.log('Saving cartItems to localStorage:', cartItems);
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // دالة إضافة منتج للسلة مع دعم تحديث الكمية إذا المنتج موجود مسبقاً
  const addToCart = async (product: Product, quantity: number = 1) => {
    console.log('addToCart called with product:', product, 'quantity:', quantity);
    if (!product || !product.id) {
      toast.error(t('invalidProduct'));
      console.warn('addToCart: invalid product passed');
      return;
    }

    if (!user) {
      toast.error(t('pleaseLoginToAddToCart') || 'Please login to add items to cart');
      console.warn('addToCart: user not logged in');
      return;
    }

    setIsLoading(true);

    try {
      // جلب العنصر الموجود مسبقاً في السلة
      const { data: existing, error: fetchError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        console.log(`Product already in cart, updating quantity to ${newQuantity}`);
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        // تحديث الحالة المحلية مباشرة
        setCartItems(items => items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        console.log('Product not in cart, inserting new cart item');
        const { data: newItem, error: insertError } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
            added_at: new Date().toISOString(),
          })
          .select('*, product:products(*)')
          .single();

        if (insertError) throw insertError;

        if (newItem) {
          const cartItem = {
            id: newItem.id,
            product: transformProduct(newItem.product),
            quantity: newItem.quantity,
          };
          setCartItems(items => [...items, cartItem]);
          console.log('New cart item added:', cartItem);
        }
      }
      toast.success(`${product.name} ${t('addedToCart')}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('errorAddingToCart'));
      // إعادة تحميل السلة لضمان التزامن
      await fetchCartItems();
    } finally {
      setIsLoading(false);
    }
  };

  // دالة حذف منتج من السلة
  const removeFromCart = async (productId: string) => {
    if (!user) {
      console.warn('removeFromCart: user not logged in');
      return;
    }
    console.log('removeFromCart called for productId:', productId);
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
      toast.success(t('productRemovedFromCart'));
      setCartItems(items => items.filter(item => item.product.id !== productId));
      console.log('Product removed from cart:', productId);
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(t('errorRemovingFromCart'));
    } finally {
      setIsLoading(false);
    }
  };

  // دالة تحديث كمية منتج في السلة
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) {
      console.warn('updateQuantity: user not logged in');
      return;
    }
    console.log('updateQuantity called for productId:', productId, 'new quantity:', quantity);
    if (quantity <= 0) {
      console.log('Quantity <= 0, calling removeFromCart instead');
      await removeFromCart(productId);
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;

      setCartItems(items => items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ));
      console.log('Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(t('errorUpdatingCart'));
    } finally {
      setIsLoading(false);
    }
  };

  // دالة مسح كامل محتوى السلة
  const clearCart = async () => {
    if (!user) {
      console.warn('clearCart: user not logged in');
      return;
    }
    console.log('clearCart called, removing all items from cart');
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      setCartItems([]);
      toast.success(t('allProductsRemoved'));
      console.log('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error(t('errorClearingCart'));
    } finally {
      setIsLoading(false);
    }
  };

  // حساب عدد العناصر الإجمالي في السلة
  const getTotalItems = () => {
    const currentItems = Array.isArray(cartItems) ? cartItems : [];
    const total = currentItems.reduce((total, item) => total + (item.quantity || 0), 0);
    console.log('Total items in cart:', total);
    return total;
  };

  // حساب السعر الإجمالي لجميع العناصر في السلة
  const getTotalPrice = () => {
    const currentItems = Array.isArray(cartItems) ? cartItems : [];
    const totalPrice = currentItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
    console.log('Total price of cart:', totalPrice);
    return totalPrice;
  };

  // الحصول على كمية المنتج في السلة
  const getItemQuantity = (productId: string) => {
    if (!productId) return 0;
    const currentItems = Array.isArray(cartItems) ? cartItems : [];
    const item = currentItems.find(item => item.product.id === productId);
    const quantity = item ? item.quantity : 0;
    console.log('Getting quantity for product', productId, ':', quantity);
    return quantity;
  };

  // شراء فوري - إضافة للسلة والانتقال للدفع
  const buyNow = async (product: Product, quantity: number = 1) => {
    if (!user || !product || !product.id) {
      toast.error(t('invalidProduct'));
      return;
    }
    
    try {
      await addToCart(product, quantity);
      return true;
    } catch (error) {
      console.error('Error in buy now:', error);
      toast.error(t('errorBuyingNow'));
      return false;
    }
  };

  return {
    cartItems,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
    buyNow,
  };
};
