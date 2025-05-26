
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductImageGalleryProps {
  product: {
    name: string;
    image: string;
    images?: string[];
    discount?: number;
  };
}

const ProductImageGallery = ({ product }: ProductImageGalleryProps) => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);

  // Improve image display - prioritize multiple images then main image
  const images = product.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images.filter(img => img && img.trim() !== '') 
    : [product.image].filter(img => img && img.trim() !== '');

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl bg-white border">
        {images.length > 0 && (
          <img
            src={images[selectedImage] || product.image}
            alt={product.name}
            className="w-full h-96 object-cover"
            onError={(e) => {
              console.error('Image failed to load:', images[selectedImage]);
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        )}
        {product.discount && (
          <Badge variant="destructive" className="absolute top-4 right-4">
            {t('discount')} {product.discount}%
          </Badge>
        )}
      </div>
      
      {/* Thumbnail images for multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                index === selectedImage ? 'border-primary' : 'border-gray-200'
              }`}
            >
              <img
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Thumbnail failed to load:', image);
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
