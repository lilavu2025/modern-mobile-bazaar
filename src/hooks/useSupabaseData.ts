import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * هوك لجلب الفئات (Categories) من قاعدة البيانات، مع عدد المنتجات داخل كل فئة
 */
export const useCategories = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['categories', language],
    queryFn: async () => {
      console.log('📦 بدء جلب الفئات من Supabase...');

      // جلب الفئات النشطة فقط
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('created_at');

      if (categoriesError) {
        console.error('❌ خطأ أثناء جلب الفئات:', categoriesError);
        throw categoriesError;
      }

      console.log('✅ الفئات التي تم جلبها:', categories);

      // جلب عدد المنتجات داخل كل فئة
      const categoriesWithCounts = await Promise.all(
        (categories || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('active', true);

          if (countError) {
            console.warn(`⚠️ خطأ أثناء حساب عدد المنتجات للفئة ${category.id}:`, countError);
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

      console.log('📊 الفئات بعد إضافة عدد المنتجات:', categoriesWithCounts);
      return categoriesWithCounts;
    },
  });
};

/**
 * هوك لجلب المنتجات، ويمكن تحديد الفئة، ويأخذ بعين الاعتبار لغة المستخدم ونوعه (مفرق أو جملة)
 */
export const useProducts = (categoryId?: string) => {
  const { language } = useLanguage();
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['products', categoryId, language, profile?.user_type],
    queryFn: async () => {
      console.log('🛍️ بدء جلب المنتجات...');
      console.log('🔍 الفئة المحددة:', categoryId || 'all');
      console.log('👤 نوع المستخدم:', profile?.user_type || 'guest');

      let query = supabase
        .from('products')
        .select('*, categories!inner(*)') // ربط المنتج بالفئة داخلياً
        .eq('active', true);

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ خطأ أثناء جلب المنتجات:', error);
        throw error;
      }

      console.log('✅ المنتجات التي تم جلبها:', data);

      // تجهيز المنتجات للعرض
      const processedProducts = (data || []).map(product => {
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

      console.log('📦 المنتجات المعالجة:', processedProducts);
      return processedProducts;
    },
  });
};

/**
 * هوك لجلب البنرات (الإعلانات) المعروضة في الواجهة الرئيسية، حسب اللغة
 */
export const useBanners = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['banners', language],
    queryFn: async () => {
      console.log('🖼️ بدء جلب البنرات...');

      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (error) {
        console.error('❌ خطأ أثناء جلب البنرات:', error);
        throw error;
      }

      const banners = (data || []).map(banner => ({
        id: banner.id,
        title: banner[`title_${language}` as keyof typeof banner] as string,
        subtitle: banner[`subtitle_${language}` as keyof typeof banner] as string,
        image: banner.image,
        link: banner.link,
        active: banner.active,
      }));

      console.log('🎯 البنرات المعالجة:', banners);
      return banners;
    },
  });
};
