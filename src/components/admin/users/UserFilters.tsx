
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userTypeFilter: string;
  setUserTypeFilter: (type: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  userTypeFilter,
  setUserTypeFilter,
  statusFilter,
  setStatusFilter
}) => {
  const { isRTL } = useLanguage();

  return (
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
                className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} h-10 lg:h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors text-sm lg:text-base`}
              />
            </div>
          </div>
          
          {/* User Type Filter */}
          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger className="w-full lg:w-48 h-10 lg:h-11 border-2 border-gray-200 text-sm lg:text-base">
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
            <SelectTrigger className="w-full lg:w-48 h-10 lg:h-11 border-2 border-gray-200 text-sm lg:text-base">
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
  );
};

export default UserFilters;
