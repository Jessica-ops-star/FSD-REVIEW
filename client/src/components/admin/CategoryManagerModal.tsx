import React, { useState } from 'react';
import { Category } from '../../types';
import { menuAPI } from '../../services/api';
import { X, Plus, Edit2, Trash2, Check, FolderKanban } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onRefresh: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onRefresh,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setDisplayOrder('0');
    setError('');
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category._id || category.id || '');
    setName(category.name);
    setDescription(category.description || '');
    setDisplayOrder(category.displayOrder?.toString() || '0');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await menuAPI.updateCategory(editingId, {
          name: name.trim(),
          description: description.trim(),
          displayOrder: parseInt(displayOrder) || 0,
        });
      } else {
        await menuAPI.createCategory({
          name: name.trim(),
          description: description.trim(),
          displayOrder: parseInt(displayOrder) || 0,
        });
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await menuAPI.deleteCategory(id);
      if (editingId === id) resetForm();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold">Category Management</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Create or Edit Category Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h4>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Starters, Desserts, Italian"
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of this cuisine or course..."
                className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'Update Category' : 'Save Category'}</span>
              </button>
            </div>
          </form>

          {/* Current Categories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Existing Categories ({categories.length})
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {categories.map((c) => {
                const cId = c._id || c.id || '';
                return (
                  <div
                    key={cId}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                          Order: {c.displayOrder ?? 0}
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleStartEdit(c)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cId, c.name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
