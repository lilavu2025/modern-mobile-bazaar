import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

// تعريف شكل العنوان Address
export interface Address {
  id?: string;
  user_id: string;
  full_name: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor?: string;
  apartment?: string;
  is_default?: boolean;
}

// هوك مخصص للتعامل مع العناوين المرتبطة بالمستخدم
export const useAddresses = () => {
  const { user } = useAuth(); // الحصول على المستخدم الحالي
  const { t } = useLanguage(); // الوصول للترجمة حسب اللغة المختارة
  const queryClient = useQueryClient(); // الوصول لكاش react-query

  // جلب العناوين الخاصة بالمستخدم
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses', user?.id], // المفتاح الفريد للكاش
    queryFn: async () => {
      console.log('[useAddresses] جلب العناوين للمستخدم:', user?.id);
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('[useAddresses] خطأ أثناء جلب العناوين:', error.message);
        throw error;
      }

      console.log('[useAddresses] العناوين المسترجعة:', data);
      return data;
    },
    enabled: !!user?.id, // يتم التفعيل فقط إذا كان المستخدم موجود
  });

  // إنشاء عنوان جديد
  const createAddressMutation = useMutation({
    mutationFn: async (address: Omit<Address, 'id' | 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('[useAddresses] إنشاء عنوان جديد:', address);

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...address,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('[useAddresses] خطأ أثناء إنشاء العنوان:', error.message);
        throw error;
      }

      console.log('[useAddresses] عنوان تم إنشاؤه:', data);
      return data;
    },
    onSuccess: () => {
      console.log('[useAddresses] إعادة تحميل العناوين بعد الإنشاء');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success(t('addressAdded'));
    },
    onError: (error: any) => {
      console.error('[useAddresses] خطأ عند الإنشاء:', error.message);
      toast.error(error.message);
    },
  });

  // تحديث عنوان موجود
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, ...address }: Address) => {
      console.log('[useAddresses] تحديث العنوان:', id, address);

      const { data, error } = await supabase
        .from('addresses')
        .update(address)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[useAddresses] خطأ أثناء تحديث العنوان:', error.message);
        throw error;
      }

      console.log('[useAddresses] تم تحديث العنوان:', data);
      return data;
    },
    onSuccess: () => {
      console.log('[useAddresses] إعادة تحميل العناوين بعد التحديث');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success(t('addressUpdated'));
    },
    onError: (error: any) => {
      console.error('[useAddresses] خطأ عند التحديث:', error.message);
      toast.error(error.message);
    },
  });

  // حذف عنوان
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('[useAddresses] حذف العنوان:', id);

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[useAddresses] خطأ أثناء حذف العنوان:', error.message);
        throw error;
      }

      console.log('[useAddresses] تم حذف العنوان بنجاح');
    },
    onSuccess: () => {
      console.log('[useAddresses] إعادة تحميل العناوين بعد الحذف');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success(t('addressDeleted'));
    },
    onError: (error: any) => {
      console.error('[useAddresses] خطأ عند الحذف:', error.message);
      toast.error(error.message);
    },
  });

  // القيم التي يتم إرجاعها من هذا الهوك
  return {
    addresses,                          // قائمة العناوين
    isLoading,                          // هل يتم تحميل البيانات الآن
    createAddress: createAddressMutation.mutate, // دالة إنشاء عنوان
    updateAddress: updateAddressMutation.mutate, // دالة تحديث عنوان
    deleteAddress: deleteAddressMutation.mutate, // دالة حذف عنوان
    isCreating: createAddressMutation.isPending, // هل يتم إنشاء عنوان حاليًا
    isUpdating: updateAddressMutation.isPending, // هل يتم تحديث عنوان حاليًا
    isDeleting: deleteAddressMutation.isPending, // هل يتم حذف عنوان حاليًا
  };
};
