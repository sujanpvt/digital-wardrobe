import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClothingItem {
  _id: string;
  name: string;
  category: string;
  subcategory: string;
  color: string;
  brand?: string;
  size?: string;
  imageUrl: string;
  tags: string[];
  isInWash: boolean;
  style: string;
  season: string;
  occasion: string;
}

interface Outfit {
  _id: string;
  name: string;
  items: ClothingItem[];
  tags: string[];
  occasion: string;
  season: string;
  style: string;
  rating?: number;
  isFavorite: boolean;
  wearCount: number;
  lastWorn?: string;
  createdAt: string;
  isAIGenerated: boolean;
  aiConfidence?: number;
}

interface OutfitContextType {
  selectedItems: ClothingItem[];
  addToSelection: (item: ClothingItem) => void;
  removeFromSelection: (itemId: string) => void;
  clearSelection: () => void;
  currentOutfit: Outfit | null;
  setCurrentOutfit: (outfit: Outfit | null) => void;
}

const OutfitContext = createContext<OutfitContextType | undefined>(undefined);

export const useOutfit = () => {
  const context = useContext(OutfitContext);
  if (context === undefined) {
    throw new Error('useOutfit must be used within an OutfitProvider');
  }
  return context;
};

interface OutfitProviderProps {
  children: ReactNode;
}

export const OutfitProvider: React.FC<OutfitProviderProps> = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);

  const addToSelection = (item: ClothingItem) => {
    setSelectedItems(prev => {
      if (prev.some(selectedItem => selectedItem._id === item._id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromSelection = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item._id !== itemId));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const value = {
    selectedItems,
    addToSelection,
    removeFromSelection,
    clearSelection,
    currentOutfit,
    setCurrentOutfit
  };

  return (
    <OutfitContext.Provider value={value}>
      {children}
    </OutfitContext.Provider>
  );
};
