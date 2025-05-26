
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en' | 'he';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Store & Brand
    storeName: 'متجر المدينة',
    storeDescription: 'أفضل المنتجات بأفضل الأسعار',
    
    // Navigation
    home: 'الرئيسية',
    products: 'المنتجات',
    categories: 'الفئات',
    offers: 'العروض',
    contact: 'اتصل بنا',
    profile: 'الملف الشخصي',
    orders: 'الطلبات',
    dashboard: 'لوحة التحكم',
    checkout: 'الدفع',
    
    // Authentication
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    signupSuccess: 'تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني',
    loginError: 'خطأ في تسجيل الدخول',
    signupError: 'خطأ في إنشاء الحساب',
    passwordMismatch: 'كلمات المرور غير متطابقة',
    emailNotConfirmed: 'يرجى تأكيد بريدك الإلكتروني أولاً',
    
    // Email Confirmation
    confirmYourEmail: 'تأكيد البريد الإلكتروني',
    checkYourEmail: 'تحقق من بريدك الإلكتروني',
    sentConfirmationEmail: 'لقد أرسلنا رابط التأكيد إلى',
    clickLinkToConfirm: 'انقر على الرابط في البريد الإلكتروني لتأكيد حسابك',
    resendEmail: 'إعادة إرسال البريد',
    resendIn: 'إعادة الإرسال في ',
    seconds: ' ثانية',
    backToSignup: 'العودة إلى التسجيل',
    didntReceiveEmail: 'لم تستلم البريد الإلكتروني؟',
    checkSpamFolder: 'تحقق من مجلد الرسائل المزعجة',
    confirmationEmailResent: 'تم إعادة إرسال بريد التأكيد',
    resendEmailError: 'خطأ في إعادة إرسال البريد',
    verifyingEmail: 'جاري التحقق من البريد الإلكتروني...',
    emailConfirmed: 'تم تأكيد البريد الإلكتروني',
    confirmationFailed: 'فشل في التأكيد',
    emailConfirmedSuccess: 'تم تأكيد بريدك الإلكتروني بنجاح! أهلاً بك',
    emailConfirmationError: 'حدث خطأ في تأكيد البريد الإلكتروني',
    invalidConfirmationLink: 'رابط التأكيد غير صالح أو منتهي الصلاحية',
    redirectingToHome: 'جاري التوجه إلى الصفحة الرئيسية...',
    goToHome: 'الذهاب إلى الرئيسية',
    backToLogin: 'العودة إلى تسجيل الدخول',
    
    // Admin Panel
    adminDashboard: 'لوحة التحكم الإدارية',
    managementPanel: 'لوحة الإدارة',
    addProduct: 'إضافة منتج',
    editProduct: 'تعديل المنتج',
    deleteProduct: 'حذف المنتج',
    viewProduct: 'عرض المنتج',
    productName: 'اسم المنتج',
    productDescription: 'وصف المنتج',
    productPrice: 'سعر المنتج',
    productCategory: 'فئة المنتج',
    productImages: 'صور المنتج',
    uploadImages: 'رفع الصور',
    productDeleted: 'تم حذف المنتج',
    productDeletedSuccessfully: 'تم حذف المنتج بنجاح',
    errorDeletingProduct: 'خطأ في حذف المنتج',
    productAdded: 'تم إضافة المنتج',
    productUpdated: 'تم تحديث المنتج',
    registeredUsers: 'المستخدمون المسجلون',
    userManagement: 'إدارة المستخدمين',
    totalUsers: 'إجمالي المستخدمين',
    adminUsers: 'المدراء',
    wholesaleUsers: 'مستخدمو الجملة',
    retailUsers: 'مستخدمو التجزئة',
    recentUsers: 'المستخدمون الجدد',
    
    // Common
    success: 'نجح',
    error: 'خطأ',
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    searchProducts: 'البحث عن المنتجات...',
    searchResults: 'نتائج البحث',
    noProductsFound: 'لم يتم العثور على منتجات',
    viewAll: 'عرض الكل',
    featuredProducts: 'منتجات مميزة',
    noFeaturedProducts: 'لا توجد منتجات مميزة',
    browseAllProducts: 'تصفح جميع المنتجات',
    
    // Cart & Shopping
    addToCart: 'إضافة للسلة',
    cart: 'السلة',
    quantity: 'الكمية',
    price: 'السعر',
    total: 'المجموع',
    emptyCart: 'السلة فارغة',
    
    // Product
    newProduct: 'منتج جديد',
    relatedProducts: 'منتجات ذات صلة',
    productDetails: 'تفاصيل المنتج',
    inStock: 'متوفر',
    outOfStock: 'نفد المخزون',
    
    // User Management
    users: 'المستخدمين',
    userType: 'نوع المستخدم',
    admin: 'مدير',
    wholesale: 'جملة',
    retail: 'تجزئة',
    active: 'نشط',
    inactive: 'غير نشط',
    createdAt: 'تاريخ الإنشاء',
    lastLogin: 'آخر دخول',
    actions: 'الإجراءات',
    viewDetails: 'عرض التفاصيل',
    viewOrders: 'عرض الطلبات',
    noUsers: 'لا يوجد مستخدمين',
    userDetails: 'تفاصيل المستخدم',
    userOrders: 'طلبات المستخدم',
    noOrders: 'لا توجد طلبات',
    orderDate: 'تاريخ الطلب',
    orderStatus: 'حالة الطلب',
    orderTotal: 'مجموع الطلب',
    close: 'إغلاق'
  },
  en: {
    // Store & Brand
    storeName: 'City Store',
    storeDescription: 'Best products at best prices',
    
    // Navigation
    home: 'Home',
    products: 'Products',
    categories: 'Categories',
    offers: 'Offers',
    contact: 'Contact',
    profile: 'Profile',
    orders: 'Orders',
    dashboard: 'Admin Dashboard',
    checkout: 'Checkout',
    
    // Authentication
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    phone: 'Phone',
    loginSuccess: 'Login successful',
    signupSuccess: 'Account created successfully! Please confirm your email',
    loginError: 'Login error',
    signupError: 'Sign up error',
    passwordMismatch: 'Passwords do not match',
    emailNotConfirmed: 'Please confirm your email first',
    
    // Email Confirmation
    confirmYourEmail: 'Confirm Your Email',
    checkYourEmail: 'Check Your Email',
    sentConfirmationEmail: 'We sent a confirmation link to',
    clickLinkToConfirm: 'Click the link in the email to confirm your account',
    resendEmail: 'Resend Email',
    resendIn: 'Resend in ',
    seconds: ' seconds',
    backToSignup: 'Back to Sign Up',
    didntReceiveEmail: "Didn't receive the email?",
    checkSpamFolder: 'Check your spam folder',
    confirmationEmailResent: 'Confirmation email resent',
    resendEmailError: 'Error resending email',
    verifyingEmail: 'Verifying email...',
    emailConfirmed: 'Email Confirmed',
    confirmationFailed: 'Confirmation Failed',
    emailConfirmedSuccess: 'Your email has been confirmed successfully! Welcome',
    emailConfirmationError: 'Error confirming email',
    invalidConfirmationLink: 'Invalid or expired confirmation link',
    redirectingToHome: 'Redirecting to home page...',
    goToHome: 'Go to Home',
    backToLogin: 'Back to Login',
    
    // Admin Panel
    adminDashboard: 'Admin Dashboard',
    managementPanel: 'Management Panel',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    viewProduct: 'View Product',
    productName: 'Product Name',
    productDescription: 'Product Description',
    productPrice: 'Product Price',
    productCategory: 'Product Category',
    productImages: 'Product Images',
    uploadImages: 'Upload Images',
    productDeleted: 'Product Deleted',
    productDeletedSuccessfully: 'Product deleted successfully',
    errorDeletingProduct: 'Error deleting product',
    productAdded: 'Product Added',
    productUpdated: 'Product Updated',
    registeredUsers: 'Registered Users',
    userManagement: 'User Management',
    totalUsers: 'Total Users',
    adminUsers: 'Admin Users',
    wholesaleUsers: 'Wholesale Users',
    retailUsers: 'Retail Users',
    recentUsers: 'Recent Users',
    
    // Common
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    searchProducts: 'Search products...',
    searchResults: 'Search Results',
    noProductsFound: 'No products found',
    viewAll: 'View All',
    featuredProducts: 'Featured Products',
    noFeaturedProducts: 'No featured products',
    browseAllProducts: 'Browse All Products',
    
    // Cart & Shopping
    addToCart: 'Add to Cart',
    cart: 'Cart',
    quantity: 'Quantity',
    price: 'Price',
    total: 'Total',
    emptyCart: 'Cart is empty',
    
    // Product
    newProduct: 'New Product',
    relatedProducts: 'Related Products',
    productDetails: 'Product Details',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    
    // User Management
    users: 'Users',
    userType: 'User Type',
    admin: 'Admin',
    wholesale: 'Wholesale',
    retail: 'Retail',
    active: 'Active',
    inactive: 'Inactive',
    createdAt: 'Created At',
    lastLogin: 'Last Login',
    actions: 'Actions',
    viewDetails: 'View Details',
    viewOrders: 'View Orders',
    noUsers: 'No users found',
    userDetails: 'User Details',
    userOrders: 'User Orders',
    noOrders: 'No orders found',
    orderDate: 'Order Date',
    orderStatus: 'Order Status',
    orderTotal: 'Order Total',
    close: 'Close'
  },
  he: {
    // Store & Brand
    storeName: 'חנות העיר',
    storeDescription: 'המוצרים הטובים ביותר במחירים הטובים ביותר',
    
    // Navigation
    home: 'בית',
    products: 'מוצרים',
    categories: 'קטגוריות',
    offers: 'הצעות',
    contact: 'צור קשר',
    profile: 'פרופיל',
    orders: 'הזמנות',
    dashboard: 'לוח בקרה',
    checkout: 'תשלום',
    
    // Authentication
    login: 'התחברות',
    signup: 'הרשמה',
    logout: 'התנתקות',
    email: 'אימייל',
    password: 'סיסמה',
    confirmPassword: 'אשר סיסמה',
    fullName: 'שם מלא',
    phone: 'טלפון',
    loginSuccess: 'התחברות הצליחה',
    signupSuccess: 'החשבון נוצר בהצלחה! אנא אמת את האימייל שלך',
    loginError: 'שגיאה בהתחברות',
    signupError: 'שגיאה בהרשמה',
    passwordMismatch: 'הסיסמאות אינן תואמות',
    emailNotConfirmed: 'אנא אמת את האימייל שלך תחילה',
    
    // Email Confirmation
    confirmYourEmail: 'אמת את האימייל שלך',
    checkYourEmail: 'בדוק את האימייל שלך',
    sentConfirmationEmail: 'שלחנו קישור אימות ל',
    clickLinkToConfirm: 'לחץ על הקישור באימייל כדי לאמת את החשבון שלך',
    resendEmail: 'שלח שוב אימייל',
    resendIn: 'שלח שוב בעוד ',
    seconds: ' שניות',
    backToSignup: 'חזור להרשמה',
    didntReceiveEmail: 'לא קיבלת את האימייל?',
    checkSpamFolder: 'בדוק את תיקיית הספאם',
    confirmationEmailResent: 'אימייל האימות נשלח שוב',
    resendEmailError: 'שגיאה בשליחה חוזרת של האימייל',
    verifyingEmail: 'מאמת אימייל...',
    emailConfirmed: 'האימייל אומת',
    confirmationFailed: 'האימות נכשל',
    emailConfirmedSuccess: 'האימייל שלך אומת בהצלחה! ברוך הבא',
    emailConfirmationError: 'שגיאה באימות האימייל',
    invalidConfirmationLink: 'קישור אימות לא חוקי או פג תוקף',
    redirectingToHome: 'מעביר לעמוד הבית...',
    goToHome: 'עבור לבית',
    backToLogin: 'חזור להתחברות',
    
    // Admin Panel
    adminDashboard: 'לוח בקרה מנהל',
    managementPanel: 'לוח ניהול',
    addProduct: 'הוסף מוצר',
    editProduct: 'ערוך מוצר',
    deleteProduct: 'מחק מוצר',
    viewProduct: 'צפה במוצר',
    productName: 'שם המוצר',
    productDescription: 'תיאור המוצר',
    productPrice: 'מחיר המוצר',
    productCategory: 'קטגוריית המוצר',
    productImages: 'תמונות המוצר',
    uploadImages: 'העלה תמונות',
    productDeleted: 'המוצר נמחק',
    productDeletedSuccessfully: 'המוצר נמחק בהצלחה',
    errorDeletingProduct: 'שגיאה במחיקת המוצר',
    productAdded: 'המוצר נוסף',
    productUpdated: 'המוצר עודכן',
    registeredUsers: 'משתמשים רשומים',
    userManagement: 'ניהול משתמשים',
    totalUsers: 'סך המשתמשים',
    adminUsers: 'משתמשי מנהל',
    wholesaleUsers: 'משתמשי סיטונאות',
    retailUsers: 'משתמשי קמעונאות',
    recentUsers: 'משתמשים חדשים',
    
    // Common
    success: 'הצלחה',
    error: 'שגיאה',
    loading: 'טוען...',
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    edit: 'ערוך',
    add: 'הוסף',
    search: 'חיפוש',
    searchProducts: 'חפש מוצרים...',
    searchResults: 'תוצאות חיפוש',
    noProductsFound: 'לא נמצאו מוצרים',
    viewAll: 'צפה בהכל',
    featuredProducts: 'מוצרים מומלצים',
    noFeaturedProducts: 'אין מוצרים מומלצים',
    browseAllProducts: 'עיין בכל המוצרים',
    
    // Cart & Shopping
    addToCart: 'הוסף לעגלה',
    cart: 'עגלה',
    quantity: 'כמות',
    price: 'מחיר',
    total: 'סה"כ',
    emptyCart: 'העגלה ריקה',
    
    // Product
    newProduct: 'מוצר חדש',
    relatedProducts: 'מוצרים קשורים',
    productDetails: 'פרטי המוצר',
    inStock: 'במלאי',
    outOfStock: 'אזל מהמלאי',
    
    // User Management
    users: 'משתמשים',
    userType: 'סוג משתמש',
    admin: 'מנהל',
    wholesale: 'סיטונאי',
    retail: 'קמעונאי',
    active: 'פעיל',
    inactive: 'לא פעיל',
    createdAt: 'נוצר ב',
    lastLogin: 'התחברות אחרונה',
    actions: 'פעולות',
    viewDetails: 'צפה בפרטים',
    viewOrders: 'צפה בהזמנות',
    noUsers: 'לא נמצאו משתמשים',
    userDetails: 'פרטי משתמש',
    userOrders: 'הזמנות משתמש',
    noOrders: 'לא נמצאו הזמנות',
    orderDate: 'תאריך הזמנה',
    orderStatus: 'סטטוס הזמנה',
    orderTotal: 'סה"כ הזמנה',
    close: 'סגור'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const isRTL = language === 'ar' || language === 'he';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  const t = (key: string): string => {
    return translations[language]?.[key as keyof typeof translations.ar] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, isRTL, setLanguage, t }}>
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
