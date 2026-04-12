export type PrintCategory = 'Document Printing' | 'Business Printing' | string;
export type BindingType = 'standard' | 'soft' | 'spiral' | 'thesis' | string;

export interface PrintOptions {
  colorMode: string;
  pageSize: string;
  printSide: string;
  coverPageColor: string;
  copies: number;
  linearGraphAddon: number;
  semiLogGraphAddon: number;
  instructions: string;
}

export interface PrintFile {
  uri: string;
  name: string;
  type?: string;
  size?: number;
}

export interface PrintJob {
  id: string; // Unique identifier for the job
  category: PrintCategory;
  bindingType: BindingType;
  file: PrintFile | null; // Nullable if file not yet uploaded or just dummy for now
  options: PrintOptions;
  price: number; // Final calculated price for this singular job
}
