
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, XCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface UserStatsCardsProps {
  users: UserProfile[];
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ users }) => {
  const { t } = useLanguage();

  const statsCards = [
    {
      title: t('totalUsers'),
      value: users.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'المستخدمين المؤكدين',
      value: users.filter(user => user.email_confirmed_at).length,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'غير المؤكدين',
      value: users.filter(user => !user.email_confirmed_at).length,
      icon: XCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: t('adminUsers'),
      value: users.filter(user => user.user_type === 'admin').length,
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 lg:pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 line-clamp-2">{stat.title}</CardTitle>
              <div className={`p-1.5 lg:p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-3 w-3 lg:h-5 lg:w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`text-lg lg:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UserStatsCards;
