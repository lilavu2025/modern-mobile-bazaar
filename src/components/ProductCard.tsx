
import React, { useState, memo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import ProductCardImage from './ProductCard/ProductCardImage';
import ProductCardContent from './ProductCard/ProductCardContent';
import ProductCardQuickView from './ProductCard/ProductCardQuickView';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onQuickView }) => {
  const { addToCart, getItemQuantity, buyNow } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [showQuickView, setShowQuickView] = useState(false);
  const cartQuantity = getItemQuantity(product.id);

  const handleAddToCart = useCallback(() => {
    addToCart(product, quantity);
    toast.success(t('addedToCart'));
  }, [addToCart, product, quantity, t]);

  const handleBuyNow = useCallback(() => {
    buyNow(product, quantity);
  }, [buyNow, product, quantity]);

  const handleQuickView = useCallback(() => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      setShowQuickView(true);
    }
  }, [onQuickView, product]);

  const handleFavorite = useCallback(() => {
    if (!user) {
      toast.error(t('pleaseLogin'));
      return;
    }
    toggleFavorite(product.id);
    toast.success(isFavorite(product.id) ? t('removedFromFavorites') : t('addedToFavorites'));
  }, [user, toggleFavorite, product.id, t, isFavorite]);

  const handleShare = useCallback(async () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    
    try {
      if (navigator.share && navigator.canShare) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: productUrl
        });
      } else {
        await navigator.clipboard.writeText(productUrl);
        toast.success(t('linkCopied'));
      }
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(t('linkCopied'));
    }
  }, [product, t]);

  const isFav = isFavorite(product.id);

  return (
    <>
      <Card className="product-card group relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2">
        <ProductCardImage
          product={product}
          isFavorite={isFav}
          onQuickView={handleQuickView}
          onFavorite={handleFavorite}
          onShare={handleShare}
        />
        
        <ProductCardContent
          product={product}
          quantity={quantity}
          cartQuantity={cartQuantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      </Card>

      <ProductCardQuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        quantity={quantity}
        cartQuantity={cartQuantity}
        isFavorite={isFav}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onFavorite={handleFavorite}
        onShare={handleShare}
      />
    </>
  );
});

export default ProductCard;

// Add display name for debugging
ProductCard.displayName = 'ProductCard';
