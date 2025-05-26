
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
  FolderOpen,
  Menu,
  X
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 ease-in-out bg-white shadow-2xl border-r border-gray-200 flex flex-col min-h-screen relative`}>
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`absolute -${isRTL ? 'left' : 'right'}-3 top-6 z-10 bg-white shadow-lg border rounded-full h-8 w-8 p-0 hover:bg-gray-50`}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <div className="p-6 flex-1">
            {/* Brand Section */}
            <div className={`flex items-center gap-4 mb-8 transition-all duration-300 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">م</span>
              </div>
              {sidebarOpen && (
                <div className="animate-fade-in">
                  <h2 className="font-bold text-lg text-gray-800">{t('storeName')}</h2>
                  <p className="text-sm text-gray-500">{t('adminPanel')}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-3">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-md ${
                      active
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    } ${!sidebarOpen && 'justify-center'}`}
                  >
                    <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? 'text-white' : ''}`} />
                    {sidebarOpen && (
                      <span className="font-medium animate-fade-in">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {sidebarOpen ? (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {profile?.full_name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{profile?.full_name}</p>
                      <p className="text-sm text-gray-500">{t('admin')}</p>
                    </div>
                  </div>
                  <LanguageSwitcher />
                </div>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full hover:bg-gray-100 transition-colors">
                    <Link to="/">{t('backToStore')}</Link>
                  </Button>
                  <Button onClick={signOut} variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors">
                    {t('logout')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {profile?.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <LanguageSwitcher />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<AdminDashboardStats />} />
              <Route path="/products" element={<AdminProducts />} />
              <Route path="/categories" element={<AdminCategories />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/users" element={<AdminUsers />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
