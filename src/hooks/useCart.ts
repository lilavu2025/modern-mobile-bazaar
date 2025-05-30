import { useContext } from 'react';
import CartContext from '@/contexts/CartContext';
import type { CartContextType } from '@/contexts/CartContext.types';
import type { Product } from '@/types';

export const useCart = (): CartContextType & { addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void } => {
  const context = useContext(CartContext) as CartContextType & { addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void };
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;
