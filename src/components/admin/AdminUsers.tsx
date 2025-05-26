
import React, { useState } from 'react';
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
}

const AdminUsers: React.FC = () => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

        // Try to fetch auth users (this might fail if user doesn't have admin privileges)
        let authUsers = [];
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.warn('Cannot fetch auth users (admin privileges required):', authError);
            // If we can't fetch auth users, just use profiles data
            authUsers = [];
          } else {
            authUsers = authData.users || [];
          }
        } catch (authError) {
          console.warn('Auth users fetch failed:', authError);
          authUsers = [];
        }

        console.log('Auth users fetched:', authUsers.length);

        // Combine data - prioritize profiles, supplement with auth data if available
        const combinedUsers: UserProfile[] = profiles.map(profile => {
          const authUser = authUsers.find(au => au.id === profile.id);
          return {
            id: profile.id,
            full_name: profile.full_name || 'غير محدد',
            phone: profile.phone,
            user_type: profile.user_type || 'retail',
            created_at: profile.created_at,
            email: authUser?.email || 'غير متاح',
            email_confirmed_at: authUser?.email_confirmed_at,
            last_sign_in_at: authUser?.last_sign_in_at,
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

  const filteredUsers = users.filter((user: UserProfile) => {
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
        />

        <UsersTable users={filteredUsers} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AdminUsers;
