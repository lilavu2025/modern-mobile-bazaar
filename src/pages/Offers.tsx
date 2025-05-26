
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import { Badge } from '@/components/ui/badge';
import { Percent } from 'lucide-react';

const Offers: React.FC = () => {
  const { t } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading } = useProducts();

  // Filter products with discounts
  const discountedProducts = products
    .filter(product => product.discount && product.discount > 0)
    .filter(product => 
      searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.discount || 0) - (a.discount || 0));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">{t('loading')}</p>
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

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Percent className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('offers')}</h1>
          </div>
          <p className="text-gray-600 mb-6">
            {t('specialOffers')}
          </p>
          {discountedProducts.length > 0 && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {discountedProducts.length} {t('productsOnSale')}
            </Badge>
          )}
        </div>

        {/* Special Offers Banner */}
        {!searchQuery && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-8 text-white text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{t('limitedTimeOffers')}</h2>
            <p className="text-lg opacity-90">{t('dontMissOut')}</p>
          </div>
        )}

        {/* Products Grid */}
        {discountedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOffersAvailable')}</h3>
            <p className="text-gray-500">{t('checkBackLater')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {discountedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Offers;
