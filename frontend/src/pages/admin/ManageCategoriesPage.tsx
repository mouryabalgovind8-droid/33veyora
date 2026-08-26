import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Tag,
  Home,
  Mountain,
  Palette,
  Calendar,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  listingCount: number;
  isActive: boolean;
  order: number;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Stays', slug: 'stays', icon: 'home', description: 'Homestays, villas, apartments', listingCount: 1245, isActive: true, order: 1 },
  { id: '2', name: 'Adventures', slug: 'adventures', icon: 'mountain', description: 'Trekking, camping, outdoor activities', listingCount: 892, isActive: true, order: 2 },
  { id: '3', name: 'Workshops', slug: 'workshops', icon: 'palette', description: 'Cooking, art, craft classes', listingCount: 456, isActive: true, order: 3 },
  { id: '4', name: 'Events', slug: 'events', icon: 'calendar', description: 'Local events, festivals, experiences', listingCount: 234, isActive: true, order: 4 },
];

const iconMap: Record<string, any> = {
  home: Home,
  mountain: Mountain,
  palette: Palette,
  calendar: Calendar,
};

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'home' });
  
  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description, icon: category.icon });
  };
  
  const handleSave = (id: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, name: formData.name, description: formData.description, icon: formData.icon } : cat
    ));
    setEditingId(null);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };
  
  const handleToggleActive = (id: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };
  
  const handleMoveUp = (id: string) => {
    const index = categories.findIndex(cat => cat.id === id);
    if (index > 0) {
      const newCategories = [...categories];
      [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
      setCategories(newCategories.map((cat, i) => ({ ...cat, order: i + 1 })));
    }
  };
  
  const handleMoveDown = (id: string) => {
    const index = categories.findIndex(cat => cat.id === id);
    if (index < categories.length - 1) {
      const newCategories = [...categories];
      [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
      setCategories(newCategories.map((cat, i) => ({ ...cat, order: i + 1 })));
    }
  };
  
  const handleAdd = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      icon: formData.icon,
      description: formData.description,
      listingCount: 0,
      isActive: true,
      order: categories.length + 1,
    };
    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    setFormData({ name: '', description: '', icon: 'home' });
  };
  
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">Manage listing categories and their properties</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>
      
      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Order</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Category</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Description</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Listings</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Status</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || Tag;
              const isEditing = editingId === category.id;
              
              return (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(category.id)}
                        className="p-1 hover:bg-slate-100 rounded"
                        disabled={category.order === 1}
                      >
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      </button>
                      <span className="w-6 text-center text-sm text-slate-500">{category.order}</span>
                      <button
                        onClick={() => handleMoveDown(category.id)}
                        className="p-1 hover:bg-slate-100 rounded"
                        disabled={category.order === categories.length}
                      >
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-slate-600" />
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                        />
                      ) : (
                        <span className="font-medium text-slate-900">{category.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 w-full"
                      />
                    ) : (
                      <span className="text-slate-500">{category.description}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-900 font-medium">{category.listingCount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(category.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        category.isActive 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(category.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Add Category</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="e.g., Wellness Retreats"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="e.g., Yoga, meditation, spa experiences"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                <div className="grid grid-cols-4 gap-2">
                  {['home', 'mountain', 'palette', 'calendar'].map((icon) => {
                    const IconComponent = iconMap[icon];
                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-3 rounded-xl border-2 transition-colors ${
                          formData.icon === icon
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <IconComponent className="h-5 w-5 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!formData.name}
                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
