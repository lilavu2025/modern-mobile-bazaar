
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, User, Phone, Shield, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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

interface EditUserDialogProps {
  user: UserProfile;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user }) => {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    phone: user.phone || '',
    user_type: user.user_type,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          user_type: formData.user_type,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('تم تحديث بيانات المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-users-extended'] });
      setOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('حدث خطأ في تحديث بيانات المستخدم');
    } finally {
      setLoading(false);
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

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'from-red-500 to-pink-500';
      case 'wholesale': return 'from-blue-500 to-purple-500';
      case 'retail': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-xs lg:text-sm h-8 lg:h-9">
          <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
          <span className="hidden lg:inline">تعديل</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-md lg:max-w-lg ${isRTL ? 'text-right' : 'text-left'} border-0 shadow-2xl max-h-[90vh] overflow-y-auto`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="text-center pb-4 lg:pb-6 space-y-3">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Edit className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <DialogTitle className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            تعديل بيانات المستخدم
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm lg:text-base">
            قم بتعديل معلومات المستخدم وحفظ التغييرات
          </DialogDescription>
        </DialogHeader>

        {/* User Info Display */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{user.full_name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <Badge className={`${getUserTypeColor(user.user_type)} bg-gradient-to-r text-white border-0 text-xs`}>
              <span className="ml-1">{getUserTypeIcon(user.user_type)}</span>
              {t(user.user_type)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs lg:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {format(new Date(user.created_at), 'PPP')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {user.email_confirmed_at ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">مؤكد</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600">غير مؤكد</span>
                </>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2 font-medium text-gray-700 text-sm lg:text-base">
              <User className="h-4 w-4" />
              الاسم الكامل
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="h-10 lg:h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg text-sm lg:text-base"
              placeholder="أدخل الاسم الكامل"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 font-medium text-gray-700 text-sm lg:text-base">
              <Phone className="h-4 w-4" />
              رقم الهاتف
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-10 lg:h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg text-sm lg:text-base"
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_type" className="flex items-center gap-2 font-medium text-gray-700 text-sm lg:text-base">
              <Shield className="h-4 w-4" />
              نوع المستخدم
            </Label>
            <Select
              value={formData.user_type}
              onValueChange={(value: 'admin' | 'wholesale' | 'retail') => 
                setFormData({ ...formData, user_type: value })
              }
            >
              <SelectTrigger className="h-10 lg:h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{getUserTypeIcon(formData.user_type)}</span>
                    <span>{t(formData.user_type)}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border-0 shadow-xl">
                <SelectItem value="retail" className="py-3 hover:bg-green-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🛒</span>
                    <div>
                      <div className="font-medium">تجزئة</div>
                      <div className="text-sm text-gray-500">عميل تجزئة عادي</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="wholesale" className="py-3 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏢</span>
                    <div>
                      <div className="font-medium">جملة</div>
                      <div className="text-sm text-gray-500">عميل جملة</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="admin" className="py-3 hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👑</span>
                    <div>
                      <div className="font-medium">مدير</div>
                      <div className="text-sm text-gray-500">مدير النظام</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className={`gap-3 pt-4 lg:pt-6 flex-col sm:flex-row ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="h-10 lg:h-11 px-6 border-2 hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto order-2 sm:order-1"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={`h-10 lg:h-11 px-6 bg-gradient-to-r ${getUserTypeColor(formData.user_type)} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-0 text-white w-full sm:w-auto order-1 sm:order-2`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري التحديث...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{getUserTypeIcon(formData.user_type)}</span>
                  حفظ التغييرات
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
