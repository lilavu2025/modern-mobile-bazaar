
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'icon' | 'default';
  variant?: 'ghost' | 'outline' | 'secondary';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  productId, 
  className = '', 
  size = 'icon',
  variant = 'ghost'
}) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error(t('pleaseLogin'));
      return;
    }
    
    try {
      await toggleFavorite(productId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(t('errorUpdatingFavorites'));
    }
  };

  const isFav = isFavorite(productId);

  return (
    <Button
      size={size}
      variant={variant}
      className={`${className} ${isFav ? 'text-red-500' : ''}`}
      onClick={handleFavorite}
    >
      <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
    </Button>
  );
};

export default FavoriteButton;
