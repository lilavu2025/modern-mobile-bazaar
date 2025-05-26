
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('manageUsers')}</h1>
      
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noUsers')}</h3>
            <p className="text-gray-500">{t('usersWillAppearHere')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
