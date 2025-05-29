// /home/ubuntu/modern-mobile-bazaar/src/hooks/useFavorites.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService"; // Import the service
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types"; // Assuming Product type is defined
import { Language } from "@/types/language";

export const useFavorites = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // Use React Query to fetch favorite IDs
  const { data: favoriteIds = [], isLoading: isLoadingIds, error: fetchError } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      console.log("[useFavorites] Fetching favorite IDs for user:", user?.id);
      if (!user) {
        // Guest user: Load from localStorage
        try {
          const guestFavorites = localStorage.getItem("favorites_guest");
          return guestFavorites ? JSON.parse(guestFavorites) : [];
        } catch (error) {
          console.error("[useFavorites] Error loading guest favorites:", error);
          return [];
        }
      }
      // Logged-in user: Fetch from service
      const { data, error } = await supabaseService.getUserFavorites(user.id);
      if (error) {
        console.error("[useFavorites] Error fetching favorite IDs via service:", error);
        toast.error(t("errorLoadingFavorites"));
        throw error; // Let React Query handle the error state
      }
      return data?.map(fav => fav.product_id) || [];
    },
    // Keep data fresh, but don't refetch too aggressively on window focus unless needed
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });

  // Save guest favorites to localStorage
  useEffect(() => {
    if (!user && Array.isArray(favoriteIds)) {
      try {
        localStorage.setItem("favorites_guest", JSON.stringify(favoriteIds));
      } catch (error) {
        console.error("[useFavorites] Error saving guest favorites:", error);
      }
    }
  }, [favoriteIds, user]);

  // Mutation for adding a favorite
  const addFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) {
        // Guest: Update local state directly via query cache invalidation/update
        const currentGuestFavorites = JSON.parse(localStorage.getItem("favorites_guest") || "[]");
        if (!currentGuestFavorites.includes(productId)) {
          const updatedGuestFavorites = [...currentGuestFavorites, productId];
          localStorage.setItem("favorites_guest", JSON.stringify(updatedGuestFavorites));
        }
        return productId; // Return ID for optimistic update
      }
      // Logged-in user: Call service
      const { error } = await supabaseService.addFavorite(user.id, productId);
      if (error) {
        // Handle potential errors, e.g., unique constraint violation if already added
        console.error("[useFavorites] Error adding favorite via service:", error);
        throw error;
      }
      return productId;
    },
    onMutate: async (productId) => {
      // Optimistic update: Add to cache immediately
      await queryClient.cancelQueries({ queryKey: ["favorites", user?.id] });
      const previousFavorites = queryClient.getQueryData<string[]>(["favorites", user?.id]);
      queryClient.setQueryData<string[]>(["favorites", user?.id], (old = []) => 
        old.includes(productId) ? old : [...old, productId]
      );
      return { previousFavorites }; // Return context for rollback
    },
    onError: (err, productId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites", user?.id], context.previousFavorites);
      }
      toast.error(t("errorAddingToFavorites"));
    },
    onSettled: (productId) => {
      // Invalidate to ensure consistency after mutation settles
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      // Also invalidate favorite product details if that query exists
      queryClient.invalidateQueries({ queryKey: ["favoriteProducts", user?.id] }); 
    },
    onSuccess: () => {
      toast.success(t("addedToFavorites"));
    }
  });

  // Mutation for removing a favorite
  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) {
        // Guest: Update local state directly
        const currentGuestFavorites = JSON.parse(localStorage.getItem("favorites_guest") || "[]");
        const updatedGuestFavorites = currentGuestFavorites.filter((id: string) => id !== productId);
        localStorage.setItem("favorites_guest", JSON.stringify(updatedGuestFavorites));
        return productId; // Return ID for optimistic update
      }
      // Logged-in user: Call service
      const { error } = await supabaseService.removeFavorite(user.id, productId);
      if (error) {
        console.error("[useFavorites] Error removing favorite via service:", error);
        throw error;
      }
      return productId;
    },
    onMutate: async (productId) => {
      // Optimistic update: Remove from cache immediately
      await queryClient.cancelQueries({ queryKey: ["favorites", user?.id] });
      const previousFavorites = queryClient.getQueryData<string[]>(["favorites", user?.id]);
      queryClient.setQueryData<string[]>(["favorites", user?.id], (old = []) => 
        old.filter(id => id !== productId)
      );
      return { previousFavorites }; // Return context for rollback
    },
    onError: (err, productId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites", user?.id], context.previousFavorites);
      }
      toast.error(t("errorRemovingFromFavorites"));
    },
    onSettled: (productId) => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["favoriteProducts", user?.id] });
    },
    onSuccess: () => {
      toast.success(t("removedFromFavorites"));
    }
  });

  // Mutation for clearing all favorites
  const clearFavoritesMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        // Guest: Clear localStorage
        localStorage.removeItem("favorites_guest");
        return;
      }
      // Logged-in user: Call service
      const { error } = await supabaseService.clearUserFavorites(user.id);
      if (error) {
        console.error("[useFavorites] Error clearing favorites via service:", error);
        throw error;
      }
    },
    onMutate: async () => {
      // Optimistic update: Clear cache
      await queryClient.cancelQueries({ queryKey: ["favorites", user?.id] });
      const previousFavorites = queryClient.getQueryData<string[]>(["favorites", user?.id]);
      queryClient.setQueryData<string[]>(["favorites", user?.id], []);
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      // Rollback
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites", user?.id], context.previousFavorites);
      }
      toast.error(t("errorClearingFavorites"));
    },
    onSettled: () => {
      // Invalidate
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["favoriteProducts", user?.id] });
    },
    onSuccess: () => {
      toast.success(t("favoritesCleared"));
    }
  });

  // Toggle function using the mutations
  const toggleFavorite = useCallback((productId: string) => {
    if (!productId) {
      toast.error(t("invalidProduct"));
      return;
    }
    const isFav = favoriteIds.includes(productId);
    if (isFav) {
      removeFavoriteMutation.mutate(productId);
    } else {
      addFavoriteMutation.mutate(productId);
    }
  }, [favoriteIds, addFavoriteMutation, removeFavoriteMutation, t]);

  // Check if a product is favorite
  const isFavorite = useCallback((productId: string): boolean => {
    return favoriteIds.includes(productId);
  }, [favoriteIds]);

  // Get count
  const getFavoritesCount = useCallback((): number => {
    return favoriteIds.length;
  }, [favoriteIds]);

  // Fetch full product details for favorites
  const { data: favoriteProducts = [], isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ["favoriteProducts", user?.id, language, favoriteIds], // Include language and IDs
    queryFn: async () => {
      console.log("[useFavorites] Fetching favorite product details...");
      if (favoriteIds.length === 0) return [];
      
      const { data, error } = await supabaseService.getFavoriteProductDetails(favoriteIds, language as Language);
      if (error) {
        console.error("[useFavorites] Error fetching favorite product details:", error);
        // Don't throw here, just return empty array or handle error display
        return []; 
      }
      return data || [];
    },
    enabled: favoriteIds.length > 0, // Only run if there are favorite IDs
    staleTime: 5 * 60 * 1000, 
  });

  return {
    favorites: favoriteIds, // List of product IDs
    favoriteProducts: favoriteProducts as Product[], // List of full product details
    isLoading: isLoadingIds || (favoriteIds.length > 0 && isLoadingProducts), // Combined loading state
    error: fetchError || productsError,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    clearFavorites: clearFavoritesMutation.mutate,
    isToggling: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
    isClearing: clearFavoritesMutation.isPending,
  };
};

