import React, { useState } from 'react';
import { squareThumb } from '../services/images';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Droplets, 
  Tag,
  Calendar,
  Star
} from 'lucide-react';

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

interface ClothingItemCardProps {
  item: ClothingItem;
  viewMode: 'grid' | 'list';
  onUpdate: (itemId: string, updates: any) => void;
  onDelete: (itemId: string) => void;
}

const ClothingItemCard: React.FC<ClothingItemCardProps> = ({
  item,
  viewMode,
  onUpdate,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name,
    brand: item.brand || '',
    size: item.size || '',
    tags: item.tags.join(', ')
  });

  const handleWashToggle = async () => {
    await onUpdate(item._id, { isInWash: !item.isInWash });
  };

  const handleSaveEdit = async () => {
    const updates = {
      name: editData.name,
      brand: editData.brand,
      size: editData.size,
      tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    await onUpdate(item._id, updates);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(item._id);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      top: 'bg-blue-100 text-blue-800',
      bottom: 'bg-green-100 text-green-800',
      shoes: 'bg-purple-100 text-purple-800',
      accessories: 'bg-yellow-100 text-yellow-800',
      outerwear: 'bg-red-100 text-red-800',
      underwear: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (viewMode === 'list') {
    return (
      <div className="card flex items-center space-x-4">
        <div className="relative">
          <img
            src={squareThumb(item.imageUrl, 64)}
            alt={item.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          {item.isInWash && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Droplets className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
              {item.category}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{item.color}</span>
            {item.brand && <span>{item.brand}</span>}
            {item.size && <span>Size: {item.size}</span>}
          </div>
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{item.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleWashToggle}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              item.isInWash 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={item.isInWash ? 'Mark as clean' : 'Mark as in wash'}
          >
            <Droplets className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    handleDelete();
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
      <div className="relative">
        <img
          src={squareThumb(item.imageUrl, 256)}
          alt={item.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        {item.isInWash && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Droplets className="w-4 h-4 text-white" />
          </div>
        )}
        
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
            {item.category}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    handleDelete();
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

        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
            <span>{item.color}</span>
          </div>
          {item.brand && <div>{item.brand}</div>}
          {item.size && <div>Size: {item.size}</div>}
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{item.tags.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleWashToggle}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
              item.isInWash 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>{item.isInWash ? 'In Wash' : 'Clean'}</span>
          </button>

          <div className="text-xs text-gray-500">
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={editData.brand}
                  onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={editData.size}
                  onChange={(e) => setEditData({ ...editData, size: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  className="input-field"
                  placeholder="casual, summer, favorite"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClothingItemCard;
