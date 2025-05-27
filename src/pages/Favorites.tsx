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
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Favorites: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const { favorites, isLoading, clearFavorites, getFavoriteProducts } = useFavorites();
  const { data: allProducts = [], isLoading: isLoadingAllProducts } = useProducts();

  // جلب المنتجات المفضلة
  useEffect(() => {
    const loadFavoriteProducts = async () => {
      if (favorites.length === 0) {
        setFavoriteProducts([]);
        return;
      }

      setIsLoadingProducts(true);
      try {
        if (user) {
          // للمستخدمين المسجلين، جلب من قاعدة البيانات
          const products = await getFavoriteProducts();
          setFavoriteProducts(products);
        } else {
          // للضيوف، فلترة من المنتجات المحملة
          const filtered = allProducts.filter((p: any) => favorites.includes(p.id));
          setFavoriteProducts(filtered);
        }
      } catch (error) {
        console.error('خطأ في جلب المنتجات المفضلة:', error);
        toast.error(t('errorLoadingFavorites'));
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadFavoriteProducts();
  }, [favorites, allProducts, user, getFavoriteProducts, t]);

  // مسح جميع المفضلة
  const handleClearAll = async () => {
    if (favorites.length === 0) return;
    
    try {
      await clearFavorites();
      setFavoriteProducts([]);
    } catch (error) {
      console.error('خطأ في مسح المفضلة:', error);
    }
  };

  const isLoadingState = isLoading || isLoadingAllProducts || isLoadingProducts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* رأس الصفحة */}
      <Header
        onSearchChange={() => {}}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />
      
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
                      {favoriteProducts.filter(p => p.stock > 0).length}
                    </p>
                    <p className="text-sm text-gray-600">{t('inStock')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {favoriteProducts.filter(p => p.discount_percent > 0).length}
                    </p>
                    <p className="text-sm text-gray-600">{t('onSale')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* محتوى الصفحة */}
        {isLoadingState ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-500">{t('loadingFavorites')}</p>
          </div>
        ) : favoriteProducts.length === 0 ? (
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
      
      {/* سايدبار السلة */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Favorites;
