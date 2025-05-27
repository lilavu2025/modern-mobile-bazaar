import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import { Badge } from '@/components/ui/badge';
import { Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useSupabaseData';
import { Link } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';

const Offers: React.FC = () => {
  const { t } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  // جلب العروض من قاعدة البيانات
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // تصفية العروض حسب البحث
  const filteredOffers = offers.filter(offer =>
    searchQuery === '' || 
    offer.title_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.title_en?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  function handleBuyNow(product) {
    addToCart(product, 1);
    setIsCartOpen(true);
  }

  function FavoriteButton({ productId }: { productId: string }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const fav = isFavorite(productId);
    return (
      <button
        type="button"
        aria-label="Favorite"
        className={`p-2 rounded-full border transition ${fav ? 'bg-red-100 text-red-600' : 'bg-white text-gray-400 hover:text-red-500'}`}
        onClick={e => {
          e.preventDefault();
          toggleFavorite(productId);
        }}
      >
        <Heart className="h-5 w-5" fill={fav ? '#ef4444' : 'none'} />
      </button>
    );
  }

  function ShareButton({ product }: { product: any }) {
    const { t } = useLanguage();
    const handleShare = async (e: React.MouseEvent) => {
      e.preventDefault();
      const url = window.location.origin + `/product/${product.id}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: product.name,
            text: product.description,
            url,
          });
        } catch {}
      } else {
        await navigator.clipboard.writeText(url);
        alert(t('linkCopied') || 'تم نسخ الرابط');
      }
    };
    return (
      <button
        type="button"
        aria-label="Share"
        className="p-2 rounded-full border bg-white text-gray-400 hover:text-blue-500 transition"
        onClick={handleShare}
      >
        <Share2 className="h-5 w-5" />
      </button>
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
          {filteredOffers.length > 0 && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {filteredOffers.length} {t('offers')}
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

        {/* Offers Grid */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOffersAvailable')}</h3>
            <p className="text-gray-500">{t('checkBackLater')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOffers.map(offer => (
              <div
                key={offer.id}
                className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center transition hover:shadow-lg group relative"
              >
                <img 
                  src={offer.image_url} 
                  alt={offer.title_ar || offer.title_en} 
                  className="w-full h-40 object-cover rounded mb-4 group-hover:scale-105 transition-transform duration-200" 
                />
                <h3 className="text-xl font-bold mb-2 text-center w-full truncate">
                  {offer.title_ar || offer.title_en}
                </h3>
                <p className="text-gray-600 mb-2 text-center w-full line-clamp-2">
                  {offer.description_ar || offer.description_en}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-primary">
                    {t('discount')}: {offer.discount_percent}%
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {t('validUntil')}: {new Date(offer.end_date).toLocaleDateString()}
                </div>
                <button
                  onClick={() => window.open('#', '_blank')}
                  className="mt-auto w-full bg-primary text-white rounded-lg py-2 font-bold hover:bg-primary/90 transition text-center block"
                >
                  {t('viewOffer')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Offers;
