import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import { 
  Plus, 
  Upload, 
  Grid, 
  List, 
  Search,
  Shirt,
  Footprints,
  Watch,
} from 'lucide-react';
import ClothingItemCard from '../components/ClothingItemCard';
import UploadModal from '../components/UploadModal';

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

const Wardrobe: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInWash, setShowInWash] = useState(false);

  const categories = [
    { value: 'all', label: 'All Items', icon: Shirt },
    { value: 'top', label: 'Tops', icon: Shirt },
    { value: 'bottom', label: 'Bottoms', icon: Shirt },
    { value: 'shoes', label: 'Shoes', icon: Footprints },
    { value: 'accessories', label: 'Accessories', icon: Watch },
    { value: 'outerwear', label: 'Outerwear', icon: Shirt },
  ];

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (showInWash) {
        filters.isInWash = true;
      }
      const response = await itemsAPI.getUserItems(user!.id, filters);
      setItems(response.items);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [itemsAPI, user, selectedCategory, showInWash]);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, showInWash, fetchItems]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchItems();
  };

  const handleItemUpdate = async (itemId: string, updates: any) => {
    try {
      await itemsAPI.updateItem(itemId, updates);
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleItemDelete = async (itemId: string) => {
    try {
      await itemsAPI.deleteItem(itemId);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    items.forEach(item => {
      stats[item.category] = (stats[item.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wardrobe</h1>
            <p className="text-gray-600">
              {items.length} items in your wardrobe
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {categories.slice(1).map(category => (
            <div key={category.value} className="card text-center">
              <category.icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">
                {categoryStats[category.value] || 0}
              </div>
              <div className="text-sm text-gray-600">{category.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  selectedCategory === category.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* View Mode and Filters */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInWash}
                onChange={(e) => setShowInWash(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">Show in wash</span>
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

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {items.length === 0 ? 'No items in your wardrobe yet' : 'No items match your filters'}
          </h3>
          <p className="text-gray-500 mb-6">
            {items.length === 0 
              ? 'Start by uploading your first clothing item'
              : 'Try adjusting your search or filters'
            }
          </p>
          {items.length === 0 && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload First Item
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredItems.map(item => (
            <ClothingItemCard
              key={item._id}
              item={item}
              viewMode={viewMode}
              onUpdate={handleItemUpdate}
              onDelete={handleItemDelete}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default Wardrobe;
