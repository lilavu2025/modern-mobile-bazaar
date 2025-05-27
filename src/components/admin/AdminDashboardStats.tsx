import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Package, ShoppingCart, Users, BarChart3 } from 'lucide-react';

const AdminDashboardStats: React.FC = () => {
  const { t } = useLanguage();
  const [isUsersExpanded, setIsUsersExpanded] = useState(false);
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(false);

  // Fetch users statistics
  const { data: usersStats = [] } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, created_at');

      if (error) throw error;

      const usersByType = data.reduce((acc: any, user) => {
        acc[user.user_type] = (acc[user.user_type] || 0) + 1;
        return acc;
      }, {});

      return [
        { name: t('admin'), value: usersByType.admin || 0, color: '#ef4444' },
        { name: t('wholesale'), value: usersByType.wholesale || 0, color: '#3b82f6' },
        { name: t('retail'), value: usersByType.retail || 0, color: '#10b981' },
      ];
    },
  });

  // Fetch products statistics
  const { data: productsStats = [] } = useQuery({
    queryKey: ['admin-products-stats'],
    queryFn: async () => {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('category_id, in_stock, active');

      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name_ar, name_en');

      if (productsError || categoriesError) throw productsError || categoriesError;

      const productsByCategory = products.reduce((acc: any, product) => {
        const category = categories.find(cat => cat.id === product.category_id);
        const categoryName = category?.name_ar || 'غير محدد';
        
        if (!acc[categoryName]) {
          acc[categoryName] = { total: 0, inStock: 0, outOfStock: 0 };
        }
        
        acc[categoryName].total += 1;
        if (product.in_stock) {
          acc[categoryName].inStock += 1;
        } else {
          acc[categoryName].outOfStock += 1;
        }
        
        return acc;
      }, {});

      return Object.entries(productsByCategory).map(([name, stats]: [string, any]) => ({
        name,
        total: stats.total,
        inStock: stats.inStock,
        outOfStock: stats.outOfStock,
      }));
    },
  });

  // Mock orders data
  const ordersData = [
    { month: 'يناير', orders: 45, revenue: 12000 },
    { month: 'فبراير', orders: 52, revenue: 15000 },
    { month: 'مارس', orders: 48, revenue: 13500 },
    { month: 'أبريل', orders: 61, revenue: 18000 },
    { month: 'مايو', orders: 55, revenue: 16500 },
    { month: 'يونيو', orders: 67, revenue: 20000 },
  ];

  // Order status statistics
  const orderStatusStats = [
    { status: 'open', label: t('openOrders'), value: 12, color: '#3b82f6' },
    { status: 'processing', label: t('processingOrders'), value: 8, color: '#f59e0b' },
    { status: 'ready', label: t('readyOrders'), value: 4, color: '#10b981' },
    { status: 'cancelled', label: t('cancelledOrders'), value: 2, color: '#ef4444' },
  ];

  const chartConfig = {
    users: { label: t('users'), color: '#3b82f6' },
    products: { label: t('products'), color: '#10b981' },
    orders: { label: t('orders'), color: '#f59e0b' },
    revenue: { label: t('revenue'), color: '#ef4444' },
    inStock: { label: t('inStock'), color: '#10b981' },
    outOfStock: { label: t('outOfStock'), color: '#ef4444' },
    admin: { label: t('admin'), color: '#ef4444' },
    wholesale: { label: t('wholesale'), color: '#3b82f6' },
    retail: { label: t('retail'), color: '#10b981' },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setIsUsersExpanded(!isUsersExpanded)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {!isUsersExpanded ? (
              <>
                <div className="text-2xl font-bold">
                  {usersStats.reduce((sum, stat) => sum + stat.value, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('registeredUsers')}
                </p>
              </>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {usersStats.map((stat) => (
                  <div 
                    key={stat.name} 
                    className="rounded-lg border bg-card p-2 text-center hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-[0.9rem] font-medium">{stat.name}</div>
                    <div className="text-xl font-bold mt-1">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalProducts')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productsStats.reduce((sum, stat) => sum + stat.total, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('activeProducts')}
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalOrders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {!isOrdersExpanded ? (
              <>
                <div className="text-2xl font-bold">
                  {ordersData[ordersData.length - 1]?.orders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('thisMonth')}
                </p>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {orderStatusStats.map((stat) => (
                  <div 
                    key={stat.status} 
                    className="rounded-lg border bg-card p-2 text-center hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-[0.9rem] font-medium">{stat.label}</div>
                    <div className="text-xl font-bold mt-1" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordersData[ordersData.length - 1]?.revenue.toLocaleString() || 0} {t('currency')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('thisMonth')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Users Distribution Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('usersDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <PieChart>
                <Pie
                  data={usersStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {usersStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Products by Category Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('productsByCategory')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <BarChart data={productsStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="inStock" fill="#10b981" name={t('inStock')} />
                <Bar dataKey="outOfStock" fill="#ef4444" name={t('outOfStock')} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Orders Trend Chart */}
        <Card className="xl:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('ordersAndRevenueTrend')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <LineChart data={ordersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name={t('orders')}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name={t('revenue')}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4">
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t('newUserRegistered')}</p>
                <p className="text-xs text-muted-foreground">منذ 5 دقائق</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t('newOrderReceived')}</p>
                <p className="text-xs text-muted-foreground">منذ 15 دقيقة</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t('productOutOfStock')}</p>
                <p className="text-xs text-muted-foreground">منذ ساعة</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t('orderCancelled')}</p>
                <p className="text-xs text-muted-foreground">منذ ساعتين</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardStats;