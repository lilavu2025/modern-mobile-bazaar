import React, { useState, useEffect } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useProducts } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Favorites: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const { favorites, isLoading: isFavoritesLoading, clearFavorites } = useFavorites();
  const { data: allProducts = [], isLoading: isLoadingAllProducts } = useProducts();

  // جلب المنتجات المفضلة
  useEffect(() => {
    const loadFavoriteProducts = async () => {
      if (!favorites || favorites.length === 0) {
        setFavoriteProducts([]);
        setIsLoadingProducts(false);
        return;
      }

      setIsLoadingProducts(true);
      try {
        if (user) {
          // للمستخدمين المسجلين، جلب من قاعدة البيانات
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .in('id', favorites);
          
          if (error) {
            console.error('خطأ في جلب المنتجات المفضلة:', error);
            toast.error(t('errorLoadingFavorites'));
            setFavoriteProducts([]);
          } else {
            setFavoriteProducts(data || []);
          }
        } else {
          // للضيوف، فلترة من المنتجات المحملة
          if (allProducts && allProducts.length > 0) {
            const filtered = allProducts.filter((p: any) => favorites.includes(p.id));
            setFavoriteProducts(filtered);
          }
        }
      } catch (error) {
        console.error('خطأ في جلب المنتجات المفضلة:', error);
        toast.error(t('errorLoadingFavorites'));
        setFavoriteProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    // تأكد من أن favorites محملة قبل محاولة جلب المنتجات
    if (!isFavoritesLoading) {
      loadFavoriteProducts();
    }
  }, [favorites, allProducts, user?.id, t, isFavoritesLoading]);

  // مسح جميع المفضلة
  const handleClearAll = async () => {
    if (!favorites || favorites.length === 0) return;
    
    try {
      await clearFavorites();
      setFavoriteProducts([]);
      toast.success(t('favoritesCleared'));
    } catch (error) {
      console.error('خطأ في مسح المفضلة:', error);
      toast.error(t('errorClearingFavorites'));
    }
  };

  // حالة التحميل
  const isLoading = isFavoritesLoading || (isLoadingAllProducts && !user) || isLoadingProducts;

  // مكون الـ Loading
  const LoadingComponent = () => (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* رأس الصفحة */}
      <Header
        onSearchChange={() => {}}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />
      
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <div className="container mx-auto px-4 py-6">
          {/* رأس قسم المفضلة */}
          <div className="mb-8">
            <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Heart className="h-8 w-8 text-primary fill-primary" />
                <div>
                  <h1 className="text-3xl font-bold">{t('favorites')}</h1>
                  <p className="text-gray-600 mt-1">
                    {favoriteProducts.length > 0 
                      ? `${favoriteProducts.length} ${t('products')}`
                      : t('noFavoritesYet')
                    }
                  </p>
                </div>
              </div>
              
              {/* أزرار الإجراءات */}
              {favoriteProducts.length > 0 && (
                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('clearAll')}
                  </Button>
                </div>
              )}
            </div>
            
            {/* إحصائيات سريعة */}
            {favoriteProducts.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div>
                      <p className="text-2xl font-bold text-primary">{favoriteProducts.length}</p>
                      <p className="text-sm text-gray-600">{t('favoriteProducts')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {favoriteProducts.filter(p => p.in_stock).length}
                      </p>
                      <p className="text-sm text-gray-600">{t('inStock')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {favoriteProducts.filter(p => p.discount && p.discount > 0).length}
                      </p>
                      <p className="text-sm text-gray-600">{t('onSale')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* محتوى الصفحة */}
          {favoriteProducts.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Heart className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">{t('noFavorites')}</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">{t('addFavoritesHint')}</p>
                <Button 
                  onClick={() => window.location.href = '/products'}
                  className={`flex items-center gap-2 mx-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t('browseProducts')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* سايدبار السلة */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Favorites;