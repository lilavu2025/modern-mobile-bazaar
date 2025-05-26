
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export const useCategories = () => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ['categories', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('created_at');

      if (error) throw error;

      return data.map(category => ({
        id: category.id,
        name: category[`name_${language}` as keyof typeof category] as string,
        nameEn: category.name_en,
        image: category.image,
        icon: category.icon,
        count: 0, // This would be calculated from products count
      }));
    },
  });
};

export const useProducts = (categoryId?: string) => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ['products', categoryId, language],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, categories!inner(*)')
        .eq('active', true);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(product => ({
        id: product.id,
        name: product[`name_${language}` as keyof typeof product] as string,
        nameEn: product.name_en,
        description: product[`description_${language}` as keyof typeof product] as string,
        descriptionEn: product.description_en,
        price: Number(product.price),
        originalPrice: product.original_price ? Number(product.original_price) : undefined,
        image: product.image,
        images: product.images || [],
        category: product.categories[`name_${language}` as keyof typeof product.categories] as string,
        inStock: product.in_stock || false,
        rating: Number(product.rating) || 0,
        reviews: product.reviews_count || 0,
        discount: product.discount ? Number(product.discount) : undefined,
        featured: product.featured || false,
        tags: product.tags || [],
      }));
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

      return data.map(banner => ({
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
