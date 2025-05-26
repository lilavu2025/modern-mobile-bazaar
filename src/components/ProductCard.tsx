
import React from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, getItemQuantity } = useCart();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(t('productAdded') + ' ' + t('favorites'));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href + `/product/${product.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `/product/${product.id}`);
      toast.success(t('linkCopied'));
    }
  };

  // عرض السعر المناسب حسب نوع المستخدم
  const isWholesale = profile?.user_type === 'wholesale';
  const displayPrice = product.price;
  const showWholesaleLabel = isWholesale && product.wholesalePrice;

  return (
    <Card className="product-card group relative overflow-hidden">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {showWholesaleLabel && (
            <Badge className="bg-blue-500 hover:bg-blue-600">
              {t('wholesale')}
            </Badge>
          )}
          {product.discount && (
            <Badge variant="destructive" className="animate-bounce-in">
              {t('discount')} {product.discount}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-green-500 hover:bg-green-600">
              {t('featured')}
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary">
              {t('outOfStock')}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleQuickView}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleFavorite}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-primary">
            {displayPrice} {t('currency')}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {product.originalPrice} {t('currency')}
            </span>
          )}
        </div>

        {/* Add to cart button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full gap-2 font-semibold"
          variant={quantity > 0 ? "secondary" : "default"}
        >
          <ShoppingCart className="h-4 w-4" />
          {quantity > 0 ? `${t('inCart')} (${quantity})` : t('addToCart')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
