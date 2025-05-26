
import React from 'react';
import { Eye, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';

interface ProductCardActionsProps {
  product: Product;
  isFavorite: boolean;
  onQuickView: () => void;
  onFavorite: () => void;
  onShare: () => void;
}

const ProductCardActions = ({ 
  product, 
  isFavorite, 
  onQuickView, 
  onFavorite, 
  onShare 
}: ProductCardActionsProps) => {
  const { isRTL } = useLanguage();

  return (
    <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-white/90 hover:bg-white shadow-md"
        onClick={onQuickView}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className={`h-8 w-8 bg-white/90 hover:bg-white shadow-md ${isFavorite ? 'text-red-500' : ''}`}
        onClick={onFavorite}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-white/90 hover:bg-white shadow-md"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductCardActions;
