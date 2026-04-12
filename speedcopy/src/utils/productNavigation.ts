export const getProductRouteParams = (product: any, catalog: any) => {
    if (!product || !catalog) return null;

    const subCat = catalog.subCategories.find((sc: any) => sc.id === product.subCategoryId);
    const category = catalog.categories.find((c: any) => c.id === subCat?.categoryId);
    const catName = category?.name?.toLowerCase() || '';

    if (catName === 'printing') {
        return {
            screen: 'SubCategorySelect',
            params: {
                categoryId: category!.id,
                productId: product.id,
                customizationMode: product.customizationMode
            }
        };
    } else if (catName === 'shopping' || catName === 'stationery') {
        return {
            screen: 'ShoppingProductDetail',
            params: { productId: product.id }
        };
    } else if (catName === 'gifts') {
        return {
            screen: 'GiftProductDetail',
            params: { productId: product.id }
        };
    } else {
        // fallback default
        return {
            screen: 'ProductDetail',
            params: { productId: product.id }
        };
    }
};
