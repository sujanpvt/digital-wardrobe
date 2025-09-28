import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { laundryAPI, itemsAPI } from '../services/api';
import { 
  Droplets, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Calendar,
  Filter,
  Trash2,
  X
} from 'lucide-react';

interface LaundryEntry {
  _id: string;
  items: any[];
  washDate: string;
  expectedReturnDate: string;
  status: 'washing' | 'drying' | 'ready' | 'delayed';
  washType: 'normal' | 'delicate' | 'hand-wash' | 'dry-clean';
  notes?: string;
  createdAt: string;
}

const Laundry: React.FC = () => {
  const { user } = useAuth();
  const [laundryEntries, setLaundryEntries] = useState<LaundryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  const statuses = [
    { value: 'all', label: 'All', icon: Filter },
    { value: 'washing', label: 'Washing', icon: Droplets },
    { value: 'drying', label: 'Drying', icon: Clock },
    { value: 'ready', label: 'Ready', icon: CheckCircle },
    { value: 'delayed', label: 'Delayed', icon: AlertTriangle },
  ];

  const fetchLaundryEntries = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      
      const response = await laundryAPI.getUserLaundry(user!.id, filters);
      setLaundryEntries(response.laundryEntries);
    } catch (error) {
      console.error('Error fetching laundry entries:', error);
    } finally {
      setLoading(false);
    }
  }, [laundryAPI, user, selectedStatus]);
  const fetchAvailableItems = useCallback(async () => {
    try {
      const response = await itemsAPI.getUserItems(user!.id, { isInWash: false });
      setAvailableItems(response.items);
    } catch (error) {
      console.error('Error fetching available items:', error);
    }
  }, [itemsAPI, user]);

  useEffect(() => {
    if (user) {
      fetchLaundryEntries();
      fetchAvailableItems();
    }
  }, [user, selectedStatus, fetchLaundryEntries, fetchAvailableItems]);

  const handleStatusUpdate = async (entryId: string, newStatus: string) => {
    try {
      await laundryAPI.updateStatus(entryId, newStatus);
      fetchLaundryEntries();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this laundry entry?')) {
      try {
        await laundryAPI.deleteEntry(entryId);
        fetchLaundryEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  // Removed duplicated getStatusColor/getStatusIcon at top-level; defined within LaundryEntryCard

  const isOverdue = (expectedDate: string) => {
    return new Date() > new Date(expectedDate);
  };

  const getDaysUntilReturn = (expectedDate: string) => {
    const now = new Date();
    const returnDate = new Date(expectedDate);
    const diffTime = returnDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Laundry Tracker</h1>
            <p className="text-gray-600">
              Keep track of your items in wash
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>Add to Laundry</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-800">{laundryEntries.length}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-800">
              {laundryEntries.reduce((sum, entry) => sum + entry.items.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Items in Wash</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-800">
              {laundryEntries.filter(entry => entry.status === 'ready').length}
            </div>
            <div className="text-sm text-gray-600">Ready to Collect</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">
              {laundryEntries.filter(entry => isOverdue(entry.expectedReturnDate)).length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          {statuses.map(status => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                selectedStatus === status.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <status.icon className="w-4 h-4" />
              <span>{status.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Laundry Entries */}
      {laundryEntries.length === 0 ? (
        <div className="text-center py-12">
          <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No laundry entries
          </h3>
          <p className="text-gray-500 mb-6">
            Start by adding items to your laundry tracker
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {laundryEntries.map(entry => (
            <LaundryEntryCard
              key={entry._id}
              entry={entry}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteEntry}
              isOverdue={isOverdue(entry.expectedReturnDate)}
              daysUntilReturn={getDaysUntilReturn(entry.expectedReturnDate)}
            />
          ))}
        </div>
      )}

      {/* Add to Laundry Modal */}
      {showAddModal && (
        <AddToLaundryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchLaundryEntries();
            fetchAvailableItems();
          }}
          availableItems={availableItems}
        />
      )}
    </div>
  );
};

interface LaundryEntryCardProps {
  entry: LaundryEntry;
  onStatusUpdate: (entryId: string, status: string) => void;
  onDelete: (entryId: string) => void;
  isOverdue: boolean;
  daysUntilReturn: number;
}

const LaundryEntryCard: React.FC<LaundryEntryCardProps> = ({
  entry,
  onStatusUpdate,
  onDelete,
  isOverdue,
  daysUntilReturn
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      washing: 'bg-blue-100 text-blue-800',
      drying: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: any } = {
      washing: Droplets,
      drying: Clock,
      ready: CheckCircle,
      delayed: AlertTriangle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className={`card ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full flex items-center space-x-2 ${getStatusColor(entry.status)}`}>
            {getStatusIcon(entry.status)}
            <span className="text-sm font-medium capitalize">{entry.status}</span>
          </div>
          {isOverdue && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
          )}
        </div>

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
                  onStatusUpdate(entry._id, 'washing');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
              >
                <Droplets className="w-4 h-4" />
                <span>Mark as Washing</span>
              </button>
              <button
                onClick={() => {
                  onStatusUpdate(entry._id, 'drying');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
              >
                <Clock className="w-4 h-4" />
                <span>Mark as Drying</span>
              </button>
              <button
                onClick={() => {
                  onStatusUpdate(entry._id, 'ready');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Ready</span>
              </button>
              <button
                onClick={() => {
                  onDelete(entry._id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Entry</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-4">
        {entry.items.map((item, index) => (
          <div key={index} className="text-center">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-16 object-cover rounded-lg mb-1"
            />
            <p className="text-xs text-gray-600 truncate">{item.name}</p>
          </div>
        ))}
      </div>

      {/* Entry Details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Wash: {new Date(entry.washDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Expected: {new Date(entry.expectedReturnDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="capitalize">{entry.washType}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {daysUntilReturn > 0 && (
            <span className="text-sm text-gray-600">
              {daysUntilReturn} day{daysUntilReturn !== 1 ? 's' : ''} remaining
            </span>
          )}
          {daysUntilReturn <= 0 && !isOverdue && (
            <span className="text-sm text-green-600">Ready for pickup</span>
          )}
        </div>
      </div>

      {entry.notes && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{entry.notes}</p>
        </div>
      )}
    </div>
  );
};

interface AddToLaundryModalProps {
  onClose: () => void;
  onSuccess: () => void;
  availableItems: any[];
}

const AddToLaundryModal: React.FC<AddToLaundryModalProps> = ({
  onClose,
  onSuccess,
  availableItems
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    expectedReturnDate: '',
    washType: 'normal',
    notes: ''
  });

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    if (!formData.expectedReturnDate) {
      alert('Please select an expected return date');
      return;
    }

    try {
      await laundryAPI.addItems({
        items: selectedItems,
        expectedReturnDate: formData.expectedReturnDate,
        washType: formData.washType,
        notes: formData.notes
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding to laundry:', error);
      alert('Failed to add items to laundry');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add Items to Laundry</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Items ({selectedItems.length} selected)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {availableItems.map(item => (
                <div
                  key={item._id}
                  onClick={() => handleItemToggle(item._id)}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedItems.includes(item._id)
                      ? 'ring-2 ring-primary-500 scale-105'
                      : 'hover:scale-105'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-16 object-cover rounded-lg mb-1"
                  />
                  <p className="text-xs text-gray-600 truncate">{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Return Date *
              </label>
              <input
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wash Type
              </label>
              <select
                value={formData.washType}
                onChange={(e) => setFormData({ ...formData, washType: e.target.value })}
                className="input-field"
              >
                <option value="normal">Normal</option>
                <option value="delicate">Delicate</option>
                <option value="hand-wash">Hand Wash</option>
                <option value="dry-clean">Dry Clean</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Any special instructions or notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={selectedItems.length === 0}
            >
              Add to Laundry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Laundry;
