
import React from 'react';
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';
import QuantitySelector from '@/components/QuantitySelector';

interface ProductCardQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  cartQuantity: number;
  isFavorite: boolean;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onFavorite: () => void;
  onShare: () => void;
}

const ProductCardQuickView = ({ 
  product, 
  isOpen, 
  onClose, 
  quantity, 
  cartQuantity, 
  isFavorite, 
  onQuantityChange, 
  onAddToCart, 
  onBuyNow, 
  onFavorite, 
  onShare 
}: ProductCardQuickViewProps) => {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();

  const displayPrice = product.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="space-y-4">
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviews || 0} {t('reviews')})
              </span>
            </div>

            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-2xl font-bold text-primary">
                {displayPrice} {t('currency')}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  {product.originalPrice} {t('currency')}
                </span>
              )}
            </div>

            <p className="text-gray-600">{product.description}</p>

            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-gray-600">{t('quantity')}:</span>
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={onQuantityChange}
                max={99}
                min={1}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onAddToCart}
                disabled={!product.inStock}
                className="flex-1 gap-2"
                variant={cartQuantity > 0 ? "secondary" : "default"}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartQuantity > 0 ? `${t('inCart')} (${cartQuantity})` : t('addToCart')}
              </Button>
              <Button
                onClick={onBuyNow}
                disabled={!product.inStock}
                variant="outline"
              >
                {t('buyNow')}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className={`gap-2 ${isFavorite ? 'text-red-500' : ''}`}
                onClick={onFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4" />
                {t('share')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductCardQuickView;
