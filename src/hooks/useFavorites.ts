
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    console.log('Loading favorites for user:', user?.id);
    if (user?.id) {
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      console.log('Saved favorites from localStorage:', savedFavorites);
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites);
          console.log('Parsed favorites:', parsedFavorites);
          setFavorites(parsedFavorites);
        } catch (error) {
          console.error('Error loading favorites:', error);
          setFavorites([]);
        }
      }
    } else {
      // إذا لم يكن هناك مستخدم، استخدم localStorage عام
      const savedFavorites = localStorage.getItem('favorites_guest');
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites);
          setFavorites(parsedFavorites);
        } catch (error) {
          console.error('Error loading guest favorites:', error);
          setFavorites([]);
        }
      }
    }
  }, [user?.id]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    console.log('Saving favorites:', favorites);
    if (user?.id) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
    } else {
      localStorage.setItem('favorites_guest', JSON.stringify(favorites));
    }
  }, [favorites, user?.id]);

  const toggleFavorite = (productId: string) => {
    console.log('Toggling favorite for product:', productId);
    
    setFavorites(prev => {
      const isFavorite = prev.includes(productId);
      console.log('Product is currently favorite:', isFavorite);
      
      if (isFavorite) {
        toast.success(t('removedFromFavorites'));
        const newFavorites = prev.filter(id => id !== productId);
        console.log('New favorites after removal:', newFavorites);
        return newFavorites;
      } else {
        toast.success(t('addedToFavorites'));
        const newFavorites = [...prev, productId];
        console.log('New favorites after addition:', newFavorites);
        return newFavorites;
      }
    });
  };

  const isFavorite = (productId: string) => {
    const result = favorites.includes(productId);
    console.log(`Checking if product ${productId} is favorite:`, result);
    return result;
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
};
