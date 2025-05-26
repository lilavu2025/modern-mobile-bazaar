
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash,
  Eye
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Sub-components for admin sections
const AdminOverview: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalProducts')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {t('activeProducts')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalOrders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {t('pendingOrders')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {t('registeredUsers')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 {t('currency')}</div>
            <p className="text-xs text-muted-foreground">
              {t('thisMonth')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminProducts: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('manageProducts')}</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addProduct')}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noProducts')}</h3>
            <p className="text-gray-500 mb-6">{t('addYourFirstProduct')}</p>
            <Button>
              {t('addProduct')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminOrders: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('manageOrders')}</h1>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOrders')}</h3>
            <p className="text-gray-500">{t('ordersWillAppearHere')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminUsers: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('manageUsers')}</h1>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noUsers')}</h3>
            <p className="text-gray-500">{t('usersWillAppearHere')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const sidebarItems = [
    { path: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/admin/products', label: t('manageProducts'), icon: Package },
    { path: '/admin/orders', label: t('manageOrders'), icon: ShoppingCart },
    { path: '/admin/users', label: t('manageUsers'), icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">م</span>
            </div>
            <div>
              <h2 className="font-bold">{t('storeName')}</h2>
              <p className="text-sm text-gray-500">{t('adminPanel')}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-sm text-gray-500">{t('admin')}</p>
              </div>
              <LanguageSwitcher />
            </div>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/">{t('backToStore')}</Link>
              </Button>
              <Button onClick={signOut} variant="ghost" className="w-full">
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/users" element={<AdminUsers />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
