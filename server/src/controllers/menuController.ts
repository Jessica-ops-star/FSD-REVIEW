import { Request, Response } from 'express';
import Category from '../models/Category';
import MenuItem from '../models/MenuItem';
import { notifyMenuUpdated } from '../socket/socketManager';

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching categories' });
  }
};

// @desc    Create a category
// @route   POST /api/menu/categories
// @access  Private (ADMIN)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, displayOrder } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }

    const category = await Category.create({
      name,
      description: description || '',
      displayOrder: displayOrder || 0,
    });

    notifyMenuUpdated(category);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating category' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id or PUT /api/menu/categories/:id
// @access  Private (ADMIN)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, displayOrder } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;

    await category.save();
    notifyMenuUpdated(category);
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating category' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id or DELETE /api/menu/categories/:id
// @access  Private (ADMIN)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    notifyMenuUpdated({ deletedCategoryId: req.params.id });
    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting category' });
  }
};

// @desc    Get all menu items (filterable by category, search query, availability, sorting)
// @route   GET /api/menu/items
// @access  Public
export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, search, availableOnly, sortBy, sortOrder } = req.query;

    const filter: any = {};

    if (categoryId && categoryId !== 'all') {
      filter.category = categoryId;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchStr = search.trim();
      // Also match categories that match the search keyword (e.g. "dessert" -> finds items in Desserts)
      const matchingCategories = await Category.find({
        name: { $regex: searchStr, $options: 'i' },
      }).select('_id');
      const catIds = matchingCategories.map((c) => c._id);

      filter.$or = [
        { name: { $regex: searchStr, $options: 'i' } },
        { description: { $regex: searchStr, $options: 'i' } },
        ...(catIds.length > 0 ? [{ category: { $in: catIds } }] : []),
      ];
    }

    if (availableOnly === 'true') {
      filter.isAvailable = true;
    }

    // Dynamic sort
    const sortOptions: any = {};
    if (sortBy === 'price') {
      sortOptions.price = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sortOptions.name = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1;
    }

    const items = await MenuItem.find(filter).populate('category', 'name').sort(sortOptions);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching menu items' });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/items/:id
// @access  Public
export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name');
    if (!item) {
      res.status(404).json({ message: 'Menu item not found' });
      return;
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching menu item' });
  }
};

// @desc    Create menu item
// @route   POST /api/menu/items
// @access  Private (ADMIN)
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, imageUrl, isAvailable, isVeg, preparationTimeMinutes } = req.body;

    if (!name || !description || price === undefined || !category || !imageUrl) {
      res.status(400).json({ message: 'Please provide all required fields (name, description, price, category, imageUrl)' });
      return;
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(400).json({ message: 'Invalid category specified' });
      return;
    }

    const item = await MenuItem.create({
      name,
      description,
      price: Number(price),
      category,
      imageUrl,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      preparationTimeMinutes: preparationTimeMinutes ? Number(preparationTimeMinutes) : 15,
    });

    const populatedItem = await item.populate('category', 'name');
    notifyMenuUpdated(populatedItem);
    res.status(201).json(populatedItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating menu item' });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private (ADMIN)
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, imageUrl, isAvailable, isVeg, preparationTimeMinutes } = req.body;

    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Menu item not found' });
      return;
    }

    if (name) item.name = name;
    if (description) item.description = description;
    if (price !== undefined) item.price = Number(price);
    if (category) item.category = category;
    if (imageUrl) item.imageUrl = imageUrl;
    if (isAvailable !== undefined) item.isAvailable = Boolean(isAvailable);
    if (isVeg !== undefined) item.isVeg = Boolean(isVeg);
    if (preparationTimeMinutes !== undefined) item.preparationTimeMinutes = Number(preparationTimeMinutes);

    await item.save();
    const updated = await item.populate('category', 'name');
    notifyMenuUpdated(updated);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating menu item' });
  }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/items/:id/availability
// @access  Private (ADMIN, KITCHEN)
export const toggleAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Menu item not found' });
      return;
    }

    item.isAvailable = req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : !item.isAvailable;
    await item.save();

    notifyMenuUpdated({ id: item._id, isAvailable: item.isAvailable });
    res.json({ message: 'Item availability updated', id: item._id, isAvailable: item.isAvailable });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error toggling availability' });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private (ADMIN)
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Menu item not found' });
      return;
    }

    notifyMenuUpdated({ deletedItemId: req.params.id });
    res.json({ message: 'Menu item deleted successfully', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting menu item' });
  }
};
