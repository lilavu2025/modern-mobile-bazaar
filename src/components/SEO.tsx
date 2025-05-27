import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

const SEO = ({
  title,
  description,
  keywords,
  image = '/og-image.png',
  url = window.location.href,
  type = 'website',
}: SEOProps) => {
  const { t, language } = useLanguage();
  
  const siteTitle = t('storeName');
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = t('storeDescription');
  const finalDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'} />
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={language === 'ar' ? 'ar_SA' : language === 'he' ? 'he_IL' : 'en_US'} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#000000" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data for E-commerce */}
      {type === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteTitle,
            description: finalDescription,
            url: url,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${window.location.origin}/products?search={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;