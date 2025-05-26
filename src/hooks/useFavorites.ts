
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
    if (user?.id) {
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      }
    }
  }, [user?.id]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user?.id]);

  const toggleFavorite = (productId: string) => {
    if (!user) {
      toast.error(t('pleaseLogin'));
      return;
    }

    setFavorites(prev => {
      const isFavorite = prev.includes(productId);
      if (isFavorite) {
        toast.success(t('removedFromFavorites'));
        return prev.filter(id => id !== productId);
      } else {
        toast.success(t('addedToFavorites'));
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
};
