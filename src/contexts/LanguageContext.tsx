
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en' | 'he';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    products: 'المنتجات',
    categories: 'الأقسام',
    offers: 'العروض',
    orders: 'طلباتي',
    contact: 'تواصل معنا',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    signup: 'إنشاء حساب',
    profile: 'الملف الشخصي',
    cart: 'السلة',
    checkout: 'إتمام الطلب',
    admin: 'لوحة الإدارة',
    
    // Common
    search: 'بحث',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    price: 'السعر',
    quantity: 'الكمية',
    total: 'المجموع',
    
    // Products
    productDetails: 'تفاصيل المنتج',
    addToCart: 'أضف للسلة',
    inStock: 'متوفر',
    outOfStock: 'غير متوفر',
    featured: 'مميز',
    discount: 'خصم',
    rating: 'التقييم',
    reviews: 'المراجعات',
    
    // Auth
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    
    // Orders
    orderNumber: 'رقم الطلب',
    orderDate: 'تاريخ الطلب',
    orderStatus: 'حالة الطلب',
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    
    // Admin
    dashboard: 'لوحة التحكم',
    manageProducts: 'إدارة المنتجات',
    manageOrders: 'إدارة الطلبات',
    manageUsers: 'إدارة المستخدمين',
    statistics: 'الإحصائيات',
    
    // Store name
    storeName: 'متجري',
    storeDescription: 'المتجر الإلكتروني'
  },
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    categories: 'Categories',
    offers: 'Offers',
    orders: 'My Orders',
    contact: 'Contact Us',
    login: 'Login',
    logout: 'Logout',
    signup: 'Sign Up',
    profile: 'Profile',
    cart: 'Cart',
    checkout: 'Checkout',
    admin: 'Admin Panel',
    
    // Common
    search: 'Search',
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    
    // Products
    productDetails: 'Product Details',
    addToCart: 'Add to Cart',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    featured: 'Featured',
    discount: 'Discount',
    rating: 'Rating',
    reviews: 'Reviews',
    
    // Auth
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    phone: 'Phone Number',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    
    // Orders
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    orderStatus: 'Order Status',
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    
    // Admin
    dashboard: 'Dashboard',
    manageProducts: 'Manage Products',
    manageOrders: 'Manage Orders',
    manageUsers: 'Manage Users',
    statistics: 'Statistics',
    
    // Store name
    storeName: 'My Store',
    storeDescription: 'E-commerce Store'
  },
  he: {
    // Navigation
    home: 'בית',
    products: 'מוצרים',
    categories: 'קטגוריות',
    offers: 'הצעות',
    orders: 'ההזמנות שלי',
    contact: 'צור קשר',
    login: 'התחברות',
    logout: 'התנתקות',
    signup: 'הרשמה',
    profile: 'פרופיל',
    cart: 'עגלה',
    checkout: 'תשלום',
    admin: 'פאנל ניהול',
    
    // Common
    search: 'חיפוש',
    loading: 'טוען...',
    error: 'אירעה שגיאה',
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    edit: 'ערוך',
    add: 'הוסף',
    back: 'חזור',
    next: 'הבא',
    previous: 'קודם',
    price: 'מחיר',
    quantity: 'כמות',
    total: 'סה"כ',
    
    // Products
    productDetails: 'פרטי מוצר',
    addToCart: 'הוסף לעגלה',
    inStock: 'במלאי',
    outOfStock: 'אזל המלאי',
    featured: 'מומלץ',
    discount: 'הנחה',
    rating: 'דירוג',
    reviews: 'ביקורות',
    
    // Auth
    email: 'אימייל',
    password: 'סיסמה',
    fullName: 'שם מלא',
    phone: 'מספר טלפון',
    confirmPassword: 'אשר סיסמה',
    forgotPassword: 'שכחת סיסמה?',
    
    // Orders
    orderNumber: 'מספר הזמנה',
    orderDate: 'תאריך הזמנה',
    orderStatus: 'סטטוס הזמנה',
    pending: 'ממתין',
    processing: 'בעיבוד',
    shipped: 'נשלח',
    delivered: 'נמסר',
    cancelled: 'בוטל',
    
    // Admin
    dashboard: 'לוח בקרה',
    manageProducts: 'ניהול מוצרים',
    manageOrders: 'ניהול הזמנות',
    manageUsers: 'ניהול משתמשים',
    statistics: 'סטטיסטיקות',
    
    // Store name
    storeName: 'החנות שלי',
    storeDescription: 'חנות אלקטרונית'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['ar', 'en', 'he'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' || language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const isRTL = language === 'ar' || language === 'he';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
