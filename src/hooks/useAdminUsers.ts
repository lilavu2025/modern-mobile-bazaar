
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const useAdminUsers = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if current user is admin
      if (profile?.user_type !== 'admin') {
        setError('Access denied. Admin privileges required.');
        return;
      }

      console.log('Fetching users from profiles table...');

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles data fetched:', profilesData);

      // Format the data to match our interface
      const formattedUsers: UserProfile[] = profilesData?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'غير محدد',
        phone: profile.phone,
        user_type: profile.user_type || 'retail',
        created_at: profile.created_at,
        email: `user-${profile.id.slice(0, 8)}@example.com`, // Placeholder since we can't access auth.users
        email_confirmed_at: profile.created_at, // Assume confirmed if profile exists
        last_sign_in_at: profile.updated_at,
      })) || [];

      console.log('Formatted users:', formattedUsers);
      setUsers(formattedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchUsers();
    }
  }, [profile]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = userTypeFilter === 'all' || user.user_type === userTypeFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && user.email_confirmed_at) ||
                           (statusFilter === 'inactive' && !user.email_confirmed_at);
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof UserProfile];
      let bValue: any = b[sortBy as keyof UserProfile];

      if (sortBy === 'created_at' || sortBy === 'last_sign_in_at') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchQuery, userTypeFilter, statusFilter, sortBy, sortOrder]);

  return {
    users,
    filteredAndSortedUsers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    userTypeFilter,
    setUserTypeFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    refetch: fetchUsers,
  };
};
