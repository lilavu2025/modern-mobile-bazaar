
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
import { Edit, User, Phone, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  user_type: 'admin' | 'wholesale' | 'retail';
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

      toast.success(t('userUpdatedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t('errorUpdatingUser'));
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin':
        return '👑';
      case 'wholesale':
        return '🏢';
      case 'retail':
        return '🛒';
      default:
        return '👤';
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'from-red-500 to-pink-500';
      case 'wholesale':
        return 'from-blue-500 to-purple-500';
      case 'retail':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <Edit className="h-4 w-4 mr-1" />
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-md ${isRTL ? 'text-right' : 'text-left'} border-0 shadow-2xl`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Edit className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {t('editUser')}
          </DialogTitle>
          <DialogDescription className="text-gray-500 mt-2">
            {t('editUserInformation')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2 font-medium text-gray-700">
              <User className="h-4 w-4" />
              {t('fullName')}
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg"
              placeholder="أدخل الاسم الكامل"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 font-medium text-gray-700">
              <Phone className="h-4 w-4" />
              {t('phone')}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg"
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_type" className="flex items-center gap-2 font-medium text-gray-700">
              <Shield className="h-4 w-4" />
              {t('userType')}
            </Label>
            <Select
              value={formData.user_type}
              onValueChange={(value: 'admin' | 'wholesale' | 'retail') => 
                setFormData({ ...formData, user_type: value })
              }
            >
              <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg">
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
                      <div className="font-medium">{t('retail')}</div>
                      <div className="text-sm text-gray-500">عميل تجزئة عادي</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="wholesale" className="py-3 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏢</span>
                    <div>
                      <div className="font-medium">{t('wholesale')}</div>
                      <div className="text-sm text-gray-500">عميل جملة</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="admin" className="py-3 hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👑</span>
                    <div>
                      <div className="font-medium">{t('admin')}</div>
                      <div className="text-sm text-gray-500">مدير النظام</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className={`gap-3 pt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="h-11 px-6 border-2 hover:bg-gray-50 transition-all duration-200"
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={`h-11 px-6 bg-gradient-to-r ${getUserTypeColor(formData.user_type)} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-0 text-white`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('updating')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{getUserTypeIcon(formData.user_type)}</span>
                  {t('update')}
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
