// /home/ubuntu/modern-mobile-bazaar/src/hooks/useAddresses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService"; // Import the service
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

// Address interface (assuming it's defined elsewhere or keep it here)
export interface Address {
  id?: string;
  user_id: string;
  full_name: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor?: string;
  apartment?: string;
  is_default?: boolean;
}

// Custom hook for managing user addresses using SupabaseService
export const useAddresses = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Fetch user addresses using the service
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      console.log("[useAddresses] Calling service to fetch addresses for user:", user?.id);
      if (!user?.id) return [];

      const { data, error } = await supabaseService.getUserAddresses(user.id);

      if (error) {
        console.error("[useAddresses] Error fetching addresses via service:", error);
        // Consider showing a user-friendly error message here
        throw error; // Re-throw for react-query
      }

      console.log("[useAddresses] Addresses fetched via service:", data);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Create a new address using the service
  const createAddressMutation = useMutation({
    mutationFn: async (addressData: Omit<Address, "id" | "user_id">) => {
      if (!user?.id) throw new Error("User not authenticated");

      console.log("[useAddresses] Calling service to create address:", addressData);
      const { data, error } = await supabaseService.createAddress(user.id, addressData);

      if (error) {
        console.error("[useAddresses] Error creating address via service:", error);
        throw error;
      }

      console.log("[useAddresses] Address created via service:", data);
      return data;
    },
    onSuccess: () => {
      console.log("[useAddresses] Invalidating addresses query after creation");
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      toast.success(t("addressAdded"));
    },
    onError: (error: any) => {
      console.error("[useAddresses] Create address error:", error.message);
      // Use a generic error message or parse the specific error
      toast.error(t("errorCreatingAddress")); 
    },
  });

  // Update an existing address using the service
  const updateAddressMutation = useMutation({
    mutationFn: async (addressData: Address) => {
      if (!addressData.id) throw new Error("Address ID is required for update");
      console.log("[useAddresses] Calling service to update address:", addressData.id, addressData);
      
      // Exclude id and user_id from the data sent for update
      const { id, user_id, ...updateData } = addressData;

      const { data, error } = await supabaseService.updateAddress(id, updateData);

      if (error) {
        console.error("[useAddresses] Error updating address via service:", error);
        throw error;
      }

      console.log("[useAddresses] Address updated via service:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log("[useAddresses] Invalidating addresses query after update");
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      // Optionally update the specific address in the cache
      // queryClient.setQueryData(["addresses", user?.id], (oldData: Address[] | undefined) => 
      //   oldData?.map(addr => addr.id === variables.id ? { ...addr, ...variables } : addr)
      // );
      toast.success(t("addressUpdated"));
    },
    onError: (error: any) => {
      console.error("[useAddresses] Update address error:", error.message);
      toast.error(t("errorUpdatingAddress"));
    },
  });

  // Delete an address using the service
  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      console.log("[useAddresses] Calling service to delete address:", addressId);
      const { error } = await supabaseService.deleteAddress(addressId);

      if (error) {
        console.error("[useAddresses] Error deleting address via service:", error);
        throw error;
      }

      console.log("[useAddresses] Address deleted via service");
      return addressId; // Return ID for potential cache updates
    },
    onSuccess: (deletedAddressId) => {
      console.log("[useAddresses] Invalidating addresses query after deletion");
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      // Optionally remove the address from the cache immediately
      // queryClient.setQueryData(["addresses", user?.id], (oldData: Address[] | undefined) => 
      //   oldData?.filter(addr => addr.id !== deletedAddressId)
      // );
      toast.success(t("addressDeleted"));
    },
    onError: (error: any) => {
      console.error("[useAddresses] Delete address error:", error.message);
      toast.error(t("errorDeletingAddress"));
    },
  });

  return {
    addresses,
    isLoading,
    createAddress: createAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    isCreating: createAddressMutation.isPending,
    isUpdating: updateAddressMutation.isPending,
    isDeleting: deleteAddressMutation.isPending,
  };
};

