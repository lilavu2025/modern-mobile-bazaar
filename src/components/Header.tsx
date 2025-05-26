
import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, User, Heart, Home, LogOut, X } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
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

  const navigationItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/products', label: t('products') },
    { path: '/categories', label: t('categories') },
    { path: '/offers', label: t('offers') },
    ...(user ? [{ path: '/orders', label: t('orders') }] : []),
    { path: '/contact', label: t('contact') },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 sm:py-4 gap-2">
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">م</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-800">{t('storeName')}</h1>
                      <p className="text-sm text-gray-500">{t('storeDescription')}</p>
                    </div>
                  </Link>
                </div>
                
                <nav className="flex-1 p-6">
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </nav>

                <div className="p-6 border-t bg-gray-50">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {profile?.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{profile?.full_name}</p>
                          <p className="text-sm text-gray-500">{t(profile?.user_type || 'user')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                            <User className="h-4 w-4 mr-2" />
                            {t('profile')}
                          </Link>
                        </Button>
                        
                        {profile?.user_type === 'admin' && (
                          <Button asChild variant="outline" className="w-full justify-start">
                            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                              {t('admin')}
                            </Link>
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }} 
                          variant="ghost" 
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('logout')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button asChild variant="default" className="w-full">
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        {t('login')}
                      </Link>
                    </Button>
                  )}
                  
                  <div className="mt-4 flex justify-center">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-xl">م</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gradient">{t('storeName')}</h1>
              <p className="text-xs text-gray-500 hidden lg:block">{t('storeDescription')}</p>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={handleSearchChange}
                className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} h-11 rounded-full border-2 border-gray-200 focus:border-primary text-base`}
              />
            </div>
          </div>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden h-10 w-10"
          >
            {showMobileSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            
            <Button variant="ghost" size="icon" className="relative h-10 w-10 hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCartClick}
              className="relative h-10 w-10"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce-in"
                >
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 hidden md:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white z-50 w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      {t('profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      {t('orders')}
                    </Link>
                  </DropdownMenuItem>
                  {profile?.user_type === 'admin' && (
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
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="hidden md:flex">
                <Link to="/auth">{t('login')}</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden pb-3 animate-fade-in">
            <div className="relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={handleSearchChange}
                className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} h-12 rounded-full border-2 border-gray-200 focus:border-primary text-base`}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4 pb-4 border-t pt-4 overflow-x-auto">
          {navigationItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm lg:text-base ${
                isActive(item.path) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
