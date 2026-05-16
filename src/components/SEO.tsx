import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { getDocument, SEO_DOC } from '../services/firestoreService';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({ 
  title, 
  description, 
  image,
  url,
  type = "website"
}: SEOProps) {
  const [fallbacks, setFallbacks] = useState<{ title: string; description: string; ogImage: string; logoUrl: string } | null>(null);

  useEffect(() => {
    async function loadFallbacks() {
      const [seo, settings] = await Promise.all([
        getDocument<any>(SEO_DOC),
        getDocument<any>('settings/global')
      ]);
      setFallbacks({
        title: seo?.title || "Sankalp Suman | QA Engineering & AI Portfolio",
        description: seo?.description || "Advanced AI-Powered QA Engineering Portfolio.",
        ogImage: seo?.ogImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200&h=630",
        logoUrl: settings?.logoUrl || ""
      });
    }
    loadFallbacks();
  }, []);

  const currentUrl = url || window.location.href;
  const finalTitle = title || fallbacks?.title || "Sankalp Suman | QA Engineering & AI Portfolio";
  const finalDescription = description || fallbacks?.description || "Advanced AI-Powered QA Engineering Portfolio.";
  const finalImage = image || fallbacks?.ogImage || fallbacks?.logoUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200&h=630";
  const siteTitle = finalTitle.includes("Sankalp Suman") ? finalTitle : `${finalTitle} | Sankalp Suman`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={finalDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
}
