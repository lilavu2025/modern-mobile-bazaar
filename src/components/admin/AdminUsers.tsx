
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';
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
  raw_app_meta_data?: any;
  raw_user_meta_data?: any;
}

const AdminUsers: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: users = [], isLoading } = useQuery({
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

  return (
    <div className={`space-y-4 lg:space-y-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {t('manageUsers')}
          </h1>
          <p className="text-gray-500 mt-2 text-sm lg:text-base">إدارة وتحكم كامل في المستخدمين المسجلين</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl px-3 lg:px-4 py-2 shadow-lg border">
          <Users className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
          <span className="text-sm lg:text-lg font-semibold text-gray-700">
            {filteredUsers.length} {t('totalUsers')}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards users={users} />

      {/* Filters */}
      <UserFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userTypeFilter={userTypeFilter}
        setUserTypeFilter={setUserTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      
      {/* Users Table */}
      <UsersTable users={filteredUsers} isLoading={isLoading} />
    </div>
  );
};

export default AdminUsers;
