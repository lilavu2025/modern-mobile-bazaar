// /home/ubuntu/modern-mobile-bazaar/src/services/supabaseService.ts
import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { Profile } from "@/contexts/AuthContext"; // Assuming Profile type is defined here or move it to types
import { Language } from "@/types/language"; // Assuming Language type is defined
import { Address } from "@/hooks/useAddresses"; // Import Address type
import { Tables } from '@/integrations/supabase/types';
import type { Product as AppProduct, Category as AppCategory, Banner as AppBanner } from '@/types/index';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

/**
 * إعداد مستمع التركيز (visibilitychange) مع تأخير لمنع التكرار.
 */
const setupVisibilityHandler = () => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      setTimeout(() => {
        refreshSession(true);
      }, 1000);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Ensures only one session refresh runs at a time. All callers await the same promise.
 * Triggers a global event on error for UI feedback.
 */
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Refreshes the Supabase session atomically. If a refresh is already in progress, waits for it.
 * @param force إذا true، يجبر التحديث حتى لو لم تكن الجلسة منتهية
 */
export async function refreshSession(force = false): Promise<void> {
  if (isRefreshing && refreshPromise) {
    // Wait for the ongoing refresh
    await refreshPromise;
    return;
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) throw new Error('No session found');
      const expiresIn = session.expires_at ? session.expires_at * 1000 - Date.now() : 0;
      if (force || expiresIn < 1000 * 60 * 10) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[refreshSession] Session refreshed.');
        }
      } else {
        // Session is still valid
        // console.log('[refreshSession] Session still valid.');
      }
    } catch (err: unknown) {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorObj = err as any;
        if (errorObj?.name === 'AuthError') {
          window.dispatchEvent(new CustomEvent('supabase-auth-error', { detail: err }));
        } else if (errorObj?.name === 'TypeError' && /fetch/i.test(errorObj.message)) {
          window.dispatchEvent(new CustomEvent('supabase-network-error', { detail: err }));
        } else {
          window.dispatchEvent(new CustomEvent('supabase-error', { detail: err }));
        }
      }
      if (process.env.NODE_ENV !== 'production') {
        console.error('[refreshSession] Error refreshing session:', err);
      }
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  await refreshPromise;
}

/**
 * استعلام مرن من Supabase يراعي حالة التحديث ويعيد المحاولة عند أخطاء المصادقة.
 */
type TableName = 'addresses' | 'profiles' | 'banners' | 'cart' | 'products' | 'categories' | 'favorites' | 'offers' | 'order_items' | 'orders';

export const fetchData = async (
  table: TableName,
  columns: string = '*',
  filter: { field: string; value: unknown } | null = null
) => {
  try {
    let query = supabase.from(table).select(columns);
    if (filter) {
      // @ts-expect-error: Supabase eq يقبل اسم الحقل كسلسلة نصية ديناميكية
      query = query.eq(filter.field, filter.value);
    }
    const { data, error } = await query;
    if (error) {
      if (error.message && error.message.includes('401')) {
        await refreshSession(true);
        return fetchData(table, columns, filter);
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error(`[Service] Error fetching ${table}:`, error);
    throw error;
  }
}

// --- Global session refresh logic ---
/**
 * Ensures only one session refresh runs at a time. All callers await the same promise.
 * Triggers a global event on error for UI feedback.
 */
// let isRefreshing = false;
// let refreshPromise: Promise<void> | null = null;

/**
 * Refreshes the Supabase session atomically. If a refresh is already in progress, waits for it.
 * @param force إذا true، يجبر التحديث حتى لو لم تكن الجلسة منتهية
 */
// export async function refreshSession(force = false): Promise<void> { ... }
// --- End global session refresh logic ---

/**
 * Centralized Supabase Service Class
 *
 * Encapsulates all interactions with the Supabase backend, including
 * data fetching, authentication, and session management.
 */
class SupabaseService {
  private static instance: SupabaseService;
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;
  private removeVisibilityHandler: (() => void) | null = null;

  private constructor() {
    this.removeVisibilityHandler = setupVisibilityHandler();
    this.setupSessionRefresh();
  }

  /**
   * Get the singleton instance of the SupabaseService.
   */
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * إعداد فحص دوري للجلسة باستخدام refreshSession الجديد.
   */
  private setupSessionRefresh(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    // فحص فوري عند البدء
    refreshSession();
    // فحص كل دقيقتين
    const intervalDuration = 2 * 60 * 1000;
    this.refreshIntervalId = setInterval(() => {
      refreshSession();
    }, intervalDuration);
  }

  /**
   * Cleans up resources like intervals and event listeners.
   */
  public cleanup(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Service] Cleared session refresh interval.');
      }
    }
    if (this.removeVisibilityHandler) {
      this.removeVisibilityHandler();
      this.removeVisibilityHandler = null;
    }
  }

  /**
   * Wrapper for Supabase queries that ensures session is fresh and returns a typed response.
   * @template T نوع البيانات المرجعية
   * @param queryBuilder - كائن استعلام Supabase (عادة PostgrestBuilder)
   * @returns كائن { data, error } مع الأنواع المناسبة
   *
   * ملاحظة: نستخدم any هنا لأن PostgrestFilterBuilder غير متاح دائماً في supabase-js v2.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async executeQuery<T>(queryBuilder: any): Promise<PostgrestSingleResponse<T>> {
    await refreshSession();
    try {
      const result = await queryBuilder;
      if (result.error) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('supabase-error', { detail: result.error }));
        }
        if (process.env.NODE_ENV !== 'production') {
          console.error('[Service] Supabase query error:', result.error);
        }
      }
      return result;
    } catch (err: unknown) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('supabase-error', { detail: err }));
      }
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Service] Unexpected error executing Supabase query:', err);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: null, error: err as any, count: null, status: 500, statusText: 'Unexpected error' };
    }
  }

  /**
   * تسجيل الدخول للمستخدم.
   * @param email البريد الإلكتروني
   * @param password كلمة المرور
   * @returns الجلسة والمستخدم أو الخطأ
   */
  async signIn(email: string, password: string): Promise<{ session: Session | null; user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      localStorage.setItem('lastLoginTime', Date.now().toString());
      // Trigger immediate refresh check after sign-in
      refreshSession(true);
    }
    return { session: data.session, user: data.user, error };
  }

  /**
   * تسجيل مستخدم جديد.
   * @param email البريد الإلكتروني
   * @param password كلمة المرور
   * @param fullName الاسم الكامل
   * @param phone رقم الهاتف (اختياري)
   * @returns المستخدم أو الخطأ
   */
  async signUp(email: string, password: string, fullName: string, phone?: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
        },
      },
    });
    return { user: data.user, error };
  }

  /**
   * تسجيل الخروج وتنظيف الموارد.
   * @returns الخطأ إن وجد
   * @note يجب استدعاء this.cleanup() عند تسجيل الخروج أو تفكيك التطبيق لمنع memory leaks.
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    localStorage.removeItem('lastLoginTime');
    const { error } = await supabase.auth.signOut();
    // Optionally clear interval on sign out, though it should handle lack of session
    // if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);
    return { error };
  }

  /**
   * جلب بيانات المستخدم الحالي.
   * @returns المستخدم أو الخطأ
   */
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  /**
   * جلب الجلسة الحالية.
   * @returns الجلسة أو الخطأ
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }

  /**
   * الاشتراك في تغييرات حالة المصادقة.
   * @param callback دالة الاستدعاء عند التغيير
   * @returns كائن الاشتراك
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void): { data: { subscription: unknown } } {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * جلب بروفايل المستخدم.
   * @param userId معرف المستخدم
   * @returns بيانات البروفايل أو الخطأ
   */
  async fetchProfile(userId: string): Promise<{ data: Profile | null; error: unknown }> {
    return this.executeQuery<Profile>(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    );
  }

  async createProfile(userId: string, profileData: Omit<Profile, 'id' | 'user_type' | 'email'> & { email: string }): Promise<{ data: Profile | null; error: unknown }> {
    const newProfileData = {
      id: userId,
      full_name: profileData.full_name || '',
      phone: profileData.phone || null,
      user_type: 'retail' as const, // Default user type
      email: profileData.email || ''
    };
    return this.executeQuery<Profile>(
      supabase
        .from('profiles')
        .insert([newProfileData])
        .select()
        .single()
    );
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<{ error: unknown }> {
    const { error } = await this.executeQuery(
      supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
    );
    return { error };
  }

  // --- Data Fetching Methods --- 

  async getCategories(language: Language): Promise<{ data: AppCategory[] | null; error: unknown }> {
    console.log(`[Service] Fetching categories for language: ${language}`);
    const { data: categories, error: categoriesError } = await this.executeQuery<Tables<'categories'>[]>(
      supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('created_at')
    );
    if (categoriesError || !categories) {
      return { data: null, error: categoriesError };
    }
    try {
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const { data: countResult, error: countError } = await this.executeQuery<{ count: number }>(
            supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .eq('active', true)
          );
          if (countError) {
            console.warn(`[Service] Error counting products for category ${category.id}:`, countError);
          }
          return {
            id: category.id,
            name: category[`name_${language}`],
            nameEn: category.name_en,
            image: category.image,
            icon: category.icon,
            count: countResult?.count ?? 0,
          } as AppCategory;
        })
      );
      return { data: categoriesWithCounts, error: null };
    } catch (error) {
      console.error('[Service] Error processing category counts:', error);
      return { data: null, error };
    }
  }

  async getProducts(language: Language, userType: Profile['user_type'] | null | undefined, categoryId?: string): Promise<{ data: AppProduct[] | null; error: unknown }> {
    console.log(`[Service] Fetching products. Lang: ${language}, UserType: ${userType || 'guest'}, Category: ${categoryId || 'all'}`);
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true);
    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }
    const { data: products, error } = await this.executeQuery<Tables<'products'>[]>(
      query.order('created_at', { ascending: false })
    );
    if (error || !products) {
      return { data: null, error };
    }
    const processedProducts: AppProduct[] = products.map(product => {
      const isWholesale = userType === 'wholesale';
      const displayPrice = isWholesale && product.wholesale_price 
        ? Number(product.wholesale_price) 
        : Number(product.price);
      return {
        id: product.id,
        name: product[`name_${language}`],
        nameEn: product.name_en,
        description: product[`description_${language}`],
        descriptionEn: product.description_en,
        price: displayPrice,
        originalPrice: product.original_price ? Number(product.original_price) : undefined,
        wholesalePrice: product.wholesale_price ? Number(product.wholesale_price) : undefined,
        image: product.image,
        images: product.images || [],
        category: product.category_id, // Use category_id, not categories
        inStock: product.in_stock || false,
        rating: Number(product.rating) || 0,
        reviews: product.reviews_count || 0,
        discount: product.discount ? Number(product.discount) : undefined,
        featured: product.featured || false,
        tags: product.tags || [],
        stock_quantity: product.stock_quantity || 0,
        active: product.active ?? true,
      };
    });
    return { data: processedProducts, error: null };
  }

  async getBanners(language: Language): Promise<{ data: AppBanner[] | null; error: unknown }> {
    console.log(`[Service] Fetching banners for language: ${language}`);
    const { data: banners, error } = await this.executeQuery<Tables<'banners'>[]>(
      supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order')
    );
    if (error || !banners) {
      return { data: null, error };
    }
    const processedBanners: AppBanner[] = banners.map(banner => ({
      id: banner.id,
      title: banner[`title_${language}`],
      subtitle: banner[`subtitle_${language}`],
      image: banner.image,
      link: banner.link ?? undefined,
      active: banner.active ?? true,
    }));
    return { data: processedBanners, error: null };
  }

  // --- Admin Specific Methods --- 

  async getAllUsers(filters?: unknown): Promise<{ data: Profile[] | null; error: unknown }> {
    console.log('[Service] Fetching all users (admin)');
    const query = supabase.from('profiles').select('*');
    // Add filtering logic here if needed
    return this.executeQuery<Profile[]>(query.order('created_at'));
  }

  async updateUserProfile(userId: string, data: Partial<Profile>): Promise<{ error: unknown }> {
    console.log(`[Service] Updating profile for user ${userId} (admin)`);
    return this.updateProfile(userId, data);
  }

  // --- Address Methods ---

  async getUserAddresses(userId: string): Promise<{ data: Address[] | null; error: unknown }> {
    console.log(`[Service] Fetching addresses for user: ${userId}`);
    return this.executeQuery<Address[]>(
      supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
    );
  }

  async createAddress(userId: string, addressData: Omit<Address, 'id' | 'user_id'>): Promise<{ data: Address | null; error: unknown }> {
    console.log(`[Service] Creating address for user: ${userId}`);
    const dataToInsert = { ...addressData, user_id: userId };
    return this.executeQuery<Address>(
      supabase
        .from('addresses')
        .insert(dataToInsert)
        .select()
        .single()
    );
  }

  async updateAddress(addressId: string, addressData: Partial<Omit<Address, 'id' | 'user_id'>>): Promise<{ data: Address | null; error: unknown }> {
    console.log(`[Service] Updating address: ${addressId}`);
    // Don't destructure user_id, just use addressData directly
    return this.executeQuery<Address>(
      supabase
        .from('addresses')
        .update(addressData)
        .eq('id', addressId)
        .select()
        .single()
    );
  }

  async deleteAddress(addressId: string): Promise<{ error: unknown }> {
    console.log(`[Service] Deleting address: ${addressId}`);
    const { error } = await this.executeQuery(
      supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
    );
    return { error };
  }

  // --- Favorites Methods ---

  async getUserFavorites(userId: string): Promise<{ data: { product_id: string }[] | null; error: unknown }> {
    console.log(`[Service] Fetching favorites for user: ${userId}`);
    return this.executeQuery<{ product_id: string }[]>(
      supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId)
        .order('added_at', { ascending: false })
    );
  }

  async addFavorite(userId: string, productId: string): Promise<{ error: unknown }> {
    console.log(`[Service] Adding favorite for user: ${userId}, product: ${productId}`);
    const { error } = await this.executeQuery(
      supabase
        .from('favorites')
        .insert({ user_id: userId, product_id: productId, added_at: new Date().toISOString() })
    );
    return { error };
  }

  async removeFavorite(userId: string, productId: string): Promise<{ error: unknown }> {
    console.log(`[Service] Removing favorite for user: ${userId}, product: ${productId}`);
    const { error } = await this.executeQuery(
      supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
    );
    return { error };
  }

  async clearUserFavorites(userId: string): Promise<{ error: unknown }> {
    console.log(`[Service] Clearing all favorites for user: ${userId}`);
    const { error } = await this.executeQuery(
      supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
    );
    return { error };
  }

  async getFavoriteProductDetails(productIds: string[], language: Language): Promise<{ data: AppProduct[] | null; error: unknown }> {
    console.log(`[Service] Fetching details for favorite products: ${productIds.join(', ')}`);
    if (!productIds || productIds.length === 0) {
      return { data: [], error: null };
    }
    const { data: products, error } = await this.executeQuery<Tables<'products'>[]>(
      supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('active', true)
    );
    if (error || !products) {
      return { data: null, error };
    }
    const processedProducts: AppProduct[] = products.map(product => ({
      id: product.id,
      name: product[`name_${language}`],
      nameEn: product.name_en,
      description: product[`description_${language}`],
      descriptionEn: product.description_en,
      price: Number(product.price),
      originalPrice: product.original_price ? Number(product.original_price) : undefined,
      wholesalePrice: product.wholesale_price ? Number(product.wholesale_price) : undefined,
      image: product.image,
      images: product.images || [],
      category: product.category_id, // Use category_id
      inStock: product.in_stock || false,
      rating: Number(product.rating) || 0,
      reviews: product.reviews_count || 0,
      discount: product.discount ? Number(product.discount) : undefined,
      featured: product.featured || false,
      tags: product.tags || [],
      stock_quantity: product.stock_quantity || 0,
      active: product.active ?? true,
    }));
    return { data: processedProducts, error: null };
  }

  // Add other service methods as needed (e.g., for orders, admin actions)

}

// Export a singleton instance
export const supabaseService = SupabaseService.getInstance();

// HMR cleanup for Vite
declare const importMeta: ImportMeta;
if (import.meta && import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    supabaseService.cleanup();
  });
}

