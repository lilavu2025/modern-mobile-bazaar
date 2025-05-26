
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
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    loginError: 'فشل في تسجيل الدخول',
    signupSuccess: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني.',
    signupError: 'فشل في إنشاء الحساب',
    passwordMismatch: 'كلمات المرور غير متطابقة',
    
    // Products
    addToCart: 'أضف للسلة',
    viewDetails: 'عرض التفاصيل',
    price: 'السعر',
    currency: '₪',
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
    storeDescription: 'تطبيق متجر متكامل مع إدارة شاملة',
    
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
    cash: 'نقداً',
    card: 'بطاقة ائتمانية',
    
    // Featured products
    featuredProducts: 'المنتجات المميزة',
    viewAll: 'عرض الكل',
    noFeaturedProducts: 'لا توجد منتجات مميزة',
    browseAllProducts: 'تصفح جميع المنتجات',
    search: 'بحث',
    buyNow: 'اشتر الآن',
    limitedTimeOffers: 'عروض لفترة محدودة',
    dontMissOut: 'لا تفوت الفرصة',
    noOffersAvailable: 'لا توجد عروض متاحة',
    checkBackLater: 'تحقق مرة أخرى لاحقاً',
    address: 'العنوان',
    workingHours: 'ساعات العمل',
    sendMessage: 'إرسال رسالة',
    settings: 'الإعدادات',
    profileInfo: 'معلومات الملف الشخصي',
    addresses: 'العناوين',
    accountInfo: 'معلومات الحساب',
    accountType: 'نوع الحساب',
    emailCannotBeChanged: 'لا يمكن تغيير البريد الإلكتروني',
    manageYourAccount: 'إدارة حسابك',
    savedAddresses: 'العناوين المحفوظة',
    addAddress: 'إضافة عنوان',
    noAddressesSaved: 'لا توجد عناوين محفوظة',
    filters: 'المرشحات',
    allCategories: 'جميع الفئات',
    sortBy: 'ترتيب حسب',
    default: 'افتراضي',
    newest: 'الأحدث',
    priceLowHigh: 'السعر من الأقل للأعلى',
    priceHighLow: 'السعر من الأعلى للأقل',
    topRated: 'الأعلى تقييماً',
    priceRange: 'نطاق السعر',
    min: 'الحد الأدنى',
    max: 'الحد الأقصى',
    clearFilters: 'مسح المرشحات',
    discoverMore: 'اكتشف المزيد',
    product: 'منتج',
    shoppingCart: 'سلة التسوق',
    emptyCart: 'السلة فارغة',
    noProductsAdded: 'لم تقم بإضافة أي منتجات بعد',
    browseProducts: 'تصفح المنتجات',
    userType: 'نوع المستخدم',
    wholesale: 'جملة',
    retail: 'تجزئة',
    
    // Toast messages
    cartUpdated: 'تم تحديث السلة',
    quantityIncreased: 'تم زيادة الكمية',
    productAdded: 'تم إضافة المنتج',
    productAddedToCart: 'تم إضافة المنتج للسلة',
    productRemoved: 'تم إزالة المنتج',
    productRemovedFromCart: 'تم إزالة المنتج من السلة',
    cartCleared: 'تم مسح السلة',
    allProductsRemoved: 'تم إزالة جميع المنتجات',
    
    // Search and results
    searchResults: 'نتائج البحث',
    noProductsFound: 'لم يتم العثور على منتجات',
    success: 'نجح',
    error: 'خطأ',
    profileUpdated: 'تم تحديث الملف الشخصي',
    updateProfile: 'تحديث الملف الشخصي',
    notProvided: 'غير محدد',
    
    // User management specific
    userDetails: 'تفاصيل المستخدم',
    userOrders: 'طلبيات المستخدم',
    userInfo: 'معلومات المستخدم',
    registrationDate: 'تاريخ التسجيل',
    lastOrderDate: 'تاريخ آخر طلبية',
    highestOrderValue: 'أعلى قيمة طلبية',
    orderDate: 'تاريخ الطلبية',
    orderValue: 'قيمة الطلبية',
    orderItems: 'عناصر الطلبية',
    noOrdersForUser: 'لا توجد طلبيات لهذا المستخدم',
    userId: 'معرف المستخدم',
    joinedDate: 'تاريخ الانضمام',
    orderCount: 'عدد الطلبيات',
    totalSpent: 'إجمالي المبلغ المنفق',
    
    // Additional admin translations
    userManagement: 'إدارة المستخدمين',
    usersOverview: 'نظرة عامة على المستخدمين',
    filterUsers: 'تصفية المستخدمين',
    sortUsers: 'ترتيب المستخدمين',
    byName: 'حسب الاسم',
    byEmail: 'حسب البريد الإلكتروني',
    byRegistrationDate: 'حسب تاريخ التسجيل',
    byLastOrderDate: 'حسب تاريخ آخر طلبية',
    byHighestOrderValue: 'حسب أعلى قيمة طلبية',
    ascending: 'تصاعدي',
    descending: 'تنازلي',
    
    // Page not found
    pageNotFound: 'الصفحة غير موجودة',
    pageNotFoundDescription: 'عذراً، الصفحة التي تبحث عنها غير موجودة',
    goHome: 'العودة للرئيسية',
    
    // Contact page
    contactUs: 'اتصل بنا',
    getInTouch: 'تواصل معنا',
    name: 'الاسم',
    message: 'الرسالة',
    send: 'إرسال',
    contactInfo: 'معلومات الاتصال',
    
    // Checkout
    shippingAddress: 'عنوان الشحن',
    billingAddress: 'عنوان الفاتورة',
    orderSummary: 'ملخص الطلبية',
    placeOrder: 'تأكيد الطلبية',
    
    // Additional common terms
    close: 'إغلاق',
    open: 'فتح',
    yes: 'نعم',
    no: 'لا',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    done: 'تم',
    submit: 'إرسال',
    reset: 'إعادة تعيين',
    clear: 'مسح',
    apply: 'تطبيق',
    remove: 'إزالة',
    update: 'تحديث',
    create: 'إنشاء',
    modify: 'تعديل',
    duplicate: 'نسخ',
    copy: 'نسخ',
    paste: 'لصق',
    cut: 'قص',
    selectAll: 'تحديد الكل',
    deselectAll: 'إلغاء تحديد الكل',
    refresh: 'تحديث',
    reload: 'إعادة تحميل',
    retry: 'إعادة المحاولة'
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
    login: 'Login',
    signup: 'Sign Up',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    phone: 'Phone',
    loginSuccess: 'Logged in successfully',
    loginError: 'Failed to log in',
    signupSuccess: 'Account created successfully. Please check your email.',
    signupError: 'Failed to create account',
    passwordMismatch: 'Passwords do not match',
    
    // Products
    addToCart: 'Add to Cart',
    viewDetails: 'View Details',
    price: 'Price',
    currency: '₪',
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
    storeDescription: 'Complete store application with comprehensive management',
    
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
    card: 'Credit Card',
    
    // Featured products
    featuredProducts: 'Featured Products',
    viewAll: 'View All',
    noFeaturedProducts: 'No Featured Products',
    browseAllProducts: 'Browse All Products',
    search: 'Search',
    buyNow: 'Buy Now',
    limitedTimeOffers: 'Limited Time Offers',
    dontMissOut: 'Don\'t Miss Out',
    noOffersAvailable: 'No Offers Available',
    checkBackLater: 'Check Back Later',
    address: 'Address',
    workingHours: 'Working Hours',
    sendMessage: 'Send Message',
    settings: 'Settings',
    profileInfo: 'Profile Info',
    addresses: 'Addresses',
    accountInfo: 'Account Info',
    accountType: 'Account Type',
    emailCannotBeChanged: 'Email cannot be changed',
    manageYourAccount: 'Manage Your Account',
    savedAddresses: 'Saved Addresses',
    addAddress: 'Add Address',
    noAddressesSaved: 'No addresses saved',
    filters: 'Filters',
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
    clearFilters: 'Clear Filters',
    discoverMore: 'Discover More',
    product: 'Product',
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Empty Cart',
    noProductsAdded: 'No products added yet',
    browseProducts: 'Browse Products',
    userType: 'User Type',
    wholesale: 'Wholesale',
    retail: 'Retail',
    
    // Toast messages
    cartUpdated: 'Cart Updated',
    quantityIncreased: 'Quantity Increased',
    productAdded: 'Product Added',
    productAddedToCart: 'Product added to cart',
    productRemoved: 'Product Removed',
    productRemovedFromCart: 'Product removed from cart',
    cartCleared: 'Cart Cleared',
    allProductsRemoved: 'All products removed',
    
    // Search and results
    searchResults: 'Search Results',
    noProductsFound: 'No products found',
    success: 'Success',
    error: 'Error',
    profileUpdated: 'Profile updated',
    updateProfile: 'Update Profile',
    notProvided: 'Not provided',
    
    // User management specific
    userDetails: 'User Details',
    userOrders: 'User Orders',
    userInfo: 'User Information',
    registrationDate: 'Registration Date',
    lastOrderDate: 'Last Order Date',
    highestOrderValue: 'Highest Order Value',
    orderDate: 'Order Date',
    orderValue: 'Order Value',
    orderItems: 'Order Items',
    noOrdersForUser: 'No orders found for this user',
    userId: 'User ID',
    joinedDate: 'Joined Date',
    orderCount: 'Order Count',
    totalSpent: 'Total Spent',
    
    // Additional admin translations
    userManagement: 'User Management',
    usersOverview: 'Users Overview',
    filterUsers: 'Filter Users',
    sortUsers: 'Sort Users',
    byName: 'By Name',
    byEmail: 'By Email',
    byRegistrationDate: 'By Registration Date',
    byLastOrderDate: 'By Last Order Date',
    byHighestOrderValue: 'By Highest Order Value',
    ascending: 'Ascending',
    descending: 'Descending',
    
    // Page not found
    pageNotFound: 'Page Not Found',
    pageNotFoundDescription: 'Sorry, the page you are looking for does not exist',
    goHome: 'Go Home',
    
    // Contact page
    contactUs: 'Contact Us',
    getInTouch: 'Get In Touch',
    name: 'Name',
    message: 'Message',
    send: 'Send',
    contactInfo: 'Contact Information',
    
    // Checkout
    shippingAddress: 'Shipping Address',
    billingAddress: 'Billing Address',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order',
    
    // Additional common terms
    close: 'Close',
    open: 'Open',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    done: 'Done',
    submit: 'Submit',
    reset: 'Reset',
    clear: 'Clear',
    apply: 'Apply',
    remove: 'Remove',
    update: 'Update',
    create: 'Create',
    modify: 'Modify',
    duplicate: 'Duplicate',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    refresh: 'Refresh',
    reload: 'Reload',
    retry: 'Retry'
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
    login: 'התחברות',
    signup: 'הרשמה',
    signIn: 'התחברות',
    signUp: 'הרשמה',
    logout: 'התנתקות',
    email: 'אימייל',
    password: 'סיסמה',
    confirmPassword: 'אימות סיסמה',
    fullName: 'שם מלא',
    phone: 'טלפון',
    loginSuccess: 'התחברת בהצלחה',
    loginError: 'נכשל בהתחברות',
    signupSuccess: 'החשבון נוצר בהצלחה. אנא בדוק את האימייל שלך.',
    signupError: 'נכשל ביצירת החשבון',
    passwordMismatch: 'הסיסמאות לא תואמות',
    
    // Products
    addToCart: 'הוסף לעגלה',
    viewDetails: 'הצג פרטים',
    price: 'מחיר',
    currency: '₪',
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
    storeDescription: 'אפליקציית חנות מלאה עם ניהול מקיף',
    
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
    card: 'כרטיס אשראי',
    
    // Featured products
    featuredProducts: 'מוצרים מומלצים',
    viewAll: 'הצג הכל',
    noFeaturedProducts: 'אין מוצרים מומלצים',
    browseAllProducts: 'עיין בכל המוצרים',
    search: 'חיפוש',
    buyNow: 'קנה עכשיו',
    limitedTimeOffers: 'הצעות לזמן מוגבל',
    dontMissOut: 'אל תפספס',
    noOffersAvailable: 'אין הצעות זמינות',
    checkBackLater: 'בדוק שוב מאוחר יותר',
    address: 'כתובת',
    workingHours: 'שעות פעילות',
    sendMessage: 'שלח הודעה',
    settings: 'הגדרות',
    profileInfo: 'מידע פרופיל',
    addresses: 'כתובות',
    accountInfo: 'מידע חשבון',
    accountType: 'סוג חשבון',
    emailCannotBeChanged: 'לא ניתן לשנות אימייל',
    manageYourAccount: 'נהל את החשבון שלך',
    savedAddresses: 'כתובות שמורות',
    addAddress: 'הוסף כתובת',
    noAddressesSaved: 'אין כתובות שמורות',
    filters: 'מסננים',
    allCategories: 'כל הקטגוריות',
    sortBy: 'מיין לפי',
    default: 'ברירת מחדל',
    newest: 'החדשים ביותר',
    priceLowHigh: 'מחיר: נמוך לגבוה',
    priceHighLow: 'מחיר: גבוה לנמוך',
    topRated: 'הכי מדורגים',
    priceRange: 'טווח מחירים',
    min: 'מינימום',
    max: 'מקסימום',
    clearFilters: 'נקה מסננים',
    discoverMore: 'גלה עוד',
    product: 'מוצר',
    shoppingCart: 'עגלת קניות',
    emptyCart: 'עגלה ריקה',
    noProductsAdded: 'לא נוספו מוצרים עדיין',
    browseProducts: 'עיין במוצרים',
    userType: 'סוג משתמש',
    wholesale: 'סיטונאי',
    retail: 'קמעונאי',
    
    // Toast messages
    cartUpdated: 'העגלה עודכנה',
    quantityIncreased: 'הכמות הוגדלה',
    productAdded: 'המוצר נוסף',
    productAddedToCart: 'המוצר נוסף לעגלה',
    productRemoved: 'המוצר הוסר',
    productRemovedFromCart: 'המוצר הוסר מהעגלה',
    cartCleared: 'העגלה נוקתה',
    allProductsRemoved: 'כל המוצרים הוסרו',
    
    // Search and results
    searchResults: 'תוצאות חיפוש',
    noProductsFound: 'לא נמצאו מוצרים',
    success: 'הצלחה',
    error: 'שגיאה',
    profileUpdated: 'הפרופיל עודכן',
    updateProfile: 'עדכן פרופיל',
    notProvided: 'לא סופק',
    
    // User management specific
    userDetails: 'פרטי משתמש',
    userOrders: 'הזמנות משתמש',
    userInfo: 'מידע משתמש',
    registrationDate: 'תאריך הרשמה',
    lastOrderDate: 'תאריך הזמנה אחרונה',
    highestOrderValue: 'ערך הזמנה הגבוה ביותר',
    orderDate: 'תאריך הזמנה',
    orderValue: 'ערך הזמנה',
    orderItems: 'פריטי הזמנה',
    noOrdersForUser: 'לא נמצאו הזמנות עבור משתמש זה',
    userId: 'מזהה משתמש',
    joinedDate: 'תאריך הצטרפות',
    orderCount: 'מספר הזמנות',
    totalSpent: 'סך הוצאות',
    
    // Additional admin translations
    userManagement: 'ניהול משתמשים',
    usersOverview: 'סקירת משתמשים',
    filterUsers: 'סנן משתמשים',
    sortUsers: 'מיין משתמשים',
    byName: 'לפי שם',
    byEmail: 'לפי אימייל',
    byRegistrationDate: 'לפי תאריך הרשמה',
    byLastOrderDate: 'לפי תאריך הזמנה אחרונה',
    byHighestOrderValue: 'לפי ערך הזמנה הגבוה ביותר',
    ascending: 'עולה',
    descending: 'יורד',
    
    // Page not found
    pageNotFound: 'העמוד לא נמצא',
    pageNotFoundDescription: 'סליחה, הדף שאתה מחפש לא קיים',
    goHome: 'חזור לבית',
    
    // Contact page
    contactUs: 'צור קשר',
    getInTouch: 'צור קשר',
    name: 'שם',
    message: 'הודעה',
    send: 'שלח',
    contactInfo: 'מידע ליצירת קשר',
    
    // Checkout
    shippingAddress: 'כתובת משלוח',
    billingAddress: 'כתובת חיוב',
    orderSummary: 'סיכום הזמנה',
    placeOrder: 'בצע הזמנה',
    
    // Additional common terms
    close: 'סגור',
    open: 'פתח',
    yes: 'כן',
    no: 'לא',
    confirm: 'אשר',
    back: 'חזור',
    next: 'הבא',
    previous: 'הקודם',
    done: 'סיום',
    submit: 'שלח',
    reset: 'איפוס',
    clear: 'נקה',
    apply: 'החל',
    remove: 'הסר',
    update: 'עדכן',
    create: 'צור',
    modify: 'שנה',
    duplicate: 'שכפל',
    copy: 'העתק',
    paste: 'הדבק',
    cut: 'גזור',
    selectAll: 'בחר הכל',
    deselectAll: 'בטל בחירת הכל',
    refresh: 'רענן',
    reload: 'טען מחדש',
    retry: 'נסה שוב'
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
