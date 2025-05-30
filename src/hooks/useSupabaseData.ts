// /home/ubuntu/modern-mobile-bazaar/src/hooks/useSupabaseData.ts
import { useQuery } from '@tanstack/react-query';
import { CategoryService, ProductService, BannerService } from '@/services/supabaseService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/contexts/AuthContext'; // Assuming Profile type is here
import { Language } from '@/types/language'; // Assuming Language type is defined

/**
 * Hook to fetch categories using SupabaseService.
 */
export const useCategories = () => {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['categories', language],
    queryFn: async () => {
      console.log('📦 Calling SupabaseService to fetch categories...');
      const data = await CategoryService.getCategories(language as Language);

      if (!data) {
        const error = new Error('Error fetching categories');
        console.error('❌ Error fetching categories via service:', error);
        throw error; // Re-throw the error for react-query to handle
      }
      console.log('📊 Categories fetched via service:', data);
      return data || []; // Return data or an empty array if null
    },
    staleTime: 5 * 60 * 1000, // البيانات تعتبر حديثة لمدة 5 دقائق
    refetchOnWindowFocus: true, // إعادة الجلب عند العودة للنافذة
    refetchInterval: 60 * 1000, // polling: جلب جديد كل دقيقة
  });

  return {
    ...query,
    // Explicitly return error for easier handling in components
    error: query.error,
  };
};

/**
 * Hook to fetch products using SupabaseService.
 */
export const useProducts = (categoryId?: string) => {
  const { language } = useLanguage();
  const { profile } = useAuth(); // Get profile to determine user type

  const query = useQuery({
    // Include user_type in the queryKey as price depends on it
    queryKey: ['products', categoryId, language, profile?.user_type],
    queryFn: async () => {
      console.log('🛍️ Calling SupabaseService to fetch products...');
      const userType = profile?.user_type as Profile['user_type'] | null | undefined;
      const data = await ProductService.getProducts(language as Language, userType, categoryId);

      if (!data) {
        const error = new Error('Error fetching products');
        console.error('❌ Error fetching products via service:', error);
        throw error;
      }
      console.log('📦 Products fetched via service:', data);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
  });

  return {
    ...query,
    error: query.error,
  };
};

/**
 * Hook to fetch banners using SupabaseService.
 */
export const useBanners = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['banners', language],
    queryFn: async () => {
      console.log('🖼️ Calling SupabaseService to fetch banners...');
      const data = await BannerService.getBanners(language as Language);

      if (!data) {
        const error = new Error('Error fetching banners');
        console.error('❌ Error fetching banners via service:', error);
        throw error;
      }
      console.log('🎯 Banners fetched via service:', data);
      return data || [];
    },
  });
};

// Add other hooks here that need data from Supabase, refactoring them
// to use supabaseService similarly.
// For example, hooks for fetching user addresses, orders, favorites, etc.
// should also be updated.

