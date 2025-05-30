import { supabase } from "@/integrations/supabase/client";
import type { Language } from "@/types/language";
import type { Tables } from "@/integrations/supabase/types";
import type { Product as AppProduct } from "@/types/index";

export class ProductService {
  /** جلب المنتجات */
  static async getProducts(
    language: Language,
    userType: Tables<"profiles">["user_type"] | null,
    categoryId?: string
  ): Promise<AppProduct[]> {
    let query = supabase
      .from("products")
      .select("*")
      .eq("active", true);

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    const { data = [], error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return data.map((p: Tables<"products">) => {
      const isWholesale = userType === "wholesale";
      const price = isWholesale && p.wholesale_price ? p.wholesale_price : p.price;
      return {
        id: p.id,
        name: p[`name_${language}` as keyof Tables<"products">] as string,
        nameEn: p.name_en,
        description: p[`description_${language}` as keyof Tables<"products">] as string,
        descriptionEn: p.description_en,
        price: Number(price),
        originalPrice: p.original_price ?? undefined,
        wholesalePrice: p.wholesale_price ?? undefined,
        image: p.image,
        images: p.images ?? [],
        category: p.category_id,
        inStock: p.in_stock ?? false,
        rating: Number(p.rating) || 0,
        reviews: p.reviews_count || 0,
        discount: p.discount ?? undefined,
        featured: p.featured ?? false,
        tags: p.tags ?? [],
        stock_quantity: p.stock_quantity ?? 0,
        active: p.active ?? true,
      };
    });
  }
}
