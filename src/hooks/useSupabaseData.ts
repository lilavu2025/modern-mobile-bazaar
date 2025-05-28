import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export const useCategories = () => {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['categories', language],
    queryFn: async () => {
      console.log('Fetching categories from database...');
      
      // جلب الفئات
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('created_at');
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }
      
      console.log('Raw categories data:', categories);
      
      // جلب عدد المنتجات لكل فئة
      const categoriesWithCounts = await Promise.all(
        (categories || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('active', true);
          
          if (countError) {
            console.error('Error counting products for category:', category.id, countError);
          }
          
          return {
            id: category.id,
            name: category[`name_${language}` as keyof typeof category] as string,
            nameEn: category.name_en,
            image: category.image,
            icon: category.icon,
            count: count || 0,
          };
        })
      );
      
      console.log('Processed categories with counts:', categoriesWithCounts);
      return categoriesWithCounts;
    },
  });
};

export const useProducts = (categoryId?: string) => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['products', categoryId, language, profile?.user_type],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, categories!inner(*)')
        .eq('active', true);

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(product => {
        // تحديد السعر حسب نوع المستخدم
        const isWholesale = profile?.user_type === 'wholesale';
        const displayPrice = isWholesale && product.wholesale_price 
          ? Number(product.wholesale_price) 
          : Number(product.price);

        return {
          id: product.id,
          name: product[`name_${language}` as keyof typeof product] as string,
          nameEn: product.name_en,
          description: product[`description_${language}` as keyof typeof product] as string,
          descriptionEn: product.description_en,
          price: displayPrice,
          originalPrice: product.original_price ? Number(product.original_price) : undefined,
          wholesalePrice: product.wholesale_price ? Number(product.wholesale_price) : undefined,
          image: product.image,
          images: product.images || [],
          category: product.categories[`name_${language}` as keyof typeof product.categories] as string,
          inStock: product.in_stock || false,
          rating: Number(product.rating) || 0,
          reviews: product.reviews_count || 0,
          discount: product.discount ? Number(product.discount) : undefined,
          featured: product.featured || false,
          tags: product.tags || [],
          stock_quantity: product.stock_quantity || 0,
        };
      });
    },
  });
};

export const useBanners = () => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ['banners', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (error) throw error;

      return (data || []).map(banner => ({
        id: banner.id,
        title: banner[`title_${language}` as keyof typeof banner] as string,
        subtitle: banner[`subtitle_${language}` as keyof typeof banner] as string,
        image: banner.image,
        link: banner.link,
        active: banner.active,
      }));
    },
  });
};
