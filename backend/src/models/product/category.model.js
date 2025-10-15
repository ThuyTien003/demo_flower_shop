import pool from '../../config/db.config.js';

const Category = {
  // Get all categories with optional parent-child hierarchy
  async findAll(includeInactive = false) {
    let query = 'SELECT * FROM categories';
    const params = [];
    
    if (!includeInactive) {
      // In a real app, you might have an is_active field
      // query += ' WHERE is_active = 1';
    }
    
    query += ' ORDER BY name ASC';
    
    const [categories] = await pool.execute(query, params);
    
    // Build category tree
    return this.buildCategoryTree(categories);
  },
  
  // Build category tree from flat list
  buildCategoryTree(categories, parentId = null) {
    const result = [];
    
    // Get all categories with the current parentId
    const filteredCategories = categories.filter(
      category => (category.parent_id === parentId) || 
                 (category.parent_id === null && parentId === null)
    );
    
    // Recursively build the tree
    for (const category of filteredCategories) {
      const children = this.buildCategoryTree(categories, category.category_id);
      if (children.length > 0) {
        category.children = children;
      }
      result.push(category);
    }
    
    return result;
  },
  
  // Find category by ID
  async findById(id) {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE category_id = ?',
      [id]
    );
    
    if (categories.length === 0) {
      return null;
    }
    
    const category = categories[0];
    
    // Get parent category if exists
    if (category.parent_id) {
      const [parents] = await pool.execute(
        'SELECT * FROM categories WHERE category_id = ?',
        [category.parent_id]
      );
      category.parent = parents[0] || null;
    }
    
    // Get child categories
    const [children] = await pool.execute(
      'SELECT * FROM categories WHERE parent_id = ?',
      [id]
    );
    
    if (children.length > 0) {
      category.children = children;
    }
    
    return category;
  },
  
  // Find category by slug
  async findBySlug(slug) {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE slug = ?',
      [slug]
    );
    
    if (categories.length === 0) {
      return null;
    }
    
    return categories[0];
  },
  
  // Create a new category
  async create(categoryData) {
    const { name, slug, parent_id, description } = categoryData;
    
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, parent_id, description) VALUES (?, ?, ?, ?)',
      [name, slug, parent_id || null, description || null]
    );
    
    return this.findById(result.insertId);
  },
  
  // Update a category
  async update(id, categoryData) {
    const { name, slug, parent_id, description } = categoryData;
    
    await pool.execute(
      'UPDATE categories SET name = ?, slug = ?, parent_id = ?, description = ? WHERE category_id = ?',
      [name, slug, parent_id || null, description || null, id]
    );
    
    return this.findById(id);
  },
  
  // Delete a category
  async delete(id) {
    // Check if category has products
    const [products] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );
    
    if (products[0].count > 0) {
      throw new Error('Cannot delete category with associated products');
    }
    
    // Check if category has subcategories
    const [subcategories] = await pool.execute(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
      [id]
    );
    
    if (subcategories[0].count > 0) {
      throw new Error('Cannot delete category with subcategories');
    }
    
    await pool.execute('DELETE FROM categories WHERE category_id = ?', [id]);
    return { message: 'Category deleted successfully' };
  },
  
  // Get all parent categories
  async getParentCategories() {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name ASC'
    );
    
    return categories;
  },
  
  // Get all child categories of a parent category
  async getChildCategories(parentId) {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE parent_id = ? ORDER BY name ASC',
      [parentId]
    );
    
    return categories;
  },
  
  // Get category breadcrumbs
  async getBreadcrumbs(categoryId) {
    const breadcrumbs = [];
    let currentId = categoryId;
    
    while (currentId) {
      const [categories] = await pool.execute(
        'SELECT category_id, name, slug, parent_id FROM categories WHERE category_id = ?',
        [currentId]
      );
      
      if (categories.length === 0) break;
      
      const category = categories[0];
      breadcrumbs.unshift({
        id: category.category_id,
        name: category.name,
        slug: category.slug
      });
      
      currentId = category.parent_id;
    }
    
    return breadcrumbs;
  },
  
  // Get categories with product counts
  async getCategoriesWithCounts() {
    const [categories] = await pool.execute(`
      SELECT 
        c.*, 
        COUNT(p.product_id) as product_count
      FROM 
        categories c
      LEFT JOIN 
        products p ON c.category_id = p.category_id AND p.is_active = 1
      GROUP BY 
        c.category_id
      ORDER BY 
        c.name ASC
    `);
    
    return categories;
  }
};

export default Category;
