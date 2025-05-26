
import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export const useCart = () => {
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('Loading cart from localStorage:', parsedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          console.error('Invalid cart data in localStorage');
          localStorage.removeItem('cart');
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem('cart');
      setCartItems([]);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      console.log('Saving cart to localStorage:', cartItems);
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cartItems]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    console.log('Adding to cart:', product, 'quantity:', quantity);
    
    if (!product || !product.id) {
      console.error('Invalid product data');
      toast.error(t('invalidProduct'));
      return;
    }

    setIsLoading(true);
    
    try {
      setCartItems(prevItems => {
        const currentItems = Array.isArray(prevItems) ? prevItems : [];
        const existingItem = currentItems.find(item => item.id === product.id);
        
        if (existingItem) {
          const updatedItems = currentItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          console.log('Updated existing item in cart:', updatedItems);
          toast.success(`${product.name} ${t('addedToCart')}`);
          return updatedItems;
        } else {
          const newItem: CartItem = {
            id: product.id,
            product,
            quantity
          };
          const newItems = [...currentItems, newItem];
          console.log('Added new item to cart:', newItems);
          toast.success(`${product.name} ${t('addedToCart')}`);
          return newItems;
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('errorAddingToCart'));
    } finally {
      setIsLoading(false);
    }
  };

  const buyNow = async (product: Product, quantity: number = 1) => {
    console.log('Buy now called with:', product, 'quantity:', quantity);
    
    if (!product || !product.id) {
      console.error('Invalid product data');
      toast.error(t('invalidProduct'));
      return Promise.reject('Invalid product');
    }
    
    try {
      // مسح السلة وإضافة هذا المنتج فقط
      const newItem: CartItem = {
        id: product.id,
        product,
        quantity
      };
      
      setCartItems([newItem]);
      toast.success(`${product.name} ${t('addedToCart')}`);
      console.log('Cart updated for buy now:', [newItem]);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in buy now:', error);
      toast.error(t('errorBuyingNow'));
      return Promise.reject(error);
    }
  };

  const removeFromCart = (productId: string) => {
    if (!productId) {
      console.error('Product ID is required');
      return;
    }

    setCartItems(prevItems => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      const updatedItems = currentItems.filter(item => item.id !== productId);
      toast.success(t('productRemovedFromCart'));
      console.log('Removed item from cart, new items:', updatedItems);
      return updatedItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!productId) {
      console.error('Product ID is required');
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      return currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success(t('allProductsRemoved'));
    console.log('Cart cleared');
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

  const getItemQuantity = (productId: string) => {
    if (!productId) return 0;
    const currentItems = Array.isArray(cartItems) ? cartItems : [];
    const item = currentItems.find(item => item.id === productId);
    const quantity = item ? item.quantity : 0;
    console.log('Getting quantity for product', productId, ':', quantity);
    return quantity;
  };

  return {
    cartItems: Array.isArray(cartItems) ? cartItems : [],
    isLoading,
    addToCart,
    buyNow,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity
  };
};
