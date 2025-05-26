
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
        const parsedCart = JSON.parse(savedCart);
        console.log('Loading cart from localStorage:', parsedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('Saving cart to localStorage:', cartItems);
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1) => {
    console.log('Adding to cart:', product, 'quantity:', quantity);
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
          console.log('Updated existing item in cart:', updatedItems);
          toast.success(`${product.name} ${t('addedToCart')}`);
          return updatedItems;
        } else {
          const newItem: CartItem = {
            id: product.id,
            product,
            quantity
          };
          const newItems = [...prevItems, newItem];
          console.log('Added new item to cart:', newItems);
          toast.success(`${product.name} ${t('addedToCart')}`);
          return newItems;
        }
      });
      setIsLoading(false);
    }, 100);
  };

  const buyNow = (product: Product, quantity: number = 1) => {
    console.log('Buy now called with:', product, 'quantity:', quantity);
    
    // مسح السلة وإضافة هذا المنتج فقط
    const newItem: CartItem = {
      id: product.id,
      product,
      quantity
    };
    
    setCartItems([newItem]);
    toast.success(`${product.name} ${t('addedToCart')}`);
    console.log('Cart updated for buy now:', [newItem]);
    
    return Promise.resolve(); // إرجاع Promise للتأكد من انتهاء العملية
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
    const total = cartItems.reduce((total, item) => total + item.quantity, 0);
    console.log('Total items in cart:', total);
    return total;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    const quantity = item ? item.quantity : 0;
    console.log('Getting quantity for product', productId, ':', quantity);
    return quantity;
  };

  return {
    cartItems,
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
