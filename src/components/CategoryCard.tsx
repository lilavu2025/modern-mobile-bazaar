
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link to={`/category/${category.id}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/20">
        <div className="relative">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {category.count} منتج
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
    </Link>
  );
};

export default CategoryCard;
