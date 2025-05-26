
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Search, 
  Mail, 
  Phone, 
  ShoppingBag,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import EditUserDialog from './EditUserDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  user_type: 'admin' | 'wholesale' | 'retail';
  created_at: string;
  email?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  raw_app_meta_data?: any;
  raw_user_meta_data?: any;
}

const AdminUsers: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users-extended'],
    queryFn: async () => {
      // First get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get auth users (only admins can access this)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        console.warn('Could not fetch auth users:', authError);
        // Return profiles with basic info if auth admin access fails
        return profiles.map(profile => ({
          ...profile,
          email: 'غير متوفر',
          email_confirmed_at: null,
          last_sign_in_at: null,
        })) as UserProfile[];
      }

      // Merge profiles with auth data
      const mergedUsers = profiles.map(profile => {
        const authUser = authUsers.users.find(user => user.id === profile.id);
        return {
          ...profile,
          email: authUser?.email || 'غير متوفر',
          email_confirmed_at: authUser?.email_confirmed_at || null,
          last_sign_in_at: authUser?.last_sign_in_at || null,
          raw_app_meta_data: authUser?.app_metadata || {},
          raw_user_meta_data: authUser?.user_metadata || {},
        };
      }) as UserProfile[];

      // Also add any auth users that don't have profiles
      const profileIds = profiles.map(p => p.id);
      const usersWithoutProfiles = authUsers.users
        .filter(user => !profileIds.includes(user.id))
        .map(user => ({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم غير مسمى',
          phone: user.user_metadata?.phone || null,
          user_type: 'retail' as const,
          created_at: user.created_at,
          email: user.email || '',
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          raw_app_meta_data: user.app_metadata || {},
          raw_user_meta_data: user.user_metadata || {},
        }));

      return [...mergedUsers, ...usersWithoutProfiles];
    },
    enabled: profile?.user_type === 'admin',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone?.includes(searchQuery);
    
    const matchesType = userTypeFilter === 'all' || user.user_type === userTypeFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'confirmed' && user.email_confirmed_at) ||
                         (statusFilter === 'unconfirmed' && !user.email_confirmed_at);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg';
      case 'wholesale':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg';
      case 'retail':
        return 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin': return '👑';
      case 'wholesale': return '🏢';
      case 'retail': return '🛒';
      default: return '👤';
    }
  };

  if (profile?.user_type !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🚫</span>
        </div>
        <p className="text-red-500 text-lg font-medium">{t('accessDenied')}</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: t('totalUsers'),
      value: users.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'المستخدمين المؤكدين',
      value: users.filter(user => user.email_confirmed_at).length,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'غير المؤكدين',
      value: users.filter(user => !user.email_confirmed_at).length,
      icon: XCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: t('adminUsers'),
      value: users.filter(user => user.user_type === 'admin').length,
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className={`space-y-6 lg:space-y-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {t('manageUsers')}
          </h1>
          <p className="text-gray-500 mt-2 text-sm lg:text-base">إدارة وتحكم كامل في المستخدمين المسجلين</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-lg border">
          <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
          <span className="text-base lg:text-lg font-semibold text-gray-700">
            {filteredUsers.length} {t('totalUsers')}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 lg:pb-3">
                <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 line-clamp-2">{stat.title}</CardTitle>
                <div className={`p-1.5 lg:p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-3 w-3 lg:h-5 lg:w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`text-lg lg:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder="البحث بالاسم، الإيميل، أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors`}
                />
              </div>
            </div>
            
            {/* User Type Filter */}
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-full lg:w-48 h-11 border-2 border-gray-200">
                <SelectValue placeholder="نوع المستخدم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="wholesale">جملة</SelectItem>
                <SelectItem value="retail">تجزئة</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48 h-11 border-2 border-gray-200">
                <SelectValue placeholder="حالة التأكيد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="unconfirmed">غير مؤكد</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Users Table */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            {t('registeredUsers')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">جاري تحميل البيانات...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">جرب تغيير معايير البحث أو الفلاتر</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 text-xs lg:text-sm">المستخدم</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs lg:text-sm">الاتصال</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs lg:text-sm">النوع</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs lg:text-sm">الحالة</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs lg:text-sm hidden lg:table-cell">تاريخ التسجيل</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs lg:text-sm">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 text-xs lg:text-sm truncate">
                              {user.full_name || t('notProvided')}
                            </div>
                            <div className="text-xs text-gray-500">#{index + 1}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-xs lg:text-sm text-gray-600 truncate max-w-32 lg:max-w-none">
                              {user.email}
                            </span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-xs lg:text-sm text-gray-600">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`${getUserTypeColor(user.user_type)} px-2 lg:px-3 py-1 text-xs font-medium border-0`}>
                          <span className="ml-1">{getUserTypeIcon(user.user_type)}</span>
                          {t(user.user_type)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.email_confirmed_at ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-xs lg:text-sm text-green-600 font-medium">مؤكد</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-4 w-4 text-orange-500" />
                              <span className="text-xs lg:text-sm text-orange-600 font-medium">غير مؤكد</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {format(new Date(user.created_at), 'PPP')}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EditUserDialog user={user} />
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                عرض الطلبيات
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
