import React, { useState, useEffect } from 'react';
import { MenuItem, Category } from '../../types';
import { menuAPI } from '../../services/api';
import { X, Save } from 'lucide-react';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: MenuItem | null;
  categories: Category[];
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item,
  categories,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price.toString());
      const cId = typeof item.category === 'object' && item.category !== null ? (item.category._id || item.category.id || '') : (item.category as string || '');
      setCategoryId(cId);
      setImageUrl(item.imageUrl || (item as any).image || '');
      setIsAvailable(item.isAvailable);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      const firstCatId = categories[0] ? (categories[0]._id || categories[0].id || '') : '';
      setCategoryId(firstCatId);
      setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
      setIsAvailable(true);
    }
  }, [item, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !categoryId) {
      alert('Please fill all required fields.');
      return;
    }

    setSaving(true);
    try {
      const itemId = item ? (item._id || item.id) : undefined;
      const payload = {
        name,
        description,
        price: parseFloat(price),
        category: categoryId,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        isAvailable,
      };

      if (itemId) {
        await menuAPI.update(itemId, payload);
      } else {
        await menuAPI.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 className="text-base font-bold">
            {item ? 'Edit Menu Dish' : 'Add New Food Item'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Dish Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paneer Butter Masala"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white cursor-pointer"
              >
                {categories.map((c) => {
                  const cId = c._id || c.id || '';
                  return (
                    <option key={cId} value={cId}>
                      {c.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="280"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed ingredient & taste profile..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
              <span>Food Image URL</span>
              <span className="text-[10px] text-slate-400 font-normal">Unsplash link or image URL</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <img src={imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
              <span className="text-[11px] text-slate-500 font-medium">Image Live Preview</span>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="availableCheck"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
            />
            <label htmlFor="availableCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
              Is Currently Available for Ordering
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
