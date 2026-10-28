export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  fontFamily?: string;
  darkSidebar: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  localName?: string;
  logoUrl: string;
  coverImageUrl: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  gstNumber: string;
  currency: string;
  currencySymbol: string;
  isOpen: boolean;
  openingHours: string;
  rating: number;
  reviewCount: number;
  prepTimeEstimate: string;
  taxPercentage: number;
  serviceChargePercentage: number;
  theme: ThemeSettings;
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
}

