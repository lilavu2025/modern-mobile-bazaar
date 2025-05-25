
import React, { useState, useMemo } from 'react';
import { Sparkles, TrendingUp, Gift, Star } from 'lucide-react';
import Header from '@/components/Header';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import CartSidebar from '@/components/CartSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products, categories, banners } from '@/data/mockData';
import { Product } from '@/types';
import { Link } from 'react-router-dom';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Get featured products
  const featuredProducts = products.filter(product => product.featured).slice(0, 4);

  // Get new arrivals (last 4 products)
  const newArrivals = products.slice(-4);

  // Get best sellers (products with highest ratings)
  const bestSellers = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  const handleQuickView = (product: Product) => {
    console.log('Quick view:', product);
    // TODO: Implement quick view modal
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearchChange={setSearchQuery}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Banner */}
        <section className="animate-fade-in">
          <BannerCarousel banners={banners} />
        </section>

        {/* Search Results (if searching) */}
        {searchQuery && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold">نتائج البحث</h2>
              <Badge variant="secondary">
                {filteredProducts.length} منتج
              </Badge>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">لم يتم العثور على منتجات</p>
              </div>
            )}
          </section>
        )}

        {/* Content when not searching */}
        {!searchQuery && (
          <>
            {/* Categories */}
            <section className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  تصفح الأقسام
                </h2>
                <Button variant="outline" asChild>
                  <Link to="/categories">عرض الكل</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.slice(0, 6).map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>

            {/* Featured Products */}
            <section className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  المنتجات المميزة
                </h2>
                <Button variant="outline" asChild>
                  <Link to="/products?filter=featured">عرض الكل</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>
            </section>

            {/* New Arrivals */}
            <section className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Gift className="h-6 w-6 text-green-500" />
                  وصل حديثاً
                </h2>
                <Button variant="outline" asChild>
                  <Link to="/products?filter=new">عرض الكل</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>
            </section>

            {/* Best Sellers */}
            <section className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  الأكثر مبيعاً
                </h2>
                <Button variant="outline" asChild>
                  <Link to="/products?filter=bestsellers">عرض الكل</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>
            </section>

            {/* Special Offer Section */}
            <section className="animate-fade-in">
              <div className="hero-gradient rounded-2xl p-8 text-white text-center">
                <h2 className="text-3xl font-bold mb-4">عروض خاصة لفترة محدودة</h2>
                <p className="text-xl mb-6">خصم يصل إلى 50% على مجموعة مختارة من المنتجات</p>
                <Button size="lg" variant="secondary" className="font-semibold">
                  اكتشف العروض
                </Button>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">متجري</h3>
              <p className="text-gray-400">
                متجرك الإلكتروني المفضل للحصول على أفضل المنتجات بأفضل الأسعار
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">الأقسام</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/categories" className="hover:text-white">جميع الأقسام</Link></li>
                <li><Link to="/products" className="hover:text-white">المنتجات</Link></li>
                <li><Link to="/offers" className="hover:text-white">العروض</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">خدمة العملاء</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white">تواصل معنا</Link></li>
                <li><Link to="/help" className="hover:text-white">المساعدة</Link></li>
                <li><Link to="/returns" className="hover:text-white">سياسة الإرجاع</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">تابعنا</h4>
              <div className="flex gap-4">
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                  <span>ف</span>
                </Button>
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                  <span>ت</span>
                </Button>
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                  <span>إ</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 متجري. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
