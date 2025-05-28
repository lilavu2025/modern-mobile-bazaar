import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCart = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Transform database product to Product interface
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

  // جلب السلة من Supabase عند تحميل الصفحة
  const fetchCartItems = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('cart')
      .select('*, product:products(*)')
      .eq('user_id', user.id);
    setIsLoading(false);
    if (error) {
      console.error('Error fetching cart from Supabase:', error);
      return;
    }
    if (Array.isArray(data)) {
      setCartItems(
        data.map((row: any) => ({
          id: row.id,
          product: transformProduct(row.product),
          quantity: row.quantity,
        }))
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartItems();
      
      // Set up real-time subscription for cart updates
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
            // Refetch cart items when changes occur
            fetchCartItems();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setCartItems([]);
    }
  }, [user]);

  // حفظ السلة في localStorage (اختياري)
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cartItems]);

  // إضافة منتج للسلة في Supabase
  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!product || !product.id) {
      toast.error(t('invalidProduct'));
      return;
    }
    
    // If user is not logged in, show login message but still allow adding to cart
    if (!user) {
      toast.error(t('pleaseLoginToAddToCart') || 'Please login to add items to cart');
      return;
    }
    
    setIsLoading(true);
    try {
      // تحقق إذا المنتج موجود مسبقاً
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
        // تحديث الكمية
        const newQuantity = existing.quantity + quantity;
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', existing.id);
        if (updateError) throw updateError;
        
        // Update local state immediately
        setCartItems(items => items.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        // إضافة جديد
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
        
        // Add to local state immediately
        if (newItem) {
          const cartItem = {
            id: newItem.id,
            product: transformProduct(newItem.product),
            quantity: newItem.quantity,
          };
          setCartItems(items => [...items, cartItem]);
        }
      }
      toast.success(`${product.name} ${t('addedToCart')}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('errorAddingToCart'));
      // Refresh cart on error to ensure consistency
      await fetchCartItems();
    } finally {
      setIsLoading(false);
    }
  };

  // حذف منتج من السلة في Supabase
  const removeFromCart = async (productId: string) => {
    if (!user) return;
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
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(t('errorRemovingFromCart'));
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث الكمية في Supabase
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
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
      setCartItems(items => items.map(item => item.product.id === productId ? { ...item, quantity } : item));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(t('errorUpdatingCart'));
    } finally {
      setIsLoading(false);
    }
  };

  // مسح السلة بالكامل من Supabase
  const clearCart = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      setCartItems([]);
      toast.success(t('allProductsRemoved'));
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error(t('errorClearingCart'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalItems = () => {
    const currentItems = Array.isArray(cartItems) ? cartItems : [];
    const total = currentItems.reduce((total, item) => total + (item.quantity || 0), 0);
    console.log('Total items in cart:', total);
    return total;
  };

  const getTotalPrice = () => {
    const currentItems = Array.isArray(cartItems) ? cartItems : [];
    return currentItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
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
    cartItems: Array.isArray(cartItems) ? cartItems : [],
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
    buyNow
  };
};
