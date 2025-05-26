
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import ProductCardBadges from './ProductCardBadges';
import ProductCardActions from './ProductCardActions';

interface ProductCardImageProps {
  product: Product;
  isFavorite: boolean;
  onQuickView: () => void;
  onFavorite: () => void;
  onShare: () => void;
}

const ProductCardImage = ({ 
  product, 
  isFavorite, 
  onQuickView, 
  onFavorite, 
  onShare 
}: ProductCardImageProps) => {
  return (
    <div className="relative overflow-hidden">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </Link>
      
      <ProductCardBadges product={product} />
      <ProductCardActions 
        product={product}
        isFavorite={isFavorite}
        onQuickView={onQuickView}
        onFavorite={onFavorite}
        onShare={onShare}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default ProductCardImage;
