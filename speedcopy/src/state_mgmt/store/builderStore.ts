import { create } from 'zustand';
import { PrintJob, PrintCategory, BindingType, PrintOptions, PrintFile } from '../../types/printJob';

interface BuilderStore {
  currentJob: Partial<PrintJob>;
  setCategory: (category: PrintCategory) => void;
  setBindingType: (bindingType: BindingType) => void;
  setFile: (file: PrintFile) => void;
  setOptions: (options: Partial<PrintOptions>) => void;
  calculatePrice: () => number;
  resetBuilder: () => void;
}

const DEFAULT_OPTIONS: PrintOptions = {
  colorMode: 'B&W',
  pageSize: 'A4',
  printSide: 'one-sided',
  coverPageColor: 'Blue',
  copies: 1,
  linearGraphAddon: 0,
  semiLogGraphAddon: 0,
  instructions: '',
};

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  currentJob: {
    options: DEFAULT_OPTIONS,
  },
  setCategory: (category) => set((state) => ({ currentJob: { ...state.currentJob, category } })),
  setBindingType: (bindingType) => set((state) => ({ currentJob: { ...state.currentJob, bindingType } })),
  setFile: (file) => set((state) => ({ currentJob: { ...state.currentJob, file } })),
  setOptions: (options) => set((state) => ({
    currentJob: {
      ...state.currentJob,
      options: { ...state.currentJob.options, ...options } as PrintOptions
    }
  })),
  calculatePrice: () => {
    const { currentJob } = get();
    // Complex dummy formula:
    let base = 20; 
    const isColor = currentJob.options?.colorMode?.toLowerCase() === 'color';
    const copies = currentJob.options?.copies || 1;
    
    let bindingFee = 0;
    if (currentJob.bindingType === 'spiral') bindingFee = 30;
    else if (currentJob.bindingType === 'thesis') bindingFee = 150;
    else if (currentJob.bindingType === 'soft') bindingFee = 50;

    const addons = (currentJob.options?.linearGraphAddon || 0) * 2 + (currentJob.options?.semiLogGraphAddon || 0) * 3;

    let perCopyRate = isColor ? 10 : 2; 

    return base + bindingFee + (copies * perCopyRate) + addons;
  },
  resetBuilder: () => set({ currentJob: { options: DEFAULT_OPTIONS } }),
}));
