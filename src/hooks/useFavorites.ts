import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useFavorites = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // جلب المفضلة من Supabase عند تحميل الصفحة
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        // للمستخدمين غير المسجلين، جلب من localStorage
        try {
          const guestFavorites = localStorage.getItem('favorites_guest');
          if (guestFavorites) {
            setFavorites(JSON.parse(guestFavorites));
          }
        } catch (error) {
          console.error('خطأ في جلب المفضلة للضيف:', error);
        }
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });
        
        if (error) {
          console.error('خطأ في جلب المفضلة من Supabase:', error);
          toast.error(t('errorLoadingFavorites'));
          setFavorites([]);
          return;
        }
        
        const favoriteIds = Array.isArray(data) ? data.map((row: any) => row.product_id) : [];
        setFavorites(favoriteIds);
      } catch (error) {
        console.error('خطأ غير متوقع في جلب المفضلة:', error);
        toast.error(t('errorLoadingFavorites'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
    
    if (user) {
      // Set up real-time subscription for favorites updates
      const subscription = supabase
        .channel('favorites_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'favorites',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refetch favorites when changes occur
            fetchFavorites();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id, t]);

  // حفظ المفضلة في localStorage
  useEffect(() => {
    try {
      if (!user) {
        // للضيوف، حفظ في localStorage
        localStorage.setItem('favorites_guest', JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, user]);

  // إضافة/حذف منتج من المفضلة في Supabase
  const toggleFavorite = async (productId: string) => {
    if (!productId) {
      toast.error(t('invalidProduct'));
      return;
    }

    const isFav = favorites.includes(productId);
    
    // للمستخدمين غير المسجلين، استخدم localStorage فقط
    if (!user) {
      if (isFav) {
        setFavorites(prev => prev.filter(id => id !== productId));
        toast.success(t('removedFromFavorites'));
      } else {
        setFavorites(prev => [...prev, productId]);
        toast.success(t('addedToFavorites'));
      }
      return;
    }

    // تحديث الواجهة فوراً للاستجابة السريعة
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== productId));
    } else {
      setFavorites(prev => [...prev, productId]);
    }

    try {
      if (isFav) {
        // حذف من المفضلة
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (error) {
          // إعادة المنتج للمفضلة في حالة الخطأ
          setFavorites(prev => [...prev, productId]);
          console.error('خطأ في حذف المنتج من المفضلة:', error);
          toast.error(t('errorRemovingFromFavorites'));
        } else {
          toast.success(t('removedFromFavorites'));
        }
      } else {
        // إضافة للمفضلة
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
            added_at: new Date().toISOString(),
          });
        
        if (error) {
          // حذف المنتج من المفضلة في حالة الخطأ
          setFavorites(prev => prev.filter(id => id !== productId));
          console.error('خطأ في إضافة المنتج للمفضلة:', error);
          toast.error(t('errorAddingToFavorites'));
        } else {
          toast.success(t('addedToFavorites'));
        }
      }
    } catch (error) {
      // إعادة الحالة السابقة في حالة خطأ غير متوقع
      if (isFav) {
        setFavorites(prev => [...prev, productId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== productId));
      }
      console.error('خطأ غير متوقع في تبديل المفضلة:', error);
      toast.error(t('unexpectedError'));
    }
  };

  // التحقق من كون المنتج في المفضلة
  const isFavorite = (productId: string) => {
    if (!productId) return false;
    const currentFavorites = Array.isArray(favorites) ? favorites : [];
    return currentFavorites.includes(productId);
  };

  // الحصول على عدد المنتجات المفضلة
  const getFavoritesCount = () => {
    return Array.isArray(favorites) ? favorites.length : 0;
  };

  // مسح جميع المفضلة
  const clearFavorites = async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id);
        
        if (error) {
          console.error('خطأ في مسح المفضلة:', error);
          toast.error(t('errorClearingFavorites'));
          return;
        }
      } catch (error) {
        console.error('خطأ غير متوقع في مسح المفضلة:', error);
        toast.error(t('unexpectedError'));
        return;
      }
    }
    
    setFavorites([]);
    toast.success(t('favoritesCleared'));
  };

  // الحصول على قائمة المنتجات المفضلة مع تفاصيلها
  const getFavoriteProducts = async () => {
    if (!user || favorites.length === 0) return [];
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', favorites);
      
      if (error) {
        console.error('خطأ في جلب المنتجات المفضلة:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('خطأ غير متوقع في جلب المنتجات المفضلة:', error);
      return [];
    }
  };

  return {
    favorites: Array.isArray(favorites) ? favorites : [],
    isLoading,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    clearFavorites,
    getFavoriteProducts,
  };
};

// إذا لم يكن جدول favorites معرف في Supabase، استخدم localStorage فقط
// عند تعريف الجدول في Supabase وتحديث types، أعد تفعيل الربط مع Supabase
// --- تعريف نوع favorites مؤقتاً هنا ---
// type Favorite = { user_id: string; product_id: string; added_at: string };
