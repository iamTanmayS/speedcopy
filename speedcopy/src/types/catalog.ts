import {
    UUID,
    ISODateString,
    PaisaAmount,
    Percentage,
    DeliveryBadge,
    DPI,
    BasePaginationParams
} from "./shared";
import { EditorState } from "./upload";

export type TopLevelCategory = "printing" | "gifts" | "stationery";

export interface Category {
    id: UUID;
    name: string;
    slug: string;
    topLevel: TopLevelCategory;
    parentId?: UUID;
    imageUrl?: string;
    displayOrder: number;
    isActive: boolean;
    visibleCities: UUID[];
    children?: Category[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface CategoryListResponse {
    categories: Category[];
}

export type PaperFinish = "matte" | "glossy" | "silk" | "uncoated";
export type PrintSide = "single" | "double";
export type LaminationType = "matte" | "glossy" | "soft-touch" | "none";

export interface SKUAttribute {
    key: string;
    value: string;
}

export interface CityPricing {
    cityId: UUID;
    mrp: PaisaAmount;
    sellingPrice: PaisaAmount;
    discountPercent: Percentage;
    deliveryBadge: DeliveryBadge;
    isAvailable: boolean;
}

export interface SKU {
    id: UUID;
    productId: UUID;
    name: string;
    attributes: SKUAttribute[];
    mrp: PaisaAmount;
    sellingPrice: PaisaAmount;
    discountPercent: Percentage;
    deliveryBadge: DeliveryBadge;
    minQuantity: number;
    maxQuantity: number;
    isActive: boolean;
    stockAvailable: boolean;
    cityPricing?: CityPricing[];
}

export interface Product {
    id: UUID;
    categoryId: UUID;
    category?: Category;
    name: string;
    slug: string;
    description?: string;
    thumbnailUrl: string;
    imageUrls: string[];
    skus: SKU[];
    requiresFileUpload: boolean;
    requiresCustomization: boolean;
    primaryCTA: "edit_and_print" | "customize" | "order_now";
    minDPI: DPI;
    isActive: boolean;
    tags: string[];
    templateIds?: UUID[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ProductDetailResponse {
    product: Product;
}

export interface CreateCategoryRequest {
    name: string;
    topLevel: TopLevelCategory;
    parentId?: UUID;
    imageUrl?: string;
    displayOrder: number;
    visibleCities: UUID[];
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
    categoryId: UUID;
}

export interface ReorderCategoriesRequest {
    orderedIds: UUID[];
}

export interface CreateProductRequest {
    categoryId: UUID;
    name: string;
    description?: string;
    thumbnailUrl: string;
    imageUrls: string[];
    requiresFileUpload: boolean;
    requiresCustomization: boolean;
    primaryCTA: Product["primaryCTA"];
    minDPI: DPI;
    tags: string[];
    templateIds?: UUID[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    productId: UUID;
}

export interface CreateSKURequest {
    productId: UUID;
    name: string;
    attributes: SKUAttribute[];
    mrp: PaisaAmount;
    sellingPrice: PaisaAmount;
    deliveryBadge: DeliveryBadge;
    minQuantity: number;
    maxQuantity: number;
}

export interface UpdateSKURequest extends Partial<CreateSKURequest> {
    skuId: UUID;
}

export interface UpsertCityPricingRequest {
    skuId: UUID;
    cityPricings: CityPricing[];
}

export interface MapSKUsToVendorRequest {
    vendorId: UUID;
    skuIds: UUID[];
}

export type TemplateCategory = "festival" | "business" | "wedding" | "birthday" | "custom";

export interface DesignTemplate {
    id: UUID;
    name: string;
    thumbnailUrl: string;
    previewUrl: string;
    category: TemplateCategory;
    productIds: UUID[];
    skuIds: UUID[];
    editorState: EditorState;
    isActive: boolean;
    isPremium: boolean;
    createdBy: UUID;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface TemplateListRequest extends BasePaginationParams {
    categoryId?: UUID;
    productId?: UUID;
    isPremium?: boolean;
}

export interface TemplateListResponse {
    templates: DesignTemplate[];
    total: number;
    page: number;
    pageSize: number;
}

export interface CreateTemplateRequest {
    name: string;
    thumbnailUrl: string;
    previewUrl: string;
    category: TemplateCategory;
    productIds: UUID[];
    skuIds: UUID[];
    editorState: EditorState;
    isPremium: boolean;
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
    templateId: UUID;
}

export type BannerActionType =
    | "open_category"
    | "open_product"
    | "open_url"
    | "apply_coupon"
    | "open_search";

export interface PromoBanner {
    id: UUID;
    imageUrl: string;
    title?: string;
    subtitle?: string;
    actionType: BannerActionType;
    actionValue: string;
    displayOrder: number;
    visibleCities: UUID[];
    validFrom: ISODateString;
    validUntil: ISODateString;
    isActive: boolean;
    createdBy: UUID;
    createdAt: ISODateString;
}

export interface HomeScreenConfig {
    banners: PromoBanner[];
    featuredCategories: Category[];
    featuredProducts: Product[];
    offerStrip?: string;
    fetchedAt: ISODateString;
}

export interface CreateBannerRequest {
    imageUrl: string;
    title?: string;
    subtitle?: string;
    actionType: BannerActionType;
    actionValue: string;
    displayOrder: number;
    visibleCities: UUID[];
    validFrom: ISODateString;
    validUntil: ISODateString;
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {
    bannerId: UUID;
}
