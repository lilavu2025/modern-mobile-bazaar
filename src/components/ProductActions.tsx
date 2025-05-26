
import React, { useState } from 'react';
import { Heart, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import { Product } from '@/types';
import QuantitySelector from '@/components/QuantitySelector';

interface ProductActionsProps {
  product: Product;
  onBuyNow: () => void;
}

const ProductActions = ({ product, onBuyNow }: ProductActionsProps) => {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getItemQuantity } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const cartQuantity = getItemQuantity(product.id);
  const isFav = isFavorite(product.id);

  const handleAddToCart = async () => {
    console.log('Add to cart clicked with quantity:', quantity);
    if (!product.inStock) {
      toast.error(t('productOutOfStock'));
      return;
    }
    
    try {
      await addToCart(product, quantity);
      console.log('Product added to cart successfully');
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('errorAddingToCart'));
    }
  };

  const handleFavorite = () => {
    console.log('Toggle favorite for product:', product.id);
    try {
      toggleFavorite(product.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(t('errorTogglingFavorite'));
    }
  };

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: productUrl
        });
        toast.success(t('sharedSuccessfully'));
      } else {
        await navigator.clipboard.writeText(productUrl);
        toast.success(t('linkCopied'));
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(productUrl);
        toast.success(t('linkCopied'));
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        toast.error(t('shareError'));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Quantity & Add to Cart */}
      {product.inStock && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{t('quantity')}</label>
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              max={99}
              min={1}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1 gap-2"
              size="lg"
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-5 w-5" />
              {t('addToCart')}
              {cartQuantity > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {cartQuantity}
                </Badge>
              )}
            </Button>
            
            <Button
              onClick={onBuyNow}
              variant="secondary"
              size="lg"
              className="flex-1"
              disabled={!product.inStock}
            >
              {t('buyNow')}
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          className={`flex-1 ${isFav ? 'text-red-500 border-red-500' : ''}`}
          onClick={handleFavorite}
        >
          <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="flex-1"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ProductActions;
