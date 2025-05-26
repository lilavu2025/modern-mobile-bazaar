
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
    try {
      if (user?.id) {
        const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
        console.log('Saved favorites from localStorage:', savedFavorites);
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          console.log('Parsed favorites:', parsedFavorites);
          setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
        } else {
          setFavorites([]);
        }
      } else {
        // إذا لم يكن هناك مستخدم، استخدم localStorage عام
        const savedFavorites = localStorage.getItem('favorites_guest');
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
        } else {
          setFavorites([]);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  }, [user?.id]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    console.log('Saving favorites:', favorites);
    try {
      if (user?.id) {
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
      } else {
        localStorage.setItem('favorites_guest', JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, user?.id]);

  const toggleFavorite = (productId: string) => {
    console.log('Toggling favorite for product:', productId);
    
    if (!productId) {
      console.error('Product ID is required');
      return;
    }
    
    setFavorites(prev => {
      const currentFavorites = Array.isArray(prev) ? prev : [];
      const isFavorite = currentFavorites.includes(productId);
      console.log('Product is currently favorite:', isFavorite);
      
      if (isFavorite) {
        const newFavorites = currentFavorites.filter(id => id !== productId);
        console.log('New favorites after removal:', newFavorites);
        toast.success(t('removedFromFavorites'));
        return newFavorites;
      } else {
        const newFavorites = [...currentFavorites, productId];
        console.log('New favorites after addition:', newFavorites);
        toast.success(t('addedToFavorites'));
        return newFavorites;
      }
    });
  };

  const isFavorite = (productId: string) => {
    if (!productId) return false;
    const currentFavorites = Array.isArray(favorites) ? favorites : [];
    const result = currentFavorites.includes(productId);
    console.log(`Checking if product ${productId} is favorite:`, result);
    return result;
  };

  const getFavoritesCount = () => {
    const count = Array.isArray(favorites) ? favorites.length : 0;
    console.log('Favorites count:', count);
    return count;
  };

  const clearFavorites = () => {
    console.log('Clearing all favorites');
    setFavorites([]);
    toast.success(t('favoritesCleared'));
  };

  return {
    favorites: Array.isArray(favorites) ? favorites : [],
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    clearFavorites,
  };
};
