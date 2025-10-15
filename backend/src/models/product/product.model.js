import pool from '../../config/db.config.js';

const Product = {
  // Get all products with optional filtering and pagination
  async findAll({ categoryId, page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' }) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;
    let query = `
      SELECT DISTINCT p.*, c.name as category_name, 
             (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = 1
    `;
    
    const queryParams = [];
    
    if (categoryId) {
      query += ' AND p.category_id = ?';
      queryParams.push(Number(categoryId));
    }
    
    // Add sorting
    const validSortColumns = ['name', 'price', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Inline LIMIT/OFFSET as numeric literals to avoid MySQL placeholder issues
    query += ` ORDER BY p.${sortColumn} ${sortOrder} LIMIT ${limitNum} OFFSET ${offset}`;
    
    const [products] = await pool.execute(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE is_active = 1';
    if (categoryId) {
      countQuery += ' AND category_id = ?';
    }
    
    const [countResult] = await pool.execute(countQuery, categoryId ? [Number(categoryId)] : []);
    
    return {
      products,
      pagination: {
        total: countResult[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  },
  
  // Find product by ID
  async findById(id) {
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.product_id = ? AND p.is_active = 1`,
      [id]
    );
    
    if (products.length === 0) {
      return null;
    }
    
    const product = products[0];
    
    // Get product images
    const [images] = await pool.execute(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
      [id]
    );
    
    // Get related products (products from the same category)
    const [relatedProducts] = await pool.execute(
      `SELECT p.*, 
              (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
       FROM products p
       WHERE p.category_id = ? AND p.product_id != ? AND p.is_active = 1
       LIMIT 4`,
      [product.category_id, id]
    );
    
    return {
      ...product,
      images,
      related_products: relatedProducts
    };
  },
  
  // Create a new product
  async create(productData, images = []) {
    const { name, slug, description, price, category_id, stock_quantity = 0, is_active = 1 } = productData;
    
    if (!slug) {
      throw new Error('Slug is required');
    }
    
    const [result] = await pool.execute(
      'INSERT INTO products (name, slug, description, price, category_id, stock_quantity, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description || null, price, category_id, stock_quantity, is_active]
    );
    
    const productId = result.insertId;
    
    // Add product images
    if (images && images.length > 0) {
      await this.addImages(productId, images);
    }
    
    return this.findById(productId);
  },
  
  // Update a product
  async update(id, productData, images = []) {
    const { name, description, price, category_id, stock_quantity, is_active } = productData;
    
    await pool.execute(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category_id = ?, 
           stock_quantity = ?, is_active = ?
       WHERE product_id = ?`,
      [name, description, price, category_id, stock_quantity, is_active, id]
    );
    
    // Update images if provided
    if (images && images.length > 0) {
      // First, delete existing images
      await pool.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      // Then add new ones
      await this.addImages(id, images);
    }
    
    return this.findById(id);
  },
  
  // Delete a product
  async delete(id) {
    try {
      // Hard delete: rely on ON DELETE CASCADE for product_images
      await pool.execute('DELETE FROM products WHERE product_id = ?', [Number(id)]);
      return { message: 'Product deleted successfully' };
    } catch (err) {
      // Handle FK constraint errors (e.g., referenced in order_items)
      if (err && (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451)) {
        throw new Error('Cannot delete product because it is referenced by other records (e.g., orders).');
      }
      throw err;
    }
  },
  
  // Add images to a product
  async addImages(productId, images) {
    if (!images || images.length === 0) return [];
    
    const values = images.map(img => [
      productId,
      img.image_url,
      img.alt_text || '',
      img.is_primary ? 1 : 0
    ]);
    
    await pool.query(
      'INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES ?',
      [values]
    );
    
    return this.getProductImages(productId);
  },
  
  // Get all images for a product
  async getProductImages(productId) {
    const [images] = await pool.execute(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
      [productId]
    );
    return images;
  },
  
  // Search products by name or description
  async search(query, { page = 1, limit = 10 } = {}) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;
    const searchTerm = `%${query}%`;
    
    const searchSql = `
      SELECT p.*, c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE (p.name LIKE ? OR p.description LIKE ?) AND p.is_active = 1
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    const [products] = await pool.execute(searchSql, [searchTerm, searchTerm]);
    
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM products WHERE (name LIKE ? OR description LIKE ?) AND is_active = 1',
      [searchTerm, searchTerm]
    );
    
    return {
      products,
      pagination: {
        total: countResult[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  }
};

export default Product;
