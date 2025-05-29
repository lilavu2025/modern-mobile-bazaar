import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useFavorites = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // الحالة التي تحمل قائمة المنتجات المفضلة (معرفات المنتجات فقط)
  const [favorites, setFavorites] = useState<string[]>([]);
  // حالة لتحكم في تحميل البيانات
  const [isLoading, setIsLoading] = useState(false);
  // حالة لتخزين الأخطاء
  const [error, setError] = useState<Error | null>(null);

  // ------------------------------------
  // 1. جلب المفضلة عند تحميل الصفحة أو عند تغير المستخدم
  // ------------------------------------
  useEffect(() => {
    const fetchFavorites = async () => {
      console.log('[fetchFavorites] بدء جلب المفضلة...');

      if (!user) {
        // حالة المستخدم غير مسجل: جلب المفضلة من localStorage للضيوف
        try {
          const guestFavorites = localStorage.getItem('favorites_guest');
          console.log('[fetchFavorites] جلب المفضلة من localStorage للضيف:', guestFavorites);
          if (guestFavorites) {
            setFavorites(JSON.parse(guestFavorites));
          } else {
            setFavorites([]);
          }
        } catch (error) {
          console.error('[fetchFavorites] خطأ في جلب المفضلة للضيف:', error);
        }
        return;
      }

      setIsLoading(true);

      try {
        // جلب المفضلة للمستخدم المسجل من قاعدة بيانات Supabase
        const { data, error } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });

        if (error) {
          setError(error);
          console.error('[fetchFavorites] خطأ في جلب المفضلة من Supabase:', error);
          toast.error(t('errorLoadingFavorites'));
          setFavorites([]);
          return;
        } else {
          setError(null);
        }

        const favoriteIds = Array.isArray(data) ? data.map((row: any) => row.product_id) : [];
        console.log('[fetchFavorites] تم جلب المفضلة بنجاح:', favoriteIds);
        setFavorites(favoriteIds);
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
        console.error('[fetchFavorites] خطأ غير متوقع في جلب المفضلة:', error);
        toast.error(t('errorLoadingFavorites'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();

    if (user) {
      // ------------------------------------
      // 2. إعداد الاشتراك لتحديث المفضلة في الوقت الحقيقي
      // ------------------------------------
      console.log('[useEffect] إعداد اشتراك تحديث المفضلة للمستخدم:', user.id);
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
            console.log('[subscription] حدث تغيير في المفضلة، إعادة جلب...');
            fetchFavorites();
          }
        )
        .subscribe();

      // تنظيف الاشتراك عند التفكيك
      return () => {
        console.log('[useEffect] تنظيف اشتراك المفضلة');
        subscription.unsubscribe();
      };
    }
  }, [user?.id, t]);

  // ------------------------------------
  // 3. حفظ المفضلة في localStorage للضيوف (غير المسجلين)
  // ------------------------------------
  useEffect(() => {
    try {
      if (!user) {
        console.log('[useEffect] حفظ المفضلة في localStorage للضيف:', favorites);
        localStorage.setItem('favorites_guest', JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('[useEffect] خطأ في حفظ المفضلة:', error);
    }
  }, [favorites, user]);

  // ------------------------------------
  // 4. دالة لإضافة أو حذف منتج من المفضلة
  // ------------------------------------
  const toggleFavorite = async (productId: string) => {
    console.log('[toggleFavorite] تبديل حالة المفضلة للمنتج:', productId);

    if (!productId) {
      toast.error(t('invalidProduct'));
      return;
    }

    const isFav = favorites.includes(productId);
    console.log('[toggleFavorite] هل المنتج موجود مسبقاً في المفضلة؟', isFav);

    // حالة الضيف (غير مسجل) فقط تحديث localStorage
    if (!user) {
      if (isFav) {
        setFavorites(prev => {
          const updated = prev.filter(id => id !== productId);
          console.log('[toggleFavorite] إزالة المنتج من المفضلة (ضيف):', updated);
          return updated;
        });
        toast.success(t('removedFromFavorites'));
      } else {
        setFavorites(prev => {
          const updated = [...prev, productId];
          console.log('[toggleFavorite] إضافة المنتج للمفضلة (ضيف):', updated);
          return updated;
        });
        toast.success(t('addedToFavorites'));
      }
      return;
    }

    // تحديث الواجهة فوراً لتجربة مستخدم سلسة
    if (isFav) {
      setFavorites(prev => {
        const updated = prev.filter(id => id !== productId);
        console.log('[toggleFavorite] إزالة المنتج من المفضلة (مستخدم مسجل):', updated);
        return updated;
      });
    } else {
      setFavorites(prev => {
        const updated = [...prev, productId];
        console.log('[toggleFavorite] إضافة المنتج للمفضلة (مستخدم مسجل):', updated);
        return updated;
      });
    }

    // تحديث قاعدة البيانات في Supabase
    try {
      if (isFav) {
        // حذف من المفضلة
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          // في حالة الخطأ، إعادة المنتج إلى الحالة السابقة
          setFavorites(prev => {
            const restored = [...prev, productId];
            console.error('[toggleFavorite] خطأ في حذف المنتج من المفضلة:', error);
            console.log('[toggleFavorite] إعادة المنتج إلى الحالة السابقة:', restored);
            return restored;
          });
          toast.error(t('errorRemovingFromFavorites'));
        } else {
          toast.success(t('removedFromFavorites'));
        }
      } else {
        // إضافة إلى المفضلة
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
            added_at: new Date().toISOString(),
          });

        if (error) {
          // في حالة الخطأ، إزالة المنتج من الحالة الحالية
          setFavorites(prev => {
            const removed = prev.filter(id => id !== productId);
            console.error('[toggleFavorite] خطأ في إضافة المنتج للمفضلة:', error);
            console.log('[toggleFavorite] إزالة المنتج من الحالة الحالية:', removed);
            return removed;
          });
          toast.error(t('errorAddingToFavorites'));
        } else {
          toast.success(t('addedToFavorites'));
        }
      }
    } catch (error) {
      // في حالة خطأ غير متوقع، إعادة الحالة السابقة
      if (isFav) {
        setFavorites(prev => {
          const restored = [...prev, productId];
          console.error('[toggleFavorite] خطأ غير متوقع أثناء حذف المنتج:', error);
          console.log('[toggleFavorite] إعادة المنتج إلى الحالة السابقة:', restored);
          return restored;
        });
      } else {
        setFavorites(prev => {
          const removed = prev.filter(id => id !== productId);
          console.error('[toggleFavorite] خطأ غير متوقع أثناء إضافة المنتج:', error);
          console.log('[toggleFavorite] إزالة المنتج من الحالة الحالية:', removed);
          return removed;
        });
      }
      toast.error(t('unexpectedError'));
    }
  };

  // ------------------------------------
  // 5. دالة للتحقق إذا كان المنتج مضاف في المفضلة
  // ------------------------------------
  const isFavorite = (productId: string) => {
    if (!productId) return false;
    const currentFavorites = Array.isArray(favorites) ? favorites : [];
    const result = currentFavorites.includes(productId);
    console.log('[isFavorite] تحقق من وجود المنتج في المفضلة:', productId, result);
    return result;
  };

  // ------------------------------------
  // 6. الحصول على عدد المنتجات المفضلة
  // ------------------------------------
  const getFavoritesCount = () => {
    const count = Array.isArray(favorites) ? favorites.length : 0;
    console.log('[getFavoritesCount] عدد المنتجات المفضلة:', count);
    return count;
  };

  // ------------------------------------
  // 7. مسح كل المفضلة
  // ------------------------------------
  const clearFavorites = async () => {
    console.log('[clearFavorites] بدء مسح المفضلة...');
    if (user) {
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('[clearFavorites] خطأ في مسح المفضلة:', error);
          toast.error(t('errorClearingFavorites'));
          return;
        }
      } catch (error) {
        console.error('[clearFavorites] خطأ غير متوقع في مسح المفضلة:', error);
        toast.error(t('unexpectedError'));
        return;
      }
    }
    setFavorites([]);
    toast.success(t('favoritesCleared'));
    console.log('[clearFavorites] تم مسح المفضلة بنجاح');
  };

  // ------------------------------------
  // 8. جلب تفاصيل المنتجات المفضلة كاملة من جدول المنتجات
  // ------------------------------------
  const getFavoriteProducts = async () => {
    console.log('[getFavoriteProducts] جلب تفاصيل المنتجات المفضلة...');
    if (!user || favorites.length === 0) {
      console.log('[getFavoriteProducts] لا يوجد مستخدم مسجل أو لا توجد مفضلة');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', favorites);

      if (error) {
        console.error('[getFavoriteProducts] خطأ في جلب المنتجات المفضلة:', error);
        return [];
      }

      console.log('[getFavoriteProducts] تم جلب المنتجات المفضلة:', data);
      return data || [];
    } catch (error) {
      console.error('[getFavoriteProducts] خطأ غير متوقع في جلب المنتجات المفضلة:', error);
      return [];
    }
  };

  // ------------------------------------
  // 9. القيمة المرجعة من ال hook (الدوال والحالات)
  // ------------------------------------
  return {
    favorites: Array.isArray(favorites) ? favorites : [],
    isLoading,
    error,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    clearFavorites,
    getFavoriteProducts,
  };
};
