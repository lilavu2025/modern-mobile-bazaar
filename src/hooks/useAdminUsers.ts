import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';

// تعريف الواجهة التي تمثل مستخدم النظام
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

// هوك مخصص لإدارة المستخدمين من قبل الأدمن
export const useAdminUsers = () => {
  const { profile } = useAuth();

  // حالة لتخزين جميع المستخدمين
  const [users, setUsers] = useState<UserProfile[]>([]);

  // حالة لتحديد ما إذا كانت البيانات قيد التحميل
  const [isLoading, setIsLoading] = useState(false);

  // حالة لتخزين الخطأ إن وُجد
  const [error, setError] = useState<string | null>(null);

  // حالات التحكم في الفلترة والفرز
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // دالة تحميل بيانات المستخدمين من Supabase
  const fetchUsers = useCallback(async () => {
    try {
      console.log('⏳ بدء تحميل بيانات المستخدمين...');
      setIsLoading(true);
      setError(null);

      // التحقق من أن المستخدم الحالي هو أدمن
      if (profile?.user_type !== 'admin') {
        const accessDeniedMsg = '🚫 صلاحيات غير كافية. يلزم أن تكون أدمن.';
        console.warn(accessDeniedMsg);
        setError(accessDeniedMsg);
        return;
      }

      // جلب جميع المستخدمين من جدول profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ خطأ في جلب البيانات من Supabase:', profilesError);
        throw profilesError;
      }

      console.log('✅ البيانات المسترجعة من Supabase:', profilesData);

      // تحويل البيانات إلى صيغة UserProfile
      const allUsers: UserProfile[] = [];

      profilesData?.forEach(profile => {
        allUsers.push({
          id: profile.id,
          full_name: profile.full_name || 'غير محدد',
          phone: profile.phone,
          user_type: profile.user_type || 'retail',
          created_at: profile.created_at,
          email: profile.email || 'غير محدد',
        });
      });

      console.log('📦 القائمة النهائية للمستخدمين:', allUsers);

      // تحديث الحالة
      setUsers(allUsers);
    } catch (err: unknown) {
      console.error('❌ فشل تحميل المستخدمين:', err);
      setError((err as Error).message || 'حدث خطأ أثناء تحميل المستخدمين');
    } finally {
      console.log('✅ الانتهاء من تحميل المستخدمين');
      setIsLoading(false);
    }
  }, [profile]);

  // تشغيل الدالة عند تحميل الصفحة أو عند تغير المستخدم الحالي
  useEffect(() => {
    if (profile) {
      fetchUsers();
    }
  }, [profile, fetchUsers]);

  // تصفية وفرز المستخدمين بحسب الحالات
  const filteredAndSortedUsers = useMemo(() => {
    console.log('🔍 تطبيق الفلاتر والفرز...');
    
    const filtered = users.filter(user => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        userTypeFilter === 'all' || user.user_type === userTypeFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.email_confirmed_at) ||
        (statusFilter === 'inactive' && !user.email_confirmed_at);

      return matchesSearch && matchesType && matchesStatus;
    });

    console.log('👥 عدد المستخدمين بعد الفلترة:', filtered.length);

    // تطبيق الفرز
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof UserProfile];
      let bValue = b[sortBy as keyof UserProfile];

      // التعامل مع التواريخ
      if (sortBy === 'created_at' || sortBy === 'last_sign_in_at') {
        aValue = new Date(aValue || 0).getTime().toString();
        bValue = new Date(bValue || 0).getTime().toString();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      return sortOrder === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });

    console.log('✅ الانتهاء من الفرز، عدد المستخدمين النهائي:', filtered.length);
    return filtered;
  }, [users, searchQuery, userTypeFilter, statusFilter, sortBy, sortOrder]);

  // القيم التي يتم إرجاعها من الهوك
  return {
    users,                         // جميع المستخدمين بدون فلترة
    filteredAndSortedUsers,       // المستخدمين بعد الفلترة والفرز
    isLoading,                    // هل البيانات قيد التحميل
    error,                        // هل يوجد خطأ
    searchQuery, setSearchQuery, // البحث
    userTypeFilter, setUserTypeFilter, // فلترة حسب نوع المستخدم
    statusFilter, setStatusFilter,     // فلترة حسب حالة التفعيل
    sortBy, setSortBy,                 // الترتيب حسب
    sortOrder, setSortOrder,          // ترتيب تصاعدي أو تنازلي
    refetch: fetchUsers,              // دالة إعادة تحميل البيانات
  };
};
