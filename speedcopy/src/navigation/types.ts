export type AuthStackParamList = {
  Login: undefined;
  OTP: { email: string };
  ProfileSetup: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  CategoryListing: undefined;
  SubCategorySelect: { categoryId: string; productId: string; customizationMode: string };
  ProductList: { categoryId: string; subCategoryId?: string };
  ProductDetail: { productId: string };
  GiftProductDetail: { productId: string };
  ShoppingProductDetail: { productId: string };
  Upload: { productId: string };
  GiftCustomize: { productId: string; productTitle?: string; skuId?: string; skuTitle?: string; qty?: number; configSelections?: Record<string, string>; unitPrice?: number; totalPrice?: number; uploadOnly?: boolean };
  Editor: { fileId: string };
  PreviewLock: { orderId: string };
  AddressList: undefined;
  AddNewAddress: undefined;
  DeliveryMode: undefined;
  Cart: undefined;
  Checkout: undefined;
  Payment: undefined;
  TrackOrder: { orderId: string };
};

export type OrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string };
  TrackOrder: { orderId: string };
  LiveMap: { orderId: string };
  Feedback: { orderId: string };
};

export type ProfileStackParamList = {
  ProfileOverview: undefined;
  Notifications: undefined;
  DataExport: undefined;
  Wallet: undefined;
  Referrals: undefined;
  SupportTicket: undefined;
  OrderList: undefined;
  TrackOrder: { orderId: string };
  AddressList: undefined;
  AddNewAddress: undefined;
  FAQ: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  MainActionTab: undefined;
  CartTab: undefined;
  WishlistTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileSetup: undefined;
};
