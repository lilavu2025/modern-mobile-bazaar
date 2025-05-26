
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
import { Edit } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-md ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('editUser')}</DialogTitle>
          <DialogDescription>
            {t('editUserInformation')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">{t('fullName')}</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_type">{t('userType')}</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value: 'admin' | 'wholesale' | 'retail') => 
                setFormData({ ...formData, user_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">{t('retail')}</SelectItem>
                <SelectItem value="wholesale">{t('wholesale')}</SelectItem>
                <SelectItem value="admin">{t('admin')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('updating') : t('update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
