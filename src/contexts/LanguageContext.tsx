
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
    success: 'نجح',
    
    // Products
    productDetails: 'تفاصيل المنتج',
    addToCart: 'أضف للسلة',
    inStock: 'متوفر',
    outOfStock: 'غير متوفر',
    featured: 'مميز',
    discount: 'خصم',
    rating: 'التقييم',
    reviews: 'المراجعات',
    wholesalePrice: 'سعر الجملة',
    retailPrice: 'سعر المفرق',
    
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
    
    // User Types
    userType: 'نوع المستخدم',
    accountType: 'نوع الحساب',
    wholesale: 'جملة',
    retail: 'مفرق',
    
    // Profile
    accountInfo: 'معلومات الحساب',
    settings: 'الإعدادات',
    profileInfo: 'معلومات الملف الشخصي',
    addresses: 'العناوين',
    savedAddresses: 'العناوين المحفوظة',
    addAddress: 'إضافة عنوان',
    noAddressesSaved: 'لا توجد عناوين محفوظة',
    profileUpdated: 'تم تحديث الملف الشخصي',
    updateProfile: 'تحديث الملف الشخصي',
    emailCannotBeChanged: 'لا يمكن تغيير البريد الإلكتروني',
    notProvided: 'غير محدد',
    manageYourAccount: 'إدارة حسابك ومعلوماتك الشخصية',
    
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
    success: 'Success',
    
    // Products
    productDetails: 'Product Details',
    addToCart: 'Add to Cart',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    featured: 'Featured',
    discount: 'Discount',
    rating: 'Rating',
    reviews: 'Reviews',
    wholesalePrice: 'Wholesale Price',
    retailPrice: 'Retail Price',
    
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
    
    // User Types
    userType: 'User Type',
    accountType: 'Account Type',
    wholesale: 'Wholesale',
    retail: 'Retail',
    
    // Profile
    accountInfo: 'Account Information',
    settings: 'Settings',
    profileInfo: 'Profile Information',
    addresses: 'Addresses',
    savedAddresses: 'Saved Addresses',
    addAddress: 'Add Address',
    noAddressesSaved: 'No addresses saved',
    profileUpdated: 'Profile updated successfully',
    updateProfile: 'Update Profile',
    emailCannotBeChanged: 'Email cannot be changed',
    notProvided: 'Not provided',
    manageYourAccount: 'Manage your account and personal information',
    
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
    success: 'הצלחה',
    
    // Products
    productDetails: 'פרטי מוצר',
    addToCart: 'הוסף לעגלה',
    inStock: 'במלאי',
    outOfStock: 'אזל המלאי',
    featured: 'מומלץ',
    discount: 'הנחה',
    rating: 'דירוג',
    reviews: 'ביקורות',
    wholesalePrice: 'מחיר סיטונאי',
    retailPrice: 'מחיר קמעונאי',
    
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
    
    // User Types
    userType: 'סוג משתמש',
    accountType: 'סוג חשבון',
    wholesale: 'סיטונאי',
    retail: 'קמעונאי',
    
    // Profile
    accountInfo: 'פרטי חשבון',
    settings: 'הגדרות',
    profileInfo: 'פרטי פרופיל',
    addresses: 'כתובות',
    savedAddresses: 'כתובות שמורות',
    addAddress: 'הוסף כתובת',
    noAddressesSaved: 'אין כתובות שמורות',
    profileUpdated: 'הפרופיל עודכן בהצלחה',
    updateProfile: 'עדכן פרופיל',
    emailCannotBeChanged: 'לא ניתן לשנות אימייל',
    notProvided: 'לא צוין',
    manageYourAccount: 'נהל את החשבון והמידע האישי שלך',
    
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
