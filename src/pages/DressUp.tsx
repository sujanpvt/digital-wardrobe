import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOutfit } from '../contexts/OutfitContext';
import { itemsAPI, outfitsAPI, aiAPI } from '../services/api';
import { squareThumb } from '../services/images';
import { 
  Shirt, 
  Footprints, 
  Watch, 
  Sparkles,
  Save,
  Shuffle,
  Heart,
  X
} from 'lucide-react';
// Removed unused component import to clean up warnings

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
  createdAt: string;
}

const DressUp: React.FC = () => {
  const { user } = useAuth();
  const { selectedItems, addToSelection, removeFromSelection, clearSelection } = useOutfit();
  const [userItems, setUserItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('top');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [filterOccasion, setFilterOccasion] = useState('casual');
  const [filterStyle, setFilterStyle] = useState('casual');
  const [filterSeason, setFilterSeason] = useState('all-season');
  const [preferredColor, setPreferredColor] = useState('');

  const categories = [
    { value: 'top', label: 'Tops', icon: Shirt },
    { value: 'bottom', label: 'Bottoms', icon: Shirt },
    { value: 'shoes', label: 'Shoes', icon: Footprints },
    { value: 'accessories', label: 'Accessories', icon: Watch },
    { value: 'outerwear', label: 'Outerwear', icon: Shirt },
  ];

  const fetchUserItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getUserItems(user!.id, { isInWash: false });
      setUserItems(response.items);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [itemsAPI, user]);

  useEffect(() => {
    if (user) {
      fetchUserItems();
    }
  }, [user, fetchUserItems]);

  const handleAISuggestions = async () => {
    try {
      setGeneratingAI(true);
      const response = await aiAPI.suggestOutfits({
        occasion: filterOccasion,
        weather: 'moderate',
        style: filterStyle,
        season: filterSeason,
        preferredColor: preferredColor || undefined,
      });
      setAiSuggestions(response.outfits);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveOutfit = async () => {
    if (selectedItems.length < 2) {
      alert('Please select at least 2 items to create an outfit');
      return;
    }

    if (!outfitName.trim()) {
      alert('Please enter a name for your outfit');
      return;
    }

    try {
      setSavingOutfit(true);
      await outfitsAPI.create({
        name: outfitName,
        items: selectedItems.map(item => item._id),
        occasion: 'casual',
        season: 'all-season',
        style: 'casual'
      });
      
      setOutfitName('');
      clearSelection();
      alert('Outfit saved successfully!');
    } catch (error) {
      console.error('Error saving outfit:', error);
      alert('Failed to save outfit');
    } finally {
      setSavingOutfit(false);
    }
  };

  const handleRandomOutfit = () => {
    clearSelection();
    
    // Get one random item from each category
    const randomItems: ClothingItem[] = [];
    categories.forEach(category => {
      const categoryItems = userItems.filter(item => item.category === category.value);
      if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        randomItems.push(randomItem);
      }
    });

    randomItems.forEach(item => addToSelection(item));
  };

  const filteredItems = userItems.filter(item => item.category === selectedCategory);

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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dress Up</h1>
            <p className="text-gray-600">
              Create outfits by selecting items from your wardrobe
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={handleRandomOutfit}
              className="btn-secondary flex items-center space-x-2"
            >
              <Shuffle className="w-4 h-4" />
              <span>Random</span>
            </button>
            <button
              onClick={handleAISuggestions}
              disabled={generatingAI}
              className="btn-primary flex items-center space-x-2"
            >
              {generatingAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Suggestions</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selected Items Display */}
        {selectedItems.length > 0 && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Selected Items ({selectedItems.length})
              </h3>
              <button
                onClick={clearSelection}
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {selectedItems.map(item => (
                <div key={item._id} className="relative group">
                  <img
                    src={squareThumb(item.imageUrl, 192)}
                    alt={item.name}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFromSelection(item._id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">{item.name}</p>
                </div>
              ))}
            </div>

            {/* Save Outfit */}
            <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
              <input
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="Enter outfit name..."
                className="flex-1 input-field"
              />
              <button
                onClick={handleSaveOutfit}
                disabled={savingOutfit || selectedItems.length < 2}
                className="btn-primary flex items-center space-x-2"
              >
                {savingOutfit ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Outfit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  <span>{category.label}</span>
                  <span className="ml-auto text-sm">
                    {userItems.filter(item => item.category === category.value).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="lg:col-span-3">
          {/* AI Filters */}
          <div className="card mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Occasion</label>
                <select
                  value={filterOccasion}
                  onChange={(e) => setFilterOccasion(e.target.value)}
                  className="input-field"
                >
                  <option value="casual">Casual</option>
                  <option value="work">Work</option>
                  <option value="formal">Formal</option>
                  <option value="sport">Sport</option>
                  <option value="party">Party</option>
                  <option value="date">Date</option>
                  <option value="travel">Travel</option>
                  <option value="home">Home</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Style</label>
                <select
                  value={filterStyle}
                  onChange={(e) => setFilterStyle(e.target.value)}
                  className="input-field"
                >
                  <option value="casual">Casual</option>
                  <option value="smart">Smart</option>
                  <option value="sport">Sport</option>
                  <option value="formal">Formal</option>
                  <option value="street">Street</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Season</label>
                <select
                  value={filterSeason}
                  onChange={(e) => setFilterSeason(e.target.value)}
                  className="input-field"
                >
                  <option value="all-season">All-season</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="autumn">Autumn</option>
                  <option value="winter">Winter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Focus Color</label>
                <input
                  type="text"
                  value={preferredColor}
                  onChange={(e) => setPreferredColor(e.target.value)}
                  placeholder="e.g., blue, beige"
                  className="input-field"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={handleAISuggestions} className="btn-primary">
                Get AI Suggestions
              </button>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {categories.find(cat => cat.value === selectedCategory)?.label} 
              ({filteredItems.length})
            </h3>
            <p className="text-gray-600 text-sm">
              Click on items to add them to your outfit
            </p>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No {selectedCategory}s in your wardrobe
              </h3>
              <p className="text-gray-500">
                Add some items to this category to start creating outfits
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item._id}
                  onClick={() => {
                    if (selectedItems.some(selected => selected._id === item._id)) {
                      removeFromSelection(item._id);
                    } else {
                      addToSelection(item);
                    }
                  }}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedItems.some(selected => selected._id === item._id)
                      ? 'ring-2 ring-primary-500 scale-105'
                      : 'hover:scale-105'
                  }`}
                >
                <div className="relative">
                  <img
                    src={squareThumb(item.imageUrl, 256)}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {selectedItems.some(selected => selected._id === item._id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 truncate">{item.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* AI Suggestions Modal */}
      {showAISuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">AI Outfit Suggestions</h2>
              <button
                onClick={() => setShowAISuggestions(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {aiSuggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No AI suggestions available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {suggestion.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            Confidence: {Math.round((suggestion.aiConfidence || 0) * 100)}%
                          </span>
                          <button
                            onClick={() => {
                              clearSelection();
                              suggestion.items.forEach((itemId: string) => {
                                const item = userItems.find(i => i._id === itemId);
                                if (item) addToSelection(item);
                              });
                              setShowAISuggestions(false);
                            }}
                            className="btn-primary text-sm"
                          >
                            Try This Outfit
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {suggestion.items.map((itemId: string) => {
                          const item = userItems.find(i => i._id === itemId);
                          return item ? (
                            <div key={itemId} className="text-center">
                              <img
                                src={squareThumb(item.imageUrl, 192)}
                                alt={item.name}
                                className="w-full h-24 object-cover rounded-lg mb-2"
                              />
                              <p className="text-sm text-gray-600 truncate">{item.name}</p>
                            </div>
                          ) : null;
                        })}
                      </div>
                      
                      {suggestion.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{suggestion.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DressUp;
