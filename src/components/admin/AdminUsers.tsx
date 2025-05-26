
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import EditUserDialog from './EditUserDialog';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  user_type: 'admin' | 'wholesale' | 'retail';
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: profile?.user_type === 'admin',
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
      case 'admin':
        return '👑';
      case 'wholesale':
        return '🏢';
      case 'retail':
        return '🛒';
      default:
        return '👤';
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
      title: t('retailUsers'),
      value: users.filter(user => user.user_type === 'retail').length,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: t('wholesaleUsers'),
      value: users.filter(user => user.user_type === 'wholesale').length,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: t('adminUsers'),
      value: users.filter(user => user.user_type === 'admin').length,
      icon: UserCheck,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className={`space-y-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {t('manageUsers')}
          </h1>
          <p className="text-gray-500 mt-2">إدارة وتحكم كامل في المستخدمين المسجلين</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-lg border">
          <Users className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-700">
            {users.length} {t('totalUsers')}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-2xl">
                    {stat.title === t('totalUsers') ? '👥' : 
                     stat.title === t('retailUsers') ? '🛒' :
                     stat.title === t('wholesaleUsers') ? '🏢' : '👑'}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Users Table */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
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
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noUsers')}</h3>
              <p className="text-gray-500">{t('usersWillAppearHere')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">{t('fullName')}</TableHead>
                    <TableHead className="font-semibold text-gray-700">{t('phone')}</TableHead>
                    <TableHead className="font-semibold text-gray-700">{t('userType')}</TableHead>
                    <TableHead className="font-semibold text-gray-700">{t('registrationDate')}</TableHead>
                    <TableHead className="font-semibold text-gray-700">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.full_name || t('notProvided')}
                            </div>
                            <div className="text-sm text-gray-500">#{index + 1}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📱</span>
                          <span className={user.phone ? 'text-gray-900' : 'text-gray-400 italic'}>
                            {user.phone || t('notProvided')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getUserTypeColor(user.user_type)} px-3 py-1 text-sm font-medium border-0`}>
                          <span className="ml-1">{getUserTypeIcon(user.user_type)}</span>
                          {t(user.user_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {format(new Date(user.created_at), 'PPP')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <EditUserDialog user={user} />
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
