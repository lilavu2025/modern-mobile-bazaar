import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import BannerCarousel from '@/components/BannerCarousel';
import CategoryCard from '@/components/CategoryCard';
import CartSidebar from '@/components/CartSidebar';
import { Button } from '@/components/ui/button';
import { useProducts, useCategories, useBanners } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/utils/languageContextUtils';

const Index = () => {
  const { t } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bannersData, loading: bannersLoading } = useBanners();
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: productsData, loading: productsLoading, error: productsError } = useProducts();

  const banners = bannersData?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const products = productsData?.data ?? [];

  // إزالة console.log من الإنتاج
  if (process.env.NODE_ENV !== 'production') {
    console.log('Categories data:', categories);
    console.log('Categories loading:', categoriesLoading);
    console.log('Categories error:', categoriesError);
  }

  const featuredProducts = products.filter(product => product.featured).slice(0, 8);
  const filteredProducts = products.filter(product => 
    searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayProducts = searchQuery ? filteredProducts : featuredProducts;

  useEffect(() => {
    console.log('[Index] mounted at', new Date().toISOString());
    return () => {
      console.log('[Index] unmounted at', new Date().toISOString());
    };
  }, []);

  let productsErrorMsg = t('errorLoadingData');
  if (typeof productsError === 'object' && productsError !== null && 'message' in productsError && typeof (productsError as { message?: string }).message === 'string') {
    productsErrorMsg = (productsError as { message?: string }).message || productsErrorMsg;
  }
  let categoriesErrorMsg = t('errorLoadingData');
  if (typeof categoriesError === 'object' && categoriesError !== null && 'message' in categoriesError && typeof (categoriesError as { message?: string }).message === 'string') {
    categoriesErrorMsg = (categoriesError as { message?: string }).message || categoriesErrorMsg;
  }

  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4" aria-label="خطأ في تحميل المنتجات">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">{t('error')}</h2>
          <p className="mb-4">{productsErrorMsg}</p>
          <Button onClick={() => window.location.reload()} aria-label={t('retry')}>{t('retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearchChange={setSearchQuery}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Banner */}
        {!searchQuery && !bannersLoading && banners.length > 0 && (
          <section className="mb-12">
            <BannerCarousel banners={banners} />
          </section>
        )}

        {/* Search Results */}
        {searchQuery && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {t('searchResults')} "{searchQuery}"
            </h2>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('noProductsFound')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Categories */}
        {!searchQuery && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{t('categories')}</h2>
              <Button asChild variant="outline">
                <Link to="/categories" aria-label={t('viewAll')}>{t('viewAll')}</Link>
              </Button>
            </div>
            {categoriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                    <div className="h-20 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : categoriesError ? (
              <div className="text-center py-8">
                <p className="text-red-500">
                  خطأ في تحميل الفئات: {categoriesErrorMsg}</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد فئات متاحة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.slice(0, 5).map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured Products */}
        {!searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{t('featuredProducts')}</h2>
              <Button asChild variant="outline">
                <Link to="/products" aria-label={t('viewAll')}>{t('viewAll')}</Link>
              </Button>
            </div>
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('noFeaturedProducts')}</p>
                <Button asChild className="mt-4">
                  <Link to="/products" aria-label={t('browseAllProducts')}>{t('browseAllProducts')}</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Index;
