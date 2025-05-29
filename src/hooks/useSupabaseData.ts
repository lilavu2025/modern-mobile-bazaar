
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// دالة مساعدة لتجديد التوكن إذا كان قريب من الانتهاء
async function refreshSessionIfNeeded(session) {
  if (!session) return;
  // إذا بقي أقل من 3 دقائق على انتهاء التوكن، جددها
  const expiresIn = session.expires_at * 1000 - Date.now();
  if (expiresIn < 3 * 60 * 1000) {
    try {
      await supabase.auth.refreshSession();
      // يمكن إضافة log هنا
    } catch (err) {
      // يمكن التعامل مع الخطأ هنا
    }
  }
}

/**
 * هوك لجلب الفئات (Categories) من قاعدة البيانات، مع عدد المنتجات داخل كل فئة
 */
export const useCategories = () => {
  const { language } = useLanguage();
  const { session } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await refreshSessionIfNeeded(session);
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
              name: category[`name_${language}`],
              nameEn: category.name_en,
              image: category.image,
              icon: category.icon,
              count: count || 0,
            };
          })
        );

        console.log('📊 الفئات بعد إضافة عدد المنتجات:', categoriesWithCounts);
        setData(categoriesWithCounts);
      } catch (err) {
        console.error('خطأ في جلب الفئات:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [language, session]);

  return {
    data,
    isLoading,
    error,
  };
};

/**
 * هوك لجلب المنتجات، ويمكن تحديد الفئة، ويأخذ بعين الاعتبار لغة المستخدم ونوعه (مفرق أو جملة)
 */
export const useProducts = (categoryId?: string) => {
  const { language } = useLanguage();
  const { profile, session } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await refreshSessionIfNeeded(session);
        console.log('🛍️ بدء جلب المنتجات...');
        console.log('🔍 الفئة المحددة:', categoryId || 'all');
        console.log('👤 نوع المستخدم:', profile?.user_type || 'guest');

        let q = supabase
          .from('products')
          .select('*, categories!inner(*)') // ربط المنتج بالفئة داخلياً
          .eq('active', true);

        if (categoryId && categoryId !== 'all') {
          q = q.eq('category_id', categoryId);
        }

        const { data: products, error: productsError } = await q.order('created_at', { ascending: false });

        if (productsError) {
          console.error('❌ خطأ أثناء جلب المنتجات:', productsError);
          throw productsError;
        }

        console.log('✅ المنتجات التي تم جلبها:', products);

        // تجهيز المنتجات للعرض
        const processedProducts = (products || []).map(product => {
          const isWholesale = profile?.user_type === 'wholesale';
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
            category: product.categories[`name_${language}`],
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
        setData(processedProducts);
      } catch (err) {
        console.error('خطأ في جلب المنتجات:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, language, profile?.user_type, session]);

  return {
    data,
    isLoading,
    error,
  };
};

/**
 * هوك لجلب البنرات (الإعلانات) المعروضة في الواجهة الرئيسية، حسب اللغة
 */
export const useBanners = () => {
  const { language } = useLanguage();
  const { session } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await refreshSessionIfNeeded(session);
        console.log('🖼️ بدء جلب البنرات...');

        const { data: banners, error: bannersError } = await supabase
          .from('banners')
          .select('*')
          .eq('active', true)
          .order('sort_order');

        if (bannersError) {
          console.error('❌ خطأ أثناء جلب البنرات:', bannersError);
          throw bannersError;
        }

        const processedBanners = (banners || []).map(banner => ({
          id: banner.id,
          title: banner[`title_${language}`],
          subtitle: banner[`subtitle_${language}`],
          image: banner.image,
          link: banner.link,
          active: banner.active,
        }));

        console.log('🎯 البنرات المعالجة:', processedBanners);
        setData(processedBanners);
      } catch (err) {
        console.error('خطأ في جلب البنرات:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [language, session]);

  return {
    data,
    isLoading,
    error,
  };
};
