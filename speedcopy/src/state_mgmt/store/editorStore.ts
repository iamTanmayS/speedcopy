import { create } from 'zustand';

export type ElementType = 'text' | 'image' | 'shape';

export interface EditorElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string; // text string or image URI
  style?: {
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
  };
  zIndex: number;
}

export type PageSize = 'A4' | 'A3' | 'Square' | 'BusinessCard';

export interface EditorState {
  elements: EditorElement[];
  selectedElementId: string | null;
  pageSize: PageSize;
  canvasDimensions: { width: number; height: number };
  snapGuides: { x: boolean; y: boolean };
  
  // Actions
  addElement: (element: Omit<EditorElement, 'id' | 'zIndex'>) => void;
  duplicateElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setPageSize: (size: PageSize) => void;
  setCanvasDimensions: (width: number, height: number) => void;
  setSnapGuides: (guides: { x: boolean; y: boolean }) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  resetEditor: () => void;
}

const PAGE_RATIOS: Record<PageSize, number> = {
  'A4': 1.414, // 210 x 297
  'A3': 1.414,
  'Square': 1,
  'BusinessCard': 0.58, // 85 x 55 
};

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [],
  selectedElementId: null,
  pageSize: 'A4',
  canvasDimensions: { width: 300, height: 424 }, // initial default
  snapGuides: { x: false, y: false },

  addElement: (element) => {
    const newElement: EditorElement = {
      ...element,
      id: Math.random().toString(36).substring(7),
      zIndex: get().elements.length,
    };
    set((state) => ({ 
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id 
    }));
  },

  duplicateElement: (id) => {
    const element = get().elements.find(el => el.id === id);
    if (!element) return;

    const newElement: EditorElement = {
      ...element,
      id: Math.random().toString(36).substring(7),
      x: element.x + 20,
      y: element.y + 20,
      zIndex: get().elements.length,
    };

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id
    }));
  },

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => el.id === id ? { ...el, ...updates } : el)
  })),

  removeElement: (id) => set((state) => ({
    elements: state.elements.filter((el) => el.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
  })),

  selectElement: (id) => set({ selectedElementId: id }),

  setPageSize: (pageSize) => set({ pageSize }),

  setCanvasDimensions: (width, height) => set({ canvasDimensions: { width, height } }),

  setSnapGuides: (guides) => set({ snapGuides: guides }),

  bringToFront: (id) => set((state) => {
    const maxZ = Math.max(...state.elements.map(el => el.zIndex), 0);
    return {
      elements: state.elements.map(el => el.id === id ? { ...el, zIndex: maxZ + 1 } : el)
    };
  }),

  sendToBack: (id) => set((state) => {
    const minZ = Math.min(...state.elements.map(el => el.zIndex), 0);
    return {
      elements: state.elements.map(el => el.id === id ? { ...el, zIndex: minZ - 1 } : el)
    };
  }),

  resetEditor: () => set({ elements: [], selectedElementId: null }),
}));
