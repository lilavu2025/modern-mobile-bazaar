// /home/ubuntu/modern-mobile-bazaar/src/services/supabaseService.ts
import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { Profile } from "@/contexts/AuthContext"; // Assuming Profile type is defined here or move it to types
import { Language } from "@/types/language"; // Assuming Language type is defined
import { Address } from "@/hooks/useAddresses"; // Import Address type

/**
 * Centralized Supabase Service Class
 *
 * Encapsulates all interactions with the Supabase backend, including
 * data fetching, authentication, and session management.
 */
class SupabaseService {
  private static instance: SupabaseService;
  private refreshIntervalId: NodeJS.Timeout | null = null;
  private isRefreshing: boolean = false; // Flag to prevent concurrent refresh attempts

  private constructor() {
    // Private constructor ensures singleton pattern
    this.initializeSessionRefresh();
    // Listen for visibility changes to potentially trigger refresh on focus
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
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
   * Handles browser tab visibility changes.
   * Refreshes session immediately when tab becomes visible after being hidden.
   */
  private handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      console.log('[Service] Tab became visible, checking session status.');
      this.refreshSessionIfNeeded(true); // Force check on visibility change
    }
  };

  /**
   * Ensures the Supabase session token is refreshed if it's close to expiring or forced.
   * Includes basic retry logic and improved error handling.
   * @param forceCheck - If true, bypasses the threshold check and attempts refresh if session exists.
   */
  private async refreshSessionIfNeeded(forceCheck = false): Promise<void> {
    if (this.isRefreshing) {
      console.log('[Service] Session refresh already in progress, skipping.');
      return;
    }

    this.isRefreshing = true;
    console.log(`[Service] Checking session status. Forced: ${forceCheck}`);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[Service] Error getting session:', sessionError);
        // If session cannot be retrieved, might indicate a deeper issue.
        // Consider triggering logout if this persists.
        this.isRefreshing = false;
        return;
      }

      if (!session) {
        console.log('[Service] No active session, no refresh needed.');
        this.isRefreshing = false;
        return;
      }

      const now = Date.now();
      const expiresAt = session.expires_at ? session.expires_at * 1000 : now;
      const expiresIn = expiresAt - now;
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes

      console.log(`[Service] Session expires in ${Math.round(expiresIn / 1000)}s. Threshold: ${refreshThreshold / 1000}s.`);

      if (forceCheck || expiresIn < refreshThreshold) {
        console.log(`[Service] Attempting to refresh session. Reason: ${forceCheck ? 'Forced check' : 'Threshold reached'}`);
        
        const { error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.error('[Service] Error refreshing session:', refreshError);
          // If refresh fails, the session might be invalid. 
          // Supabase client might handle this internally, but logging is important.
          // Consider triggering a global sign-out event if refresh consistently fails.
          // Example: window.dispatchEvent(new CustomEvent('auth-error', { detail: 'session-refresh-failed' }));
          // AuthContext could listen for this event.
        } else {
          console.log('[Service] Session refreshed successfully.');
        }
      } else {
        console.log('[Service] Session is valid, no refresh needed now.');
      }
    } catch (error) {
      console.error('[Service] Unexpected error during session refresh check:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Initializes periodic session refresh checks.
   */
  private initializeSessionRefresh(): void {
    // Clear any existing interval
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    // Check immediately on startup
    this.refreshSessionIfNeeded();
    // Set up interval for periodic checks (e.g., every 2 minutes)
    const intervalDuration = 2 * 60 * 1000;
    console.log(`[Service] Setting up periodic session check every ${intervalDuration / 1000}s.`);
    this.refreshIntervalId = setInterval(() => {
      this.refreshSessionIfNeeded();
    }, intervalDuration);
  }

  /**
   * Cleans up resources like intervals and event listeners.
   */
  public cleanup(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
      console.log('[Service] Cleared session refresh interval.');
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      console.log('[Service] Removed visibility change listener.');
    }
  }

  /**
   * Wrapper for Supabase queries that ensures session is fresh.
   */
  private async executeQuery<T>(queryBuilder: any): Promise<{ data: T | null; error: any }> {
    // Ensure session is checked/refreshed before the query
    // Use forceCheck=true if you suspect staleness immediately before a critical query,
    // otherwise rely on the periodic checks and the pre-query check.
    await this.refreshSessionIfNeeded(); 
    
    console.log('[Service] Executing Supabase query...');
    try {
      const { data, error } = await queryBuilder;
      if (error) {
        console.error('[Service] Supabase query error:', error);
        // Handle specific errors if needed (e.g., RLS violations, network errors)
      }
      return { data, error };
    } catch (err) {
      console.error('[Service] Unexpected error executing Supabase query:', err);
      return { data: null, error: err };
    }
  }

  // --- Authentication Methods --- 

  async signIn(email: string, password: string): Promise<{ session: Session | null; user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      localStorage.setItem('lastLoginTime', Date.now().toString());
      // Trigger immediate refresh check after sign-in
      this.refreshSessionIfNeeded(true);
    }
    return { session: data.session, user: data.user, error };
  }

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

  async signOut(): Promise<{ error: AuthError | null }> {
    localStorage.removeItem('lastLoginTime');
    const { error } = await supabase.auth.signOut();
    // Optionally clear interval on sign out, though it should handle lack of session
    // if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);
    return { error };
  }

  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void): { data: { subscription: any } } {
    return supabase.auth.onAuthStateChange(callback);
  }

  // --- Profile Methods --- 

  async fetchProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
    return this.executeQuery<Profile>(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    );
  }

  async createProfile(userId: string, profileData: Omit<Profile, 'id' | 'user_type' | 'email'> & { email: string }): Promise<{ data: Profile | null; error: any }> {
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

  async updateProfile(userId: string, data: Partial<Profile>): Promise<{ error: any }> {
    const { error } = await this.executeQuery(
      supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
    );
    return { error };
  }

  // --- Data Fetching Methods --- 

  async getCategories(language: Language): Promise<{ data: any[] | null; error: any }> {
    console.log(`[Service] Fetching categories for language: ${language}`);
    const { data: categories, error: categoriesError } = await this.executeQuery<any[]>(
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
          };
        })
      );
      return { data: categoriesWithCounts, error: null };
    } catch (error) {
      console.error('[Service] Error processing category counts:', error);
      return { data: null, error };
    }
  }

  async getProducts(language: Language, userType: Profile['user_type'] | null | undefined, categoryId?: string): Promise<{ data: any[] | null; error: any }> {
    console.log(`[Service] Fetching products. Lang: ${language}, UserType: ${userType || 'guest'}, Category: ${categoryId || 'all'}`);
    let query = supabase
      .from('products')
      .select('*, categories!inner(*)')
      .eq('active', true);

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    const { data: products, error } = await this.executeQuery<any[]>(
      query.order('created_at', { ascending: false })
    );

    if (error || !products) {
      return { data: null, error };
    }

    const processedProducts = products.map(product => {
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
        category: product.categories ? product.categories[`name_${language}`] : 'Unknown',
        inStock: product.in_stock || false,
        rating: Number(product.rating) || 0,
        reviews: product.reviews_count || 0,
        discount: product.discount ? Number(product.discount) : undefined,
        featured: product.featured || false,
        tags: product.tags || [],
        stock_quantity: product.stock_quantity || 0,
      };
    });
    return { data: processedProducts, error: null };
  }

  async getBanners(language: Language): Promise<{ data: any[] | null; error: any }> {
    console.log(`[Service] Fetching banners for language: ${language}`);
    const { data: banners, error } = await this.executeQuery<any[]>(
      supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order')
    );
    if (error || !banners) {
      return { data: null, error };
    }
    const processedBanners = banners.map(banner => ({
      id: banner.id,
      title: banner[`title_${language}`],
      subtitle: banner[`subtitle_${language}`],
      image: banner.image,
      link: banner.link,
      active: banner.active,
    }));
    return { data: processedBanners, error: null };
  }

  // --- Admin Specific Methods --- 

  async getAllUsers(filters?: any): Promise<{ data: Profile[] | null; error: any }> {
    console.log('[Service] Fetching all users (admin)');
    let query = supabase.from('profiles').select('*');
    // Add filtering logic here if needed
    return this.executeQuery<Profile[]>(query.order('created_at'));
  }

  async updateUserProfile(userId: string, data: Partial<Profile>): Promise<{ error: any }> {
    console.log(`[Service] Updating profile for user ${userId} (admin)`);
    return this.updateProfile(userId, data);
  }

  // --- Address Methods ---

  async getUserAddresses(userId: string): Promise<{ data: Address[] | null; error: any }> {
    console.log(`[Service] Fetching addresses for user: ${userId}`);
    return this.executeQuery<Address[]>(
      supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
    );
  }

  async createAddress(userId: string, addressData: Omit<Address, 'id' | 'user_id'>): Promise<{ data: Address | null; error: any }> {
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

  async updateAddress(addressId: string, addressData: Partial<Omit<Address, 'id' | 'user_id'>>): Promise<{ data: Address | null; error: any }> {
    console.log(`[Service] Updating address: ${addressId}`);
    const { user_id, ...updateData } = addressData as any;
    return this.executeQuery<Address>(
      supabase
        .from('addresses')
        .update(updateData)
        .eq('id', addressId)
        .select()
        .single()
    );
  }

  async deleteAddress(addressId: string): Promise<{ error: any }> {
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

  async getUserFavorites(userId: string): Promise<{ data: { product_id: string }[] | null; error: any }> {
    console.log(`[Service] Fetching favorites for user: ${userId}`);
    return this.executeQuery<{ product_id: string }[]>(
      supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId)
        .order('added_at', { ascending: false })
    );
  }

  async addFavorite(userId: string, productId: string): Promise<{ error: any }> {
    console.log(`[Service] Adding favorite for user: ${userId}, product: ${productId}`);
    const { error } = await this.executeQuery(
      supabase
        .from('favorites')
        .insert({ user_id: userId, product_id: productId, added_at: new Date().toISOString() })
    );
    return { error };
  }

  async removeFavorite(userId: string, productId: string): Promise<{ error: any }> {
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

  async clearUserFavorites(userId: string): Promise<{ error: any }> {
    console.log(`[Service] Clearing all favorites for user: ${userId}`);
    const { error } = await this.executeQuery(
      supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
    );
    return { error };
  }

  async getFavoriteProductDetails(productIds: string[], language: Language): Promise<{ data: any[] | null; error: any }> {
    console.log(`[Service] Fetching details for favorite products: ${productIds.join(', ')}`);
    if (!productIds || productIds.length === 0) {
      return { data: [], error: null };
    }
    const { data: products, error } = await this.executeQuery<any[]>(
      supabase
        .from('products')
        .select('*, categories(*)')
        .in('id', productIds)
        .eq('active', true)
    );
    if (error || !products) {
      return { data: null, error };
    }
    const processedProducts = products.map(product => ({
      id: product.id,
      name: product[`name_${language}`],
      price: Number(product.price),
      image: product.image,
      category: product.categories ? product.categories[`name_${language}`] : 'Unknown',
      // Add other fields as needed
    }));
    return { data: processedProducts, error: null };
  }

  // Add other service methods as needed (e.g., for orders, admin actions)

}

// Export a singleton instance
export const supabaseService = SupabaseService.getInstance();

