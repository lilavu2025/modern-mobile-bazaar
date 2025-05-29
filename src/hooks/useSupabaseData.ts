// /home/ubuntu/modern-mobile-bazaar/src/hooks/useSupabaseData.ts
import { useQuery } from '@tanstack/react-query';
import { supabaseService } from '@/services/supabaseService'; // Import the service
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
      const { data, error } = await supabaseService.getCategories(language as Language);

      if (error) {
        console.error('❌ Error fetching categories via service:', error);
        throw error; // Re-throw the error for react-query to handle
      }
      console.log('📊 Categories fetched via service:', data);
      return data || []; // Return data or an empty array if null
    },
    // Add other react-query options if needed (e.g., staleTime, cacheTime)
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
      const { data, error } = await supabaseService.getProducts(language as Language, userType, categoryId);

      if (error) {
        console.error('❌ Error fetching products via service:', error);
        throw error;
      }
      console.log('📦 Products fetched via service:', data);
      return data || [];
    },
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
      const { data, error } = await supabaseService.getBanners(language as Language);

      if (error) {
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

