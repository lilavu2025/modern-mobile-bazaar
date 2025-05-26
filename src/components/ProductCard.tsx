
import React, { useState } from 'react';
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

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, getItemQuantity, buyNow } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [showQuickView, setShowQuickView] = useState(false);
  const cartQuantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    buyNow(product, quantity);
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      setShowQuickView(true);
    }
  };

  const handleFavorite = () => {
    if (!user) {
      toast.error(t('pleaseLogin'));
      return;
    }
    toggleFavorite(product.id);
  };

  const handleShare = () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: productUrl
      });
    } else {
      navigator.clipboard.writeText(productUrl);
      toast.success(t('linkCopied'));
    }
  };

  const isFav = isFavorite(product.id);

  return (
    <>
      <Card className="product-card group relative overflow-hidden hover:shadow-lg transition-shadow">
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
};

export default ProductCard;
