
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
  Eye,
  FolderOpen
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const sidebarItems = [
    { path: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/admin/products', label: t('manageProducts'), icon: Package },
    { path: '/admin/categories', label: t('manageCategories'), icon: FolderOpen },
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
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 flex-1">
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
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
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

        <div className="p-6 border-t">
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

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<AdminDashboardStats />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/users" element={<AdminUsers />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
