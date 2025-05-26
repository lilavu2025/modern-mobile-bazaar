
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, ShoppingCart, Minus, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts } from '@/hooks/useSupabaseData';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import QuantitySelector from '@/components/QuantitySelector';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { addToCart, buyNow, getItemQuantity } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { data: products = [], isLoading } = useProducts();

  const product = products.find(p => p.id === id);
  
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
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('productNotFound')}</h1>
          <Button asChild>
            <Link to="/">{t('backToHome')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const cartQuantity = getItemQuantity(product.id);
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const images = product.images || [product.image];

  const handleAddToCart = () => {
    console.log('Add to cart clicked with quantity:', quantity);
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    console.log('Buy now clicked with quantity:', quantity);
    buyNow(product, quantity);
  };

  const handleFavorite = () => {
    toggleFavorite(product.id);
  };

  const handleShare = () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: productUrl
      });
    } else {
      navigator.clipboard.writeText(productUrl);
      toast.success(t('linkCopied'));
    }
  };

  const isFav = isFavorite(product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearchChange={setSearchQuery}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary">{t('home')}</Link>
          <ArrowRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-primary">{t('products')}</Link>
          <ArrowRight className="h-4 w-4" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-white border">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              {product.discount && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  {t('discount')} {product.discount}%
                </Badge>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImage ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.nameEn}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="mr-2 font-semibold">{product.rating}</span>
              </div>
              <span className="text-gray-600">({product.reviews} {t('reviews')})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                {product.price} {t('currency')}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {product.originalPrice} {t('currency')}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.inStock ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {t('inStock')}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  {t('outOfStock')}
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">{t('productDescription')}</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity & Add to Cart */}
            {product.inStock && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('quantity')}</label>
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    max={99}
                    min={1}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {t('addToCart')}
                    {cartQuantity > 0 && (
                      <Badge variant="secondary" className="mr-2">
                        {cartQuantity}
                      </Badge>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleBuyNow}
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                  >
                    {t('buyNow')}
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className={`flex-1 ${isFav ? 'text-red-500' : ''}`}
                onClick={handleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="flex-1"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">{t('relatedProducts')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default ProductDetails;
