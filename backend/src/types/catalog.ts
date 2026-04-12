export type CategoryType = "printing" | "gifts" | "stationery";

export type CustomizationMode = "none" | "upload_only" | "editor_only" | "upload_or_editor";

export type CTAType = "edit_and_print" | "customize";

export type DeliveryBadge = "same_day" | "next_day";

export interface Category {
  id: string;
  name: CategoryType;
  isActive: boolean;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  title: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  subCategoryId: string;
  slug: string;
  title: string;
  description?: string;
  customizationMode: CustomizationMode;
  primaryCTA: CTAType;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SKU {
  id: string;
  productId: string;
  skuCode: string;
  title: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  deliveryBadge?: DeliveryBadge;
  isActive: boolean;
}

export interface ProductConfigOption {
  id: string;
  productId: string;
  key: string;
  label: string;
  type: "single" | "multi";
  isRequired: boolean;
  sortOrder: number;
}

export interface ProductConfigOptionValue {
  id: string;
  optionId: string;
  value: string;
  label: string;
  priceDelta: number;
  sortOrder: number;
}

export interface QuantitySlab {
  id: string;
  skuId: string;
  minQty: number;
  maxQty?: number;
  unitPrice: number;
}

// Payload schemas for API
export interface ProductDetailResponse {
  product: Product;
  skus: SKU[];
  options: ProductConfigOption[];
  optionValues: ProductConfigOptionValue[];
  slabs: QuantitySlab[];
}
