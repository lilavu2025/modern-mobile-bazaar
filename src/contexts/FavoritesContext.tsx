import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product } from '@/types';

interface FavoritesState {
  items: Product[];
  count: number;
}

type FavoritesAction =
  | { type: 'ADD_FAVORITE'; payload: Product }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; payload: Product[] };

interface FavoritesContextType {
  state: FavoritesState;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'ADD_FAVORITE': {
      const product = action.payload;
      
      // Check if product is already in favorites
      if (state.items.some(item => item.id === product.id)) {
        return state;
      }
      
      const updatedItems = [...state.items, product];
      return {
        items: updatedItems,
        count: updatedItems.length
      };
    }
    
    case 'REMOVE_FAVORITE': {
      const productId = action.payload;
      const updatedItems = state.items.filter(item => item.id !== productId);
      
      return {
        items: updatedItems,
        count: updatedItems.length
      };
    }
    
    case 'CLEAR_FAVORITES':
      return {
        items: [],
        count: 0
      };
    
    case 'LOAD_FAVORITES': {
      const items = action.payload;
      return {
        items,
        count: items.length
      };
    }
    
    default:
      return state;
  }
};

const initialState: FavoritesState = {
  items: [],
  count: 0
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  
  // Load favorites from localStorage on mount
  React.useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const favoriteItems = JSON.parse(savedFavorites);
        dispatch({ type: 'LOAD_FAVORITES', payload: favoriteItems });
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
      }
    }
  }, []);
  
  // Save favorites to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(state.items));
  }, [state.items]);
  
  const addFavorite = (product: Product) => {
    dispatch({ type: 'ADD_FAVORITE', payload: product });
  };
  
  const removeFavorite = (productId: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: productId });
  };
  
  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  };
  
  const isFavorite = (productId: string) => {
    return state.items.some(item => item.id === productId);
  };
  
  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };
  
  const value: FavoritesContextType = {
    state,
    addFavorite,
    removeFavorite,
    clearFavorites,
    isFavorite,
    toggleFavorite
  };
  
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;