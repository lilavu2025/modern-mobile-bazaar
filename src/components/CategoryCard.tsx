import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleClick = () => {
    navigate(`/products?category=${category.id}`);
  };
  
  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/20">
        <div className="relative">
          <img
            src={category.image || '/placeholder.svg'}
            alt={category.name}
            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
                {category.count} {category.count === 1 ? 'منتج' : 'منتج'}
              </Badge>
          </div>
        </div>
        <CardContent className="p-4 text-center">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {category.nameEn}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryCard;
