
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Mail, Phone, Calendar, CheckCircle, XCircle, Eye, ShoppingBag, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import EditUserDialog from '../EditUserDialog';
import UserDetailsDialog from './UserDetailsDialog';
import UserOrdersDialog from './UserOrdersDialog';

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

interface UserTableRowProps {
  user: UserProfile;
  index: number;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, index }) => {
  const { t } = useLanguage();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);

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
      <TableRow className="hover:bg-gray-50 transition-colors duration-200">
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
            {user.email_confirmed_at ? (
              <>
                <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
                <span className="text-xs lg:text-sm text-green-600 font-medium">{t('confirmed')}</span>
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 lg:h-4 lg:w-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs lg:text-sm text-orange-600 font-medium">{t('unconfirmed')}</span>
              </>
            )}
          </div>
        </TableCell>
        
        <TableCell className="hidden lg:table-cell p-2 lg:p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              {format(new Date(user.created_at), 'PPP')}
            </span>
          </div>
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
