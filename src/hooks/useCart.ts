
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
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        
        if (existingItem) {
          const updatedItems = prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          toast.success(t('productAddedToCart'));
          return updatedItems;
        } else {
          const newItem: CartItem = {
            id: product.id,
            product,
            quantity
          };
          toast.success(t('productAddedToCart'));
          return [...prevItems, newItem];
        }
      });
      setIsLoading(false);
    }, 300);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== productId);
      toast.success(t('productRemovedFromCart'));
      return updatedItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success(t('allProductsRemoved'));
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity
  };
};
