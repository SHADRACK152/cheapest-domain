export interface Domain {
  name: string;
  extension: string;
  fullDomain: string;
  price: number;
  renewPrice: number;
  available: boolean;
  premium: boolean;
  priceKES?: number; // Price in Kenyan Shillings
  renewPriceKES?: number; // Renewal price in KES
}

export interface DomainExtension {
  extension: string;
  price: number;
  renewPrice: number;
  popular: boolean;
  description?: string;
}

export interface SearchResult {
  exact: Domain | null;
  suggestions: Domain[];
  premium: Domain[];
  taken: Domain[];
}

export interface CartItem {
  domain: Domain;
  idProtection: boolean;
  years: number;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  provider: string;
  supportEmail: string;
  supportPhone: string;
}
