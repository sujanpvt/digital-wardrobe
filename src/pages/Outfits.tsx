import React, { useState, useEffect, useCallback } from 'react';
import { squareThumb } from '../services/images';
import { useAuth } from '../contexts/AuthContext';
import { outfitsAPI } from '../services/api';
import { 
  Heart, 
  Star, 
  Calendar, 
  Shuffle,
  Filter,
  Grid,
  List,
  Plus,
  Trash2,
} from 'lucide-react';

interface Outfit {
  _id: string;
  name: string;
  items: any[];
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

const Outfits: React.FC = () => {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAIGenerated, setShowAIGenerated] = useState(false);

  const occasions = [
    { value: 'all', label: 'All Occasions' },
    { value: 'work', label: 'Work' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'sport', label: 'Sport' },
    { value: 'party', label: 'Party' },
    { value: 'date', label: 'Date' },
    { value: 'travel', label: 'Travel' },
    { value: 'home', label: 'Home' }
  ];

  const fetchOutfits = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedOccasion !== 'all') {
        filters.occasion = selectedOccasion;
      }
      if (showFavorites) {
        filters.isFavorite = true;
      }
      if (showAIGenerated) {
        filters.isAIGenerated = true;
      }
      
      const response = await outfitsAPI.getUserOutfits(user!.id, filters);
      setOutfits(response.outfits);
    } catch (error) {
      console.error('Error fetching outfits:', error);
    } finally {
      setLoading(false);
    }
  }, [outfitsAPI, user, selectedOccasion, showFavorites, showAIGenerated]);

  useEffect(() => {
    if (user) {
      fetchOutfits();
    }
  }, [user, selectedOccasion, showFavorites, showAIGenerated, fetchOutfits]);


  const handleToggleFavorite = async (outfitId: string, isFavorite: boolean) => {
    try {
      await outfitsAPI.updateOutfit(outfitId, { isFavorite: !isFavorite });
      fetchOutfits();
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      try {
        await outfitsAPI.deleteOutfit(outfitId);
        fetchOutfits();
      } catch (error) {
        console.error('Error deleting outfit:', error);
      }
    }
  };

  const handleMarkAsWorn = async (outfitId: string) => {
    try {
      await outfitsAPI.markAsWorn(outfitId);
      fetchOutfits();
    } catch (error) {
      console.error('Error marking outfit as worn:', error);
    }
  };

  const filteredOutfits = outfits;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Outfits</h1>
            <p className="text-gray-600">
              {outfits.length} saved outfits
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button className="btn-secondary flex items-center space-x-2">
              <Shuffle className="w-4 h-4" />
              <span>Random Outfit</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Outfit</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-800">{outfits.length}</div>
            <div className="text-sm text-gray-600">Total Outfits</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-800">
              {outfits.filter(o => o.isFavorite).length}
            </div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-800">
              {outfits.reduce((sum, o) => sum + o.wearCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Wears</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-800">
              {outfits.filter(o => o.isAIGenerated).length}
            </div>
            <div className="text-sm text-gray-600">AI Generated</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Occasion Filter */}
          <div className="flex flex-wrap gap-2">
            {occasions.map(occasion => (
              <button
                key={occasion.value}
                onClick={() => setSelectedOccasion(occasion.value)}
                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                  selectedOccasion === occasion.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {occasion.label}
              </button>
            ))}
          </div>

          {/* Other Filters */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showFavorites}
                onChange={(e) => setShowFavorites(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">Favorites only</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showAIGenerated}
                onChange={(e) => setShowAIGenerated(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">AI Generated</span>
            </label>

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Outfits Grid/List */}
      {filteredOutfits.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No outfits found
          </h3>
          <p className="text-gray-500 mb-6">
            {outfits.length === 0 
              ? 'Start by creating your first outfit'
              : 'Try adjusting your filters'
            }
          </p>
          {outfits.length === 0 && (
            <button className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Create First Outfit
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredOutfits.map(outfit => (
            <OutfitCard
              key={outfit._id}
              outfit={outfit}
              viewMode={viewMode}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteOutfit}
              onMarkAsWorn={handleMarkAsWorn}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface OutfitCardProps {
  outfit: Outfit;
  viewMode: 'grid' | 'list';
  onToggleFavorite: (outfitId: string, isFavorite: boolean) => void;
  onDelete: (outfitId: string) => void;
  onMarkAsWorn: (outfitId: string) => void;
}

const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  viewMode,
  onToggleFavorite,
  onDelete,
  onMarkAsWorn
}) => {
  const [showMenu, setShowMenu] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="card flex items-center space-x-4">
        <div className="grid grid-cols-4 gap-2 w-32">
          {outfit.items.slice(0, 4).map((item, index) => (
            <img
              key={index}
              src={squareThumb(item.imageUrl, 96)}
              alt={item.name}
              className="w-full h-16 object-cover rounded"
            />
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-800 truncate">{outfit.name}</h3>
            {outfit.isAIGenerated && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                AI
              </span>
            )}
            {outfit.isFavorite && (
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="capitalize">{outfit.occasion}</span>
            <span className="capitalize">{outfit.style}</span>
            <span>Worn {outfit.wearCount} times</span>
          </div>
          {outfit.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {outfit.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {outfit.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{outfit.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onMarkAsWorn(outfit._id)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
            title="Mark as worn"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleFavorite(outfit._id, outfit.isFavorite)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              outfit.isFavorite 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={outfit.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    onDelete(outfit._id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {outfit.items.slice(0, 4).map((item, index) => (
          <img
            key={index}
            src={squareThumb(item.imageUrl, 192)}
            alt={item.name}
            className="w-full h-24 object-cover rounded"
          />
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-800 truncate">{outfit.name}</h3>
          <div className="flex items-center space-x-1">
            {outfit.isAIGenerated && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                AI
              </span>
            )}
            {outfit.isFavorite && (
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="capitalize">{outfit.occasion}</span>
            <span className="capitalize">{outfit.style}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Worn {outfit.wearCount} times</span>
            {outfit.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span>{outfit.rating}</span>
              </div>
            )}
          </div>
        </div>

        {outfit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {outfit.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {outfit.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{outfit.tags.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onMarkAsWorn(outfit._id)}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 text-sm"
          >
            <Calendar className="w-3 h-3" />
            <span>Worn</span>
          </button>

          <button
            onClick={() => onToggleFavorite(outfit._id, outfit.isFavorite)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors duration-200 text-sm ${
              outfit.isFavorite 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>{outfit.isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Outfits;
