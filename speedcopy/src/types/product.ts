export type PrintCategory = 'business_cards' | 'flyers' | 'photo_prints' | 'invitations' | 'posters' | 'gifts' | 'all';

export interface PrintOptionsConfig {
  paperSizes: string[];
  paperTypes: string[];    // e.g., "Matte 300gsm", "Standard 100gsm"
  colorOptions: string[];  // e.g., "Black & White", "Full Color"
  bindingOptions?: string[]; // Optional: "Spiral", "Soft Cover"
  lamination?: string[];   // Optional: "Gloss", "Matte"
}

export interface PrintProduct {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  currency: string;
  mrp?: number;
  discountPercentage?: number;
  discountTag?: string;
  imageUrl: string;
  categoryId: PrintCategory;
  isNewArrival: boolean;
  isTrending: boolean;
  isFavorite?: boolean;
  isRecentlyViewed: boolean;
  printOptionsConfig: PrintOptionsConfig;
  deliveryPackages: {
    name: string;
    estimatedDays: number;
    price: number;
  }[];
  addOns?: {
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}
