
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import BannerCarousel from '@/components/BannerCarousel';
import CategoryCard from '@/components/CategoryCard';
import CartSidebar from '@/components/CartSidebar';
import { Button } from '@/components/ui/button';
import { useProducts, useCategories, useBanners } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: banners = [], isLoading: bannersLoading } = useBanners();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const featuredProducts = products.filter(product => product.featured).slice(0, 8);
  const filteredProducts = products.filter(product => 
    searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayProducts = searchQuery ? filteredProducts : featuredProducts;

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
                <Link to="/categories">{t('viewAll')}</Link>
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
                <Link to="/products">{t('viewAll')}</Link>
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
                  <Link to="/products">{t('browseAllProducts')}</Link>
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
