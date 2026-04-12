import { create } from 'zustand';
import type { Category, SubCategory, Product } from '../../types/catalog';

interface CatalogState {
    categories: Category[];
    subCategories: SubCategory[];
    products: Product[];
    isInitialized: boolean;
    setCatalog: (data: { categories: Category[], subCategories: SubCategory[], products: Product[] }) => void;
    clearCatalog: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
    categories: [],
    subCategories: [],
    products: [],
    isInitialized: false,
    setCatalog: (data) => set({
        categories: data.categories,
        subCategories: data.subCategories,
        products: data.products,
        isInitialized: true
    }),
    clearCatalog: () => set({
        categories: [],
        subCategories: [],
        products: [],
        isInitialized: false
    })
}));
