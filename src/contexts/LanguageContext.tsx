
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    categories: 'الفئات',
    products: 'المنتجات',
    offers: 'العروض',
    contact: 'اتصل بنا',
    orders: 'الطلبات',
    profile: 'الملف الشخصي',
    
    // Auth
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    
    // Products
    addToCart: 'أضف للسلة',
    viewDetails: 'عرض التفاصيل',
    price: 'السعر',
    currency: 'ش.ج',
    inStock: 'متوفر',
    outOfStock: 'غير متوفر',
    
    // Cart
    cart: 'السلة',
    quantity: 'الكمية',
    total: 'المجموع',
    checkout: 'الدفع',
    
    // Admin
    dashboard: 'لوحة التحكم',
    adminPanel: 'لوحة الإدارة',
    manageProducts: 'إدارة المنتجات',
    manageCategories: 'إدارة الفئات',
    manageOrders: 'إدارة الطلبات',
    manageUsers: 'إدارة المستخدمين',
    addProduct: 'إضافة منتج',
    addCategory: 'إضافة فئة',
    admin: 'مدير',
    backToStore: 'العودة للمتجر',
    
    // Product Form
    productName: 'اسم المنتج',
    productDescription: 'وصف المنتج',
    productImage: 'صورة المنتج',
    retailPrice: 'سعر التجزئة',
    wholesalePrice: 'سعر الجملة',
    originalPrice: 'السعر الأصلي',
    category: 'الفئة',
    selectCategory: 'اختر الفئة',
    stockQuantity: 'كمية المخزون',
    
    // Category Form
    categoryName: 'اسم الفئة',
    categoryImage: 'صورة الفئة',
    categoryIcon: 'أيقونة الفئة',
    
    // Actions
    save: 'حفظ',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    view: 'عرض',
    actions: 'العمليات',
    
    // Messages
    productAddedSuccessfully: 'تم إضافة المنتج بنجاح',
    categoryAddedSuccessfully: 'تم إضافة الفئة بنجاح',
    errorAddingProduct: 'خطأ في إضافة المنتج',
    errorAddingCategory: 'خطأ في إضافة الفئة',
    productNotFound: 'المنتج غير موجود',
    backToHome: 'العودة للرئيسية',
    loading: 'جاري التحميل...',
    
    // Stats
    totalProducts: 'إجمالي المنتجات',
    totalOrders: 'إجمالي الطلبات',
    totalUsers: 'إجمالي المستخدمين',
    totalRevenue: 'إجمالي الإيرادات',
    activeProducts: 'المنتجات النشطة',
    pendingOrders: 'الطلبات المعلقة',
    registeredUsers: 'المستخدمين المسجلين',
    thisMonth: 'هذا الشهر',
    
    // Empty States
    noProducts: 'لا توجد منتجات',
    noCategories: 'لا توجد فئات',
    noOrders: 'لا توجد طلبات',
    noUsers: 'لا يوجد مستخدمون',
    addYourFirstProduct: 'أضف منتجك الأول',
    addYourFirstCategory: 'أضف فئتك الأولى',
    ordersWillAppearHere: 'ستظهر الطلبات هنا',
    usersWillAppearHere: 'سيظهر المستخدمون هنا',
    noCategoriesFound: 'لم يتم العثور على فئات',
    browseProductCategories: 'تصفح فئات المنتجات',
    
    // Store
    storeName: 'متجري',
    
    // Additional translations
    productCount: 'عدد المنتجات',
    searchPlaceholder: 'ابحث عن المنتجات...',
    removeFromCart: 'إزالة من السلة',
    cartEmpty: 'السلة فارغة',
    continueShopping: 'متابعة التسوق',
    orderNumber: 'رقم الطلب',
    orderStatus: 'حالة الطلب',
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
    trackYourOrders: 'تتبع طلباتك',
    noOrdersDescription: 'لم تقم بأي طلبات بعد',
    startShopping: 'ابدأ التسوق',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقدا',
    card: 'بطاقة ائتمانية'
  },
  
  en: {
    // Navigation
    home: 'Home',
    categories: 'Categories',
    products: 'Products',
    offers: 'Offers',
    contact: 'Contact',
    orders: 'Orders',
    profile: 'Profile',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    phone: 'Phone',
    
    // Products
    addToCart: 'Add to Cart',
    viewDetails: 'View Details',
    price: 'Price',
    currency: 'ILS',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    
    // Cart
    cart: 'Cart',
    quantity: 'Quantity',
    total: 'Total',
    checkout: 'Checkout',
    
    // Admin
    dashboard: 'Dashboard',
    adminPanel: 'Admin Panel',
    manageProducts: 'Manage Products',
    manageCategories: 'Manage Categories',
    manageOrders: 'Manage Orders',
    manageUsers: 'Manage Users',
    addProduct: 'Add Product',
    addCategory: 'Add Category',
    admin: 'Admin',
    backToStore: 'Back to Store',
    
    // Product Form
    productName: 'Product Name',
    productDescription: 'Product Description',
    productImage: 'Product Image',
    retailPrice: 'Retail Price',
    wholesalePrice: 'Wholesale Price',
    originalPrice: 'Original Price',
    category: 'Category',
    selectCategory: 'Select Category',
    stockQuantity: 'Stock Quantity',
    
    // Category Form
    categoryName: 'Category Name',
    categoryImage: 'Category Image',
    categoryIcon: 'Category Icon',
    
    // Actions
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    actions: 'Actions',
    
    // Messages
    productAddedSuccessfully: 'Product added successfully',
    categoryAddedSuccessfully: 'Category added successfully',
    errorAddingProduct: 'Error adding product',
    errorAddingCategory: 'Error adding category',
    productNotFound: 'Product not found',
    backToHome: 'Back to Home',
    loading: 'Loading...',
    
    // Stats
    totalProducts: 'Total Products',
    totalOrders: 'Total Orders',
    totalUsers: 'Total Users',
    totalRevenue: 'Total Revenue',
    activeProducts: 'Active Products',
    pendingOrders: 'Pending Orders',
    registeredUsers: 'Registered Users',
    thisMonth: 'This Month',
    
    // Empty States
    noProducts: 'No Products',
    noCategories: 'No Categories',
    noOrders: 'No Orders',
    noUsers: 'No Users',
    addYourFirstProduct: 'Add your first product',
    addYourFirstCategory: 'Add your first category',
    ordersWillAppearHere: 'Orders will appear here',
    usersWillAppearHere: 'Users will appear here',
    noCategoriesFound: 'No categories found',
    browseProductCategories: 'Browse product categories',
    
    // Store
    storeName: 'My Store',
    
    // Additional translations
    productCount: 'Product Count',
    searchPlaceholder: 'Search products...',
    removeFromCart: 'Remove from Cart',
    cartEmpty: 'Cart is empty',
    continueShopping: 'Continue Shopping',
    orderNumber: 'Order Number',
    orderStatus: 'Order Status',
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    trackYourOrders: 'Track your orders',
    noOrdersDescription: 'You haven\'t placed any orders yet',
    startShopping: 'Start Shopping',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Credit Card'
  },
  
  he: {
    // Navigation
    home: 'בית',
    categories: 'קטגוריות',
    products: 'מוצרים',
    offers: 'הצעות',
    contact: 'צור קשר',
    orders: 'הזמנות',
    profile: 'פרופיל',
    
    // Auth
    signIn: 'התחברות',
    signUp: 'הרשמה',
    logout: 'התנתקות',
    email: 'אימייל',
    password: 'סיסמה',
    fullName: 'שם מלא',
    phone: 'טלפון',
    
    // Products
    addToCart: 'הוסף לעגלה',
    viewDetails: 'הצג פרטים',
    price: 'מחיר',
    currency: 'ש"ח',
    inStock: 'במלאי',
    outOfStock: 'אזל מהמלאי',
    
    // Cart
    cart: 'עגלה',
    quantity: 'כמות',
    total: 'סך הכל',
    checkout: 'תשלום',
    
    // Admin
    dashboard: 'לוח בקרה',
    adminPanel: 'פאנל ניהול',
    manageProducts: 'ניהול מוצרים',
    manageCategories: 'ניהול קטגוריות',
    manageOrders: 'ניהול הזמנות',
    manageUsers: 'ניהול משתמשים',
    addProduct: 'הוסף מוצר',
    addCategory: 'הוסף קטגוריה',
    admin: 'מנהל',
    backToStore: 'חזור לחנות',
    
    // Product Form
    productName: 'שם המוצר',
    productDescription: 'תיאור המוצר',
    productImage: 'תמונת המוצר',
    retailPrice: 'מחיר קמעונאי',
    wholesalePrice: 'מחיר סיטונאי',
    originalPrice: 'מחיר מקורי',
    category: 'קטגוריה',
    selectCategory: 'בחר קטגוריה',
    stockQuantity: 'כמות במלאי',
    
    // Category Form
    categoryName: 'שם הקטגוריה',
    categoryImage: 'תמונת הקטגוריה',
    categoryIcon: 'אייקון הקטגוריה',
    
    // Actions
    save: 'שמור',
    saving: 'שומר...',
    cancel: 'ביטול',
    edit: 'ערוך',
    delete: 'מחק',
    view: 'הצג',
    actions: 'פעולות',
    
    // Messages
    productAddedSuccessfully: 'המוצר נוסף בהצלחה',
    categoryAddedSuccessfully: 'הקטגוריה נוספה בהצלחה',
    errorAddingProduct: 'שגיאה בהוספת המוצר',
    errorAddingCategory: 'שגיאה בהוספת הקטגוריה',
    productNotFound: 'המוצר לא נמצא',
    backToHome: 'חזור לבית',
    loading: 'טוען...',
    
    // Stats
    totalProducts: 'סך המוצרים',
    totalOrders: 'סך ההזמנות',
    totalUsers: 'סך המשתמשים',
    totalRevenue: 'סך ההכנסות',
    activeProducts: 'מוצרים פעילים',
    pendingOrders: 'הזמנות ממתינות',
    registeredUsers: 'משתמשים רשומים',
    thisMonth: 'החודש',
    
    // Empty States
    noProducts: 'אין מוצרים',
    noCategories: 'אין קטגוריות',
    noOrders: 'אין הזמנות',
    noUsers: 'אין משתמשים',
    addYourFirstProduct: 'הוסף את המוצר הראשון שלך',
    addYourFirstCategory: 'הוסף את הקטגוריה הראשונה שלך',
    ordersWillAppearHere: 'הזמנות יופיעו כאן',
    usersWillAppearHere: 'משתמשים יופיעו כאן',
    noCategoriesFound: 'לא נמצאו קטגוריות',
    browseProductCategories: 'עיין בקטגוריות מוצרים',
    
    // Store
    storeName: 'החנות שלי',
    
    // Additional translations
    productCount: 'מספר מוצרים',
    searchPlaceholder: 'חפש מוצרים...',
    removeFromCart: 'הסר מהעגלה',
    cartEmpty: 'העגלה ריקה',
    continueShopping: 'המשך לקנות',
    orderNumber: 'מספר הזמנה',
    orderStatus: 'סטטוס הזמנה',
    pending: 'ממתין',
    processing: 'בעיבוד',
    shipped: 'נשלח',
    delivered: 'נמסר',
    cancelled: 'בוטל',
    trackYourOrders: 'עקוב אחר הזמנותיך',
    noOrdersDescription: 'עדיין לא ביצעת הזמנות',
    startShopping: 'התחל לקנות',
    paymentMethod: 'אמצעי תשלום',
    cash: 'מזומן',
    card: 'כרטיס אשראי'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
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
