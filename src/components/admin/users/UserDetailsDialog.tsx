import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle, XCircle, Mail, Phone, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/utils/languageContextUtils';

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

interface UserDetailsDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ user, open, onOpenChange }) => {
  const { isRTL } = useLanguage();

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'wholesale':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
      case 'retail':
        return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">تفاصيل المستخدم</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{user.full_name}</h3>
                  <Badge className={`${getUserTypeColor(user.user_type)} mt-1`}>
                    <span className="ml-1">{getUserTypeIcon(user.user_type)}</span>
                    {user.user_type === 'admin' ? 'مدير' : user.user_type === 'wholesale' ? 'جملة' : 'تجزئة'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">المعرف:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {user.id.slice(0, 8)}...
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">الإيميل:</span>
                  <span className="text-sm">{user.email || 'غير متاح'}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">الهاتف:</span>
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">تاريخ التسجيل:</span>
                  <span className="text-sm">{format(new Date(user.created_at), 'PPP')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                حالة الحساب
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {user.email_confirmed_at ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">الإيميل مؤكد</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-600">الإيميل غير مؤكد</span>
                    </>
                  )}
                </div>
                
                {user.last_sign_in_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">آخر دخول:</span>
                    <span className="text-sm">{format(new Date(user.last_sign_in_at), 'PPp')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Statistics */}
          {(user.last_order_date || user.highest_order_value) && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">إحصائيات الطلبيات</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.last_order_date && (
                    <div>
                      <span className="text-sm text-gray-600">آخر طلبية:</span>
                      <div className="text-sm font-medium">
                        {format(new Date(user.last_order_date), 'PPP')}
                      </div>
                    </div>
                  )}
                  
                  {user.highest_order_value && (
                    <div>
                      <span className="text-sm text-gray-600">أكبر طلبية:</span>
                      <div className="text-sm font-medium">
                        {user.highest_order_value} ش.ج
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
