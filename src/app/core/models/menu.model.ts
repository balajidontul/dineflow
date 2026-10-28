export type SpiceLevel = 'none' | 'mild' | 'medium' | 'spicy' | 'extra_spicy';

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  localName?: string; // e.g. "मटण", "थाळी"
  description?: string;
  displayOrder: number;
  icon?: string;
  isActive: boolean;
  itemCount?: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  localName?: string; // e.g. "मटण स्पेशल थाळी"
  description: string;
  ingredients?: string[];
  price: number;
  discountPrice?: number;
  imageUrl: string;
  veg: boolean;
  available: boolean;
  bestseller: boolean;
  spiceLevel: SpiceLevel;
  preparationTime: number; // in minutes
  calories?: number;
  portionSize?: string; // e.g. "1 Thali (Serves 1)", "500 ml"
}

