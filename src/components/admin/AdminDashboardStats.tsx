
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Package, ShoppingCart, Users, BarChart3 } from 'lucide-react';

const AdminDashboardStats: React.FC = () => {
  const { t } = useLanguage();

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

  // Mock orders data for demonstration
  const ordersData = [
    { month: 'يناير', orders: 45, revenue: 12000 },
    { month: 'فبراير', orders: 52, revenue: 15000 },
    { month: 'مارس', orders: 48, revenue: 13500 },
    { month: 'أبريل', orders: 61, revenue: 18000 },
    { month: 'مايو', orders: 55, revenue: 16500 },
    { month: 'يونيو', orders: 67, revenue: 20000 },
  ];

  const chartConfig = {
    users: { label: t('users'), color: '#3b82f6' },
    products: { label: t('products'), color: '#10b981' },
    orders: { label: t('orders'), color: '#f59e0b' },
    revenue: { label: t('revenue'), color: '#ef4444' },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersStats.reduce((sum, stat) => sum + stat.value, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('registeredUsers')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
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
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalOrders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordersData[ordersData.length - 1]?.orders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('thisMonth')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('usersDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={usersStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
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
        <Card>
          <CardHeader>
            <CardTitle>{t('productsByCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={productsStats}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="inStock" fill="#10b981" name={t('inStock')} />
                <Bar dataKey="outOfStock" fill="#ef4444" name={t('outOfStock')} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('ordersAndRevenueTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={ordersData}>
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name={t('orders')}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name={t('revenue')}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t('newUserRegistered')}</p>
                <p className="text-xs text-muted-foreground">منذ 5 دقائق</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t('newOrderReceived')}</p>
                <p className="text-xs text-muted-foreground">منذ 15 دقيقة</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t('productOutOfStock')}</p>
                <p className="text-xs text-muted-foreground">منذ ساعة</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t('orderCancelled')}</p>
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
