
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'wholesale' | 'retail' | 'confirmed' | 'unconfirmed'>('all');

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users-extended'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }

      const combinedUsers: UserProfile[] = authUsers.users.map(authUser => {
        const profile = profiles.find(p => p.id === authUser.id);
        return {
          id: authUser.id,
          full_name: profile?.full_name || authUser.user_metadata?.full_name || 'Unknown',
          phone: profile?.phone || authUser.user_metadata?.phone || null,
          user_type: profile?.user_type || 'retail',
          created_at: profile?.created_at || authUser.created_at,
          email: authUser.email,
          email_confirmed_at: authUser.email_confirmed_at,
          last_sign_in_at: authUser.last_sign_in_at,
        };
      });

      return combinedUsers;
    },
  });

  const filteredUsers = users.filter((user: UserProfile) => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = (() => {
      switch (filterType) {
        case 'confirmed':
          return !!user.email_confirmed_at;
        case 'unconfirmed':
          return !user.email_confirmed_at;
        case 'all':
          return true;
        default:
          return user.user_type === filterType;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">خطأ في تحميل بيانات المستخدمين</p>
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

      <UserStatsCards users={users} isLoading={isLoading} />
      
      <UserFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      <UsersTable users={filteredUsers} isLoading={isLoading} />
    </div>
  );
};

export default AdminUsers;
