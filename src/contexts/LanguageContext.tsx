
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
    view: 'عرض',
    filters: 'الفلاتر',
    clearFilters: 'مسح الفلاتر',
    category: 'القسم',
    allCategories: 'جميع الأقسام',
    sortBy: 'ترتيب حسب',
    default: 'افتراضي',
    newest: 'الأحدث',
    priceLowHigh: 'السعر: من الأقل للأكثر',
    priceHighLow: 'السعر: من الأكثر للأقل',
    topRated: 'الأعلى تقييماً',
    priceRange: 'نطاق السعر',
    min: 'الحد الأدنى',
    max: 'الحد الأقصى',
    noProductsFound: 'لا توجد منتجات',
    currency: 'ر.س',
    thisMonth: 'هذا الشهر',
    
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
    productName: 'اسم المنتج',
    productDescription: 'وصف المنتج',
    productImage: 'صورة المنتج',
    stockQuantity: 'كمية المخزون',
    originalPrice: 'السعر الأصلي',
    
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
    manageCategories: 'إدارة الأقسام',
    statistics: 'الإحصائيات',
    addProduct: 'إضافة منتج',
    addCategory: 'إضافة قسم',
    noProducts: 'لا توجد منتجات',
    noCategories: 'لا توجد أقسام',
    noOrders: 'لا توجد طلبات',
    noUsers: 'لا توجد مستخدمين',
    addYourFirstProduct: 'أضف منتجك الأول لتبدأ البيع',
    addYourFirstCategory: 'أضف قسمك الأول لتصنيف المنتجات',
    ordersWillAppearHere: 'ستظهر الطلبات هنا عندما يبدأ العملاء بالشراء',
    usersWillAppearHere: 'سيظهر المستخدمون هنا عند التسجيل',
    totalProducts: 'إجمالي المنتجات',
    totalOrders: 'إجمالي الطلبات',
    totalUsers: 'إجمالي المستخدمين',
    totalRevenue: 'إجمالي الإيرادات',
    activeProducts: 'منتجات نشطة',
    pendingOrders: 'طلبات معلقة',
    registeredUsers: 'مستخدمين مسجلين',
    adminPanel: 'لوحة الإدارة',
    backToStore: 'العودة للمتجر',
    categoryName: 'اسم القسم',
    categoryIcon: 'أيقونة القسم',
    categoryImage: 'صورة القسم',
    
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
    storeDescription: 'المتجر الإلكتروني',
    
    // Categories page
    browseProductCategories: 'تصفح أقسام المنتجات',
    noCategoriesFound: 'لا توجد أقسام'
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
    view: 'View',
    filters: 'Filters',
    clearFilters: 'Clear Filters',
    category: 'Category',
    allCategories: 'All Categories',
    sortBy: 'Sort By',
    default: 'Default',
    newest: 'Newest',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    topRated: 'Top Rated',
    priceRange: 'Price Range',
    min: 'Min',
    max: 'Max',
    noProductsFound: 'No products found',
    currency: 'SAR',
    thisMonth: 'This Month',
    
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
    productName: 'Product Name',
    productDescription: 'Product Description',
    productImage: 'Product Image',
    stockQuantity: 'Stock Quantity',
    originalPrice: 'Original Price',
    
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
    manageCategories: 'Manage Categories',
    statistics: 'Statistics',
    addProduct: 'Add Product',
    addCategory: 'Add Category',
    noProducts: 'No Products',
    noCategories: 'No Categories',
    noOrders: 'No Orders',
    noUsers: 'No Users',
    addYourFirstProduct: 'Add your first product to start selling',
    addYourFirstCategory: 'Add your first category to organize products',
    ordersWillAppearHere: 'Orders will appear here when customers start purchasing',
    usersWillAppearHere: 'Users will appear here when they register',
    totalProducts: 'Total Products',
    totalOrders: 'Total Orders',
    totalUsers: 'Total Users',
    totalRevenue: 'Total Revenue',
    activeProducts: 'Active Products',
    pendingOrders: 'Pending Orders',
    registeredUsers: 'Registered Users',
    adminPanel: 'Admin Panel',
    backToStore: 'Back to Store',
    categoryName: 'Category Name',
    categoryIcon: 'Category Icon',
    categoryImage: 'Category Image',
    
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
    storeDescription: 'E-commerce Store',
    
    // Categories page
    browseProductCategories: 'Browse product categories',
    noCategoriesFound: 'No categories found'
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
    view: 'צפה',
    filters: 'מסננים',
    clearFilters: 'נקה מסננים',
    category: 'קטגוריה',
    allCategories: 'כל הקטגוריות',
    sortBy: 'מיין לפי',
    default: 'ברירת מחדל',
    newest: 'החדש ביותר',
    priceLowHigh: 'מחיר: נמוך לגבוה',
    priceHighLow: 'מחיר: גבוה לנמוך',
    topRated: 'הכי מדורג',
    priceRange: 'טווח מחירים',
    min: 'מינימום',
    max: 'מקסימום',
    noProductsFound: 'לא נמצאו מוצרים',
    currency: 'ש"ח',
    thisMonth: 'החודש',
    
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
    productName: 'שם המוצר',
    productDescription: 'תיאור המוצר',
    productImage: 'תמונת המוצר',
    stockQuantity: 'כמות במלאי',
    originalPrice: 'מחיר מקורי',
    
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
    manageCategories: 'ניהול קטגוריות',
    statistics: 'סטטיסטיקות',
    addProduct: 'הוסף מוצר',
    addCategory: 'הוסף קטגוריה',
    noProducts: 'אין מוצרים',
    noCategories: 'אין קטגוריות',
    noOrders: 'אין הזמנות',
    noUsers: 'אין משתמשים',
    addYourFirstProduct: 'הוסף את המוצר הראשון שלך כדי להתחיל למכור',
    addYourFirstCategory: 'הוסף את הקטגוריה הראשונה שלך כדי לארגן מוצרים',
    ordersWillAppearHere: 'הזמנות יופיעו כאן כשלקוחות יתחילו לקנות',
    usersWillAppearHere: 'משתמשים יופיעו כאן כשיירשמו',
    totalProducts: 'סה"כ מוצרים',
    totalOrders: 'סה"כ הזמנות',
    totalUsers: 'סה"כ משתמשים',
    totalRevenue: 'סה"כ הכנסות',
    activeProducts: 'מוצרים פעילים',
    pendingOrders: 'הזמנות ממתינות',
    registeredUsers: 'משתמשים רשומים',
    adminPanel: 'פאנל ניהול',
    backToStore: 'חזור לחנות',
    categoryName: 'שם הקטגוריה',
    categoryIcon: 'אייקון קטגוריה',
    categoryImage: 'תמונת קטגוריה',
    
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
    storeDescription: 'חנות אלקטרונית',
    
    // Categories page
    browseProductCategories: 'עיין בקטגוריות המוצרים',
    noCategoriesFound: 'לא נמצאו קטגוריות'
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
