
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminUsersHeader: React.FC = () => {
  const { isRTL } = useLanguage();

  return (
    <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      <h1 className="text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        إدارة المستخدمين
      </h1>
      <p className="text-gray-600 text-sm lg:text-base">
        إدارة ومراقبة جميع المستخدمين المسجلين في النظام
      </p>
    </div>
  );
};

export default AdminUsersHeader;
