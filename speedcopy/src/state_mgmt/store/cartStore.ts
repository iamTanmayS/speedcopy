import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../../types/cart';

export interface Address {
  id: string;
  label: string;
  address: string;
  pinCode?: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  subLabel?: string;
}

interface CartState {
  cart: CartItem[];
  savedAddresses: Address[];
  selectedAddress: Address | null;
  selectedPaymentMethod: PaymentMethod;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  addAddress: (address: Address) => void;
  setSelectedAddress: (address: Address) => void;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
}

const safeStorage = {
  getItem: async (name: string) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (e) {
      console.warn('AsyncStorage unavailable:', e);
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (e) {
      // Ignore
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (e) {
      // Ignore
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      savedAddresses: [
        { id: '1', label: 'Home', address: '123, MG. Road, Koramangala\nNear Metro station', pinCode: '560034' },
        { id: '2', label: 'Office', address: '45, Bridge Road, Indiranagar\nOpposite Park', pinCode: '560038' }
      ],
      selectedAddress: {
        id: '1',
        label: 'Home',
        address: '123, MG. Road, Koramangala\nNear Metro station',
        pinCode: '560034'
      }, // Default mock matching the current design
      selectedPaymentMethod: {
        id: 'upi',
        label: 'UPI Payments',
        subLabel: 'Google Pay, Phone Pay, Paytm'
      },
      addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== itemId)
      })),
      clearCart: () => set({ cart: [] }),
      getTotalPrice: () => {
        return get().cart.reduce((total, item) => {
          // Fallback to 'price' if 'totalPrice' is missing (for printing flow)
          const itemPrice = item.totalPrice !== undefined ? item.totalPrice : (item as any).price || 0;
          return total + itemPrice;
        }, 0);
      },
      addAddress: (address) => set((state) => ({ savedAddresses: [...state.savedAddresses, address] })),
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method })
    }),
    {
      name: 'print-cart-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
