import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/utils/languageContextUtils';
import UserDetailsDialog from './UserDetailsDialog';

const ACTION_LABELS: Record<string, string> = {
  disable: 'تعطيل',
  enable: 'تفعيل',
  delete: 'حذف',
};

type ProfileMap = Record<string, { full_name: string; email: string; phone: string | null } | undefined>;

interface UserActivityLog {
  id: string;
  admin_id: string;
  user_id: string;
  action: string;
  details: Json | null;
  created_at: string;
}

// تعريف UserProfile محلي لاستخدامه في تفاصيل المستخدم
interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  user_type: 'admin' | 'wholesale' | 'retail';
  created_at: string;
  updated_at: string; // <-- add this line to match required type
  email?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  last_order_date?: string;
  highest_order_value?: number;
  disabled?: boolean | null;
}

const UserActivityLogTable: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<UserActivityLog[]>([]);
  const [profileMap, setProfileMap] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string|null>(null);
  const [userDetails, setUserDetails] = useState<UserProfile|null>(null);

  useEffect(() => {
    const fetchLogsAndProfiles = async () => {
      setLoading(true);
      const { data: logsData, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error || !logsData) {
        setLoading(false);
        return;
      }
      setLogs(logsData);
      // اجمع كل الـ id المطلوبة
      const ids = Array.from(new Set(logsData.flatMap(l => [l.admin_id, l.user_id])));
      if (ids.length === 0) {
        setProfileMap({});
        setLoading(false);
        return;
      }
      // اجلب بيانات المستخدمين من profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,full_name,email,phone')
        .in('id', ids);
      const map: ProfileMap = {};
      profiles?.forEach(p => { map[p.id] = { full_name: p.full_name, email: p.email, phone: p.phone }; });
      // جلب بيانات المحذوفين إذا لم يوجدوا في profiles
      const missingIds = ids.filter(id => !map[id]);
      if (missingIds.length > 0) {
        const { data: deletedUsers } = await supabase
          .from('deleted_users')
          .select('user_id,full_name,email,phone')
          .in('user_id', missingIds);
        (deletedUsers as Array<{ user_id: string; full_name: string | null; email: string | null; phone: string | null }> | undefined)?.forEach(u => {
          map[u.user_id] = { full_name: u.full_name || 'مستخدم محذوف', email: u.email, phone: u.phone };
        });
      }
      setProfileMap(map);
      setLoading(false);
    };
    fetchLogsAndProfiles();
  }, []);

  // جلب تفاصيل المستخدم عند الضغط
  const handleUserDetails = async (userId: string) => {
    setSelectedUser(userId);
    // جرب أولاً من profiles
    let { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!data) {
      // إذا لم يوجد، جرب من deleted_users
      const { data: deleted } = await supabase.from('deleted_users').select('*').eq('user_id', userId).single();
      if (deleted) {
        data = {
          id: deleted.user_id,
          full_name: deleted.full_name || 'مستخدم محذوف',
          phone: deleted.phone,
          user_type: 'retail',
          last_sign_in_at: deleted.last_sign_in_at,
          created_at: deleted.deleted_at,
          updated_at: deleted.deleted_at, // تمرير updated_at دائماً
          email: deleted.email,
          disabled: true,
        };
      }
    } else {
      // إذا كان من profiles، مرر updated_at
      data.updated_at = data.updated_at || data.created_at || '';
    }
    setUserDetails(data);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{t('activityLog') || 'سجل نشاط الأدمن'}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-lg text-gray-500">{t('loadingData') || 'جاري التحميل...'}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-lg text-gray-500">{t('noResults') || 'لا يوجد نشاط'}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin')}</TableHead>
                  <TableHead>{t('user')}</TableHead>
                  <TableHead>{t('action')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  // استخراج بيانات المستخدم (الاسم والبريد) من profileMap أو details أو fallback
                  const userProfile = profileMap[log.user_id];
                  let displayName = userProfile?.full_name;
                  let displayEmail = userProfile?.email;
                  let displayPhone = userProfile?.phone;
                  // إذا لم يوجد في profileMap، جرب details
                  if ((!displayName || !displayEmail) && log.details && typeof log.details === 'object') {
                    const detailsObj = log.details as { full_name?: string; email?: string; phone?: string};
                    displayName = displayName || detailsObj.full_name;
                    displayEmail = displayEmail || detailsObj.email;
                    displayPhone = displayPhone || detailsObj.phone;
                  }
                  // fallback نهائي
                  if (!displayName) displayName = 'مستخدم غير متوفر';
                  if (!displayEmail) displayEmail = '';
                  if (!displayPhone) displayPhone = null;
                  // زر التفاصيل فقط إذا كان هناك اسم
                  const canShowDetails = !!displayName && displayName !== 'مستخدم غير متوفر';
                  return (
                    <TableRow key={log.id}>
                      {/* عمود الأدمن */}
                      <TableCell className="font-mono text-xs">
                        <span className="font-bold text-blue-700">{profileMap[log.admin_id]?.full_name || log.admin_id}</span>
                        {profileMap[log.admin_id]?.email && (
                          <div className="text-gray-400 text-[10px]">{profileMap[log.admin_id]?.email}</div>
                        )}
                        {profileMap[log.admin_id]?.phone && (
                          <div className="text-gray-400 text-[10px]">{profileMap[log.admin_id]?.phone}</div>
                        )}
                      </TableCell>
                      {/* عمود المستخدم */}
                      <TableCell className="font-mono text-xs">
                        {canShowDetails ? (
                          <button
                            className="text-blue-700 underline hover:text-blue-900 font-bold"
                            onClick={async () => {
                              if (userProfile) {
                                await handleUserDetails(log.user_id);
                              } else {
                                setUserDetails({
                                  id: log.user_id,
                                  full_name: displayName,
                                  phone: null,
                                  user_type: 'retail',
                                  created_at: '',
                                  updated_at: '', // إضافة الحقل المطلوب
                                  email: displayEmail,
                                  disabled: true,
                                });
                                setSelectedUser(log.user_id);
                              }
                            }}
                          >
                            {displayName}
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">{displayName}</span>
                        )}
                        {displayEmail && (
                          <div className="text-gray-400 text-[10px]">{displayEmail}</div>
                        )}
                        {displayPhone && (
                          <div className="text-gray-400 text-[10px]">{displayPhone}</div>
                        )}
                      </TableCell>
                      {/* عمود الإجراء */}
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.action === 'delete' ? 'bg-red-100 text-red-700' :
                          log.action === 'disable' ? 'bg-yellow-100 text-yellow-700' :
                          log.action === 'enable' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </TableCell>
                      
                      {/* عمود التاريخ */}
                      <TableCell className="text-right text-xs">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        {userDetails && (
          <UserDetailsDialog
            user={userDetails}
            open={!!selectedUser}
            onOpenChange={() => { setSelectedUser(null); setUserDetails(null); }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityLogTable;
