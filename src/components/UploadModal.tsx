import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'top',
    subcategory: 't-shirt',
    color: 'black',
    colorHex: '#000000',
    brand: '',
    size: '',
    tags: '',
    style: 'casual',
    season: 'all-season',
    occasion: 'casual',
    price: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const categories = {
    top: ['t-shirt', 'shirt', 'blouse', 'tank-top', 'sweater', 'hoodie', 'polo'],
    bottom: ['jeans', 'pants', 'shorts', 'skirt', 'dress', 'leggings'],
    shoes: ['sneakers', 'boots', 'sandals', 'heels', 'flats', 'loafers'],
    accessories: ['hat', 'scarf', 'belt', 'bag', 'watch', 'jewelry'],
    outerwear: ['jacket', 'coat', 'blazer', 'cardigan'],
    underwear: ['bra', 'underwear', 'socks']
  };

  const colors = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 
    'pink', 'orange', 'brown', 'gray', 'navy', 'beige', 'maroon', 'teal'
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setUploadError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadError('Please select an image file');
      return;
    }

    if (!formData.name.trim()) {
      setUploadError('Please enter a name for the item');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      const data = new FormData();
      data.append('image', selectedFile);
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('subcategory', formData.subcategory);
      data.append('color', formData.color);
      if (formData.colorHex) data.append('colorHex', formData.colorHex);
      data.append('brand', formData.brand);
      data.append('size', formData.size);
      data.append('tags', formData.tags);
      data.append('style', formData.style);
      data.append('season', formData.season);
      data.append('occasion', formData.occasion);
      if (formData.price) data.append('price', formData.price);
      if (formData.notes) data.append('notes', formData.notes);

      await itemsAPI.upload(data);
      onSuccess();
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({ 
        ...prev, 
        category: value, 
        subcategory: categories[value as keyof typeof categories]?.[0] || ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add Clothing Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Photo *
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="space-y-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm text-gray-600">Click or drag to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag & drop an image here, or click to select'
                    }
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-field"
                placeholder="e.g., Blue Denim Jacket"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="input-field"
                placeholder="e.g., Levi's"
              />
            </div>
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="input-field"
                required
              >
                {Object.keys(categories).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory *
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="input-field"
                required
              >
                {categories[formData.category as keyof typeof categories]?.map(subcategory => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color and Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color *
              </label>
              <select
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="input-field"
                required
              >
                {colors.map(color => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Hex</span>
                  <input
                    type="color"
                    value={formData.colorHex}
                    onChange={(e) => handleInputChange('colorHex', e.target.value)}
                    className="h-8 w-12 p-0 border rounded"
                    aria-label="Pick color hex"
                  />
                  <input
                    type="text"
                    value={formData.colorHex}
                    onChange={(e) => handleInputChange('colorHex', e.target.value)}
                    className="input-field ml-2 w-32"
                    placeholder="#000000"
                  />
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={async () => {
                    const EyeDropperAny: any = (window as any).EyeDropper;
                    if (EyeDropperAny) {
                      try {
                        const eyeDropper = new EyeDropperAny();
                        const result = await eyeDropper.open();
                        if (result?.sRGBHex) {
                          handleInputChange('colorHex', result.sRGBHex);
                        }
                      } catch (err) {
                        console.error('Eyedropper error:', err);
                      }
                    } else {
                      alert('Eyedropper API is not supported in this browser.');
                    }
                  }}
                >
                  Use Eyedropper
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="input-field"
                placeholder="e.g., M, 10, 32x34"
              />
            </div>
          </div>

          {/* Style and Occasion */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Style
              </label>
              <select
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
                className="input-field"
              >
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="sporty">Sporty</option>
                <option value="vintage">Vintage</option>
                <option value="modern">Modern</option>
                <option value="bohemian">Bohemian</option>
                <option value="streetwear">Streetwear</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Season
              </label>
              <select
                value={formData.season}
                onChange={(e) => handleInputChange('season', e.target.value)}
                className="input-field"
              >
                <option value="summer">Summer</option>
                <option value="winter">Winter</option>
                <option value="spring">Spring</option>
                <option value="fall">Fall</option>
                <option value="all-season">All Season</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occasion
              </label>
              <select
                value={formData.occasion}
                onChange={(e) => handleInputChange('occasion', e.target.value)}
                className="input-field"
              >
                <option value="work">Work</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="sport">Sport</option>
                <option value="party">Party</option>
                <option value="date">Date</option>
                <option value="travel">Travel</option>
                <option value="home">Home</option>
              </select>
            </div>
          </div>

          {/* Tags and Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="input-field"
              placeholder="e.g., favorite, comfortable, new"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Any additional notes about this item..."
            />
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
