import { UUID, PaisaAmount, ISODateString, DeliveryMode } from './shared.js';
import { Product, SKU } from './catalog.js';
import { UploadedFile } from './upload.js';

export interface CartItem {
    id: UUID;
    cartId: UUID;
    productId: UUID;
    product?: Product;
    skuId: UUID;
    sku?: SKU;
    quantity: number;
    fileId?: UUID;
    uploadedFile?: UploadedFile;
    unitPrice: PaisaAmount;
    totalPrice: PaisaAmount;
}

export interface Cart {
    id: UUID;
    customerId: UUID;
    items: CartItem[];
    subtotal: PaisaAmount;
    deliveryFee: PaisaAmount;
    totalAmount: PaisaAmount;
    status: "active" | "checked_out";
    updatedAt: ISODateString;
}

export interface AddToCartRequest {
    productId: UUID;
    skuId: UUID;
    quantity: number;
    fileId?: UUID;
}
