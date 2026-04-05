import { UUID, ISODateString, PaisaAmount } from "./shared";

export interface Category {
    id: UUID;
    name: string;
    imageUrl?: string;
    isActive: boolean;
}

export interface SKU {
    id: UUID;
    productId: UUID;
    name: string;         // e.g. "A4 Color Single-side"
    sellingPrice: PaisaAmount;
    isActive: boolean;
}

export interface Product {
    id: UUID;
    categoryId: UUID;
    category?: Category;
    name: string;         // e.g. "Document Printing"
    description?: string;
    thumbnailUrl: string;
    skus: SKU[];
    requiresFileUpload: boolean;
    isActive: boolean;
}
