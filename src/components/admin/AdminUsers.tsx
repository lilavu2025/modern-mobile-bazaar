
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import AdminUsersHeader from './users/AdminUsersHeader';
import UserStatsCards from './users/UserStatsCards';
import UserFilters from './users/UserFilters';
import UsersTable from './users/UsersTable';
import UserErrorDisplay from './users/UserErrorDisplay';

const AdminUsers: React.FC = () => {
  const { isRTL } = useLanguage();
  
  const {
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
    setSortOrder
  } = useAdminUsers();

  if (error) {
    return <UserErrorDisplay error={error} />;
  }

  return (
    <div className={`p-4 lg:p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <AdminUsersHeader />

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
