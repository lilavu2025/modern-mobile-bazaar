
import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, User, Heart, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchChange, onCartClick, onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems } = useCart();
  const { user, profile, signOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const location = useLocation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">م</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gradient">{t('storeName')}</h1>
                <p className="text-xs text-gray-500">{t('storeDescription')}</p>
              </div>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={handleSearchChange}
                className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-full border-2 border-gray-200 focus:border-primary`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-6 w-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -left-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce-in"
                >
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      {t('profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      {t('orders')}
                    </Link>
                  </DropdownMenuItem>
                  {profile?.is_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          {t('admin')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default">
                <Link to="/auth">{t('login')}</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 pb-4 border-t pt-4">
          <Link 
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive('/') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
            }`}
          >
            <Home className="h-4 w-4" />
            {t('home')}
          </Link>
          <Link 
            to="/products"
            className={`px-4 py-2 rounded-lg transition-colors ${
              isActive('/products') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
            }`}
          >
            {t('products')}
          </Link>
          <Link 
            to="/categories"
            className={`px-4 py-2 rounded-lg transition-colors ${
              isActive('/categories') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
            }`}
          >
            {t('categories')}
          </Link>
          <Link 
            to="/offers"
            className={`px-4 py-2 rounded-lg transition-colors ${
              isActive('/offers') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
            }`}
          >
            {t('offers')}
          </Link>
          {user && (
            <Link 
              to="/orders"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/orders') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
              }`}
            >
              {t('orders')}
            </Link>
          )}
          <Link 
            to="/contact"
            className={`px-4 py-2 rounded-lg transition-colors ${
              isActive('/contact') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
            }`}
          >
            {t('contact')}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
