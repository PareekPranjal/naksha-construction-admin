// Shared client-side types for the SEO admin page.

export type Address = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type SeoSettings = {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultOgImage: string;
  favicon: string;
  appleTouchIcon: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    address?: Address;
  };
  organizationSchema: {
    type: string;
    name: string;
    logo?: string;
    description?: string;
  };
  localBusiness: {
    telephone?: string;
    email?: string;
    priceRange?: string;
    openingHours?: string[];
    address?: Address;
    geo?: { latitude?: number; longitude?: number };
  };
  faqItems: { question: string; answer: string }[];
  googleSiteVerification: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  customHeadScripts: string;
  robotsTxt: string;
};

export type SeoPage = {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
};

export type ContentRow = {
  id: string;
  slug: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoOgImage: string | null;
  seoKeywords: string[] | null;
  seoOgTitle: string | null;
  seoOgDescription: string | null;
  seoCanonicalUrl: string | null;
  seoNoIndex: boolean | null;
  seoNoFollow: boolean | null;
  hasSEO: boolean;
};

export type SeoStats = {
  seoPages: number;
  projects: { total: number; optimized: number; missing: number };
  services: { total: number; optimized: number; missing: number };
  articles: { total: number; optimized: number; missing: number };
  tracking: {
    googleSiteVerification: boolean;
    googleAnalyticsId: boolean;
    googleTagManagerId: boolean;
    facebookPixelId: boolean;
  };
};
