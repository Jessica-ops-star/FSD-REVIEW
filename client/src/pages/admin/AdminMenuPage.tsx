import React, { useState, useEffect } from 'react';
import { MenuItem, Category } from '../../types';
import { menuAPI } from '../../services/api';
import { Sidebar } from '../../components/common/Sidebar';
import { MenuModal } from '../../components/admin/MenuModal';
import { CategoryManagerModal } from '../../components/admin/CategoryManagerModal';
import { Plus, Edit2, Trash2, Search, Filter, FolderKanban } from 'lucide-react';

export const AdminMenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        menuAPI.getCategories(),
        menuAPI.getMenuItems({
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
        }),
      ]);

      if (Array.isArray(catRes)) setCategories(catRes);
      if (Array.isArray(itemRes)) setItems(itemRes);
    } catch (err) {
      console.error('Failed to load menu management:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchQuery]);

  const handleToggleAvailability = async (id: string) => {
    try {
      await menuAPI.toggleAvailability(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update availability');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete dish '${name}'?`)) return;
    try {
      await menuAPI.delete(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete menu item');
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Restaurant Menu Management</h1>
            <p className="text-xs text-slate-500 mt-1">
              Add, edit, update price, change category, and toggle live dish availability.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <FolderKanban className="w-4 h-4 text-orange-500" />
              <span>Category Management</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food Dish</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="text-xs bg-transparent border-none focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 cursor-pointer"
            >
              <option value="all">All Categories</option>
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
        </div>

        {/* Menu Items Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading menu items...</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No dishes match your filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Image</th>
                    <th className="pb-3 px-2">Item Name</th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Price</th>
                    <th className="pb-3 px-2">Live Availability</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const itemId = item._id || item.id || '';
                    const categoryName = typeof item.category === 'object' && item.category !== null ? item.category.name : 'Dish';
                    const img = item.imageUrl || (item as any).image;

                    return (
                      <tr key={itemId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2">
                          <img
                            src={img}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-xl"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-500 max-w-xs truncate block">
                            {item.description}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-medium text-slate-700">
                          {categoryName}
                        </td>
                        <td className="py-3 px-2 font-extrabold text-slate-900">₹{item.price}</td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => handleToggleAvailability(itemId)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                              item.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                            }`}
                          >
                            {item.isAvailable ? '✓ Available' : '✕ Unavailable'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(itemId, item.name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Menu Modal */}
      {isModalOpen && (
        <MenuModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
          item={editingItem}
          categories={categories}
        />
      )}

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <CategoryManagerModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};
