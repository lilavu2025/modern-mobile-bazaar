
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import UserStatsCards from './users/UserStatsCards';
import UserFilters from './users/UserFilters';
import UsersTable from './users/UsersTable';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  user_type: 'admin' | 'wholesale' | 'retail';
  created_at: string;
  email?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  last_order_date?: string;
  highest_order_value?: number;
}

const AdminUsers: React.FC = () => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users-extended'],
    queryFn: async () => {
      try {
        console.log('Fetching users data...');
        
        // First fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw new Error(`خطأ في تحميل بيانات المستخدمين: ${profilesError.message}`);
        }

        console.log('Profiles fetched:', profiles?.length);

        // Fetch order statistics for each user
        const { data: orderStats, error: orderStatsError } = await supabase
          .from('orders')
          .select('user_id, created_at, total')
          .order('created_at', { ascending: false });

        if (orderStatsError) {
          console.warn('Could not fetch order statistics:', orderStatsError);
        }

        // Process order statistics
        const userOrderStats: Record<string, { lastOrderDate?: string; highestOrderValue?: number }> = {};
        
        if (orderStats) {
          orderStats.forEach(order => {
            if (!userOrderStats[order.user_id]) {
              userOrderStats[order.user_id] = {};
            }
            
            // Set last order date (first one since they're ordered by date desc)
            if (!userOrderStats[order.user_id].lastOrderDate) {
              userOrderStats[order.user_id].lastOrderDate = order.created_at;
            }
            
            // Track highest order value
            const orderValue = Number(order.total);
            if (!userOrderStats[order.user_id].highestOrderValue || 
                orderValue > userOrderStats[order.user_id].highestOrderValue!) {
              userOrderStats[order.user_id].highestOrderValue = orderValue;
            }
          });
        }

        // Try to fetch auth users
        let authUsers = [];
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.warn('Cannot fetch auth users (admin privileges required):', authError);
            authUsers = [];
          } else {
            authUsers = authData.users || [];
          }
        } catch (authError) {
          console.warn('Auth users fetch failed:', authError);
          authUsers = [];
        }

        console.log('Auth users fetched:', authUsers.length);

        // Combine data
        const combinedUsers: UserProfile[] = profiles.map(profile => {
          const authUser = authUsers.find(au => au.id === profile.id);
          const orderData = userOrderStats[profile.id] || {};
          
          return {
            id: profile.id,
            full_name: profile.full_name || 'غير محدد',
            phone: profile.phone,
            user_type: profile.user_type || 'retail',
            created_at: profile.created_at,
            email: authUser?.email || 'غير متاح',
            email_confirmed_at: authUser?.email_confirmed_at,
            last_sign_in_at: authUser?.last_sign_in_at,
            last_order_date: orderData.lastOrderDate,
            highest_order_value: orderData.highestOrderValue,
          };
        });

        console.log('Combined users:', combinedUsers.length);
        return combinedUsers;
      } catch (error) {
        console.error('Error in users query:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user: UserProfile) => {
      const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (user.phone && user.phone.includes(searchQuery));
      
      const matchesUserType = userTypeFilter === 'all' || user.user_type === userTypeFilter;
      
      const matchesStatus = (() => {
        switch (statusFilter) {
          case 'confirmed':
            return !!user.email_confirmed_at;
          case 'unconfirmed':
            return !user.email_confirmed_at;
          case 'all':
          default:
            return true;
        }
      })();

      return matchesSearch && matchesUserType && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'last_order_date':
          aValue = a.last_order_date ? new Date(a.last_order_date) : new Date(0);
          bValue = b.last_order_date ? new Date(b.last_order_date) : new Date(0);
          break;
        case 'highest_order_value':
          aValue = a.highest_order_value || 0;
          bValue = b.highest_order_value || 0;
          break;
        case 'name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, userTypeFilter, statusFilter, sortBy, sortOrder]);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-red-800 font-semibold mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-red-600 text-sm mb-4">
            {error instanceof Error ? error.message : 'حدث خطأ غير متوقع'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 lg:p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          إدارة المستخدمين
        </h1>
        <p className="text-gray-600 text-sm lg:text-base">
          إدارة ومراقبة جميع المستخدمين المسجلين في النظام
        </p>
      </div>

      <div className="space-y-6">
        <UserStatsCards users={users} />
        
        <UserFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userTypeFilter={userTypeFilter}
          setUserTypeFilter={setUserTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <UsersTable users={filteredAndSortedUsers} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AdminUsers;
