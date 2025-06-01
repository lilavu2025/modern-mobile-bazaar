import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Mail, Phone, Calendar, CheckCircle, XCircle, Eye, ShoppingBag, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/utils/languageContextUtils';
import EditUserDialog from '../EditUserDialog';
import UserDetailsDialog from './UserDetailsDialog';
import UserOrdersDialog from './UserOrdersDialog';
import { useAdminUsers } from '@/hooks/useAdminUsers';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  user_type: 'admin' | 'wholesale' | 'retail';
  created_at: string;
  updated_at: string; // إضافة الحقل المطلوب لحل الخطأ
  email?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  last_order_date?: string;
  highest_order_value?: number;
  disabled?: boolean | null;
}

interface UserTableRowProps {
  user: UserProfile;
  index: number;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, index }) => {
  const { t } = useLanguage();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const { disableUser, deleteUser } = useAdminUsers();
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleViewDetails = () => {
    setShowDetailsDialog(true);
  };

  const handleViewOrders = () => {
    setShowOrdersDialog(true);
  };

  return (
    <>
      <TableRow className={`hover:bg-gray-50 transition-colors duration-200 ${user.disabled ? 'opacity-50 bg-red-50' : ''}`}>
        <TableCell className="font-medium p-2 lg:p-4">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm flex-shrink-0">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 text-xs lg:text-sm truncate">
                {user.full_name || t('notProvided')}
              </div>
              <div className="text-xs text-gray-500">#{index + 1}</div>
            </div>
          </div>
        </TableCell>
        
        <TableCell className="p-2 lg:p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 lg:gap-2">
              <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs lg:text-sm text-gray-600 truncate">
                {user.email}
              </span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-1 lg:gap-2">
                <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs lg:text-sm text-gray-600">{user.phone}</span>
              </div>
            )}
          </div>
        </TableCell>
        
        <TableCell className="p-2 lg:p-4">
          <Badge className={`${getUserTypeColor(user.user_type)} px-2 lg:px-3 py-1 text-xs font-medium border-0`}>
            <span className="ml-1">{getUserTypeIcon(user.user_type)}</span>
            {t(user.user_type)}
          </Badge>
        </TableCell>
        
        <TableCell className="p-2 lg:p-4">
          <div className="flex items-center gap-1 lg:gap-2">
            <EditUserDialog user={user} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 lg:h-8 lg:w-8 p-0">
                  <MoreVertical className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewDetails} className="text-xs lg:text-sm cursor-pointer">
                  <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                  {t('viewDetails')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewOrders} className="text-xs lg:text-sm cursor-pointer">
                  <ShoppingBag className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                  {t('viewOrders')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setActionLoading(true);
                    await disableUser(user.id, !user.disabled);
                    setActionLoading(false);
                  }}
                  className={`text-xs lg:text-sm cursor-pointer ${user.disabled ? 'text-green-600' : 'text-yellow-600'}`}
                >
                  {user.disabled ? t('enableUser') || 'تفعيل المستخدم' : t('disableUser') || 'تعطيل المستخدم'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    if (window.confirm(t('confirmDeleteUser') || 'هل أنت متأكد من حذف المستخدم؟')) {
                      setActionLoading(true);
                      await deleteUser(user.id);
                      setActionLoading(false);
                    }
                  }}
                  className="text-xs lg:text-sm cursor-pointer text-red-600"
                >
                  {t('deleteUser') || 'حذف المستخدم'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      {/* Dialogs */}
      <UserDetailsDialog 
        user={user} 
        open={showDetailsDialog} 
        onOpenChange={setShowDetailsDialog} 
      />
      <UserOrdersDialog 
        user={user} 
        open={showOrdersDialog} 
        onOpenChange={setShowOrdersDialog} 
      />
    </>
  );
};

export default UserTableRow;
