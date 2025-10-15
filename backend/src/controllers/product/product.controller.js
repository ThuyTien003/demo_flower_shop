import Product from '../../models/product/product.model.js';
import pool from '../../config/db.config.js';
import AdminLog from '../../models/admin/adminLog.model.js';
import ProductHistory from '../../models/product/productHistory.model.js';

const productController = {
  // Get all products with optional filtering and pagination
  async getProducts(req, res) {
    try {
      const { category_id, page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' } = req.query;
      
      const result = await Product.findAll({
        categoryId: category_id,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        order
      });
      
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  },
  
  // Get product by ID
  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message
      });
    }
  },
  
  // Create a new product (admin only)
  async createProduct(req, res) {
    try {
      const { images, ...productData } = req.body;
      
      // Validate required fields
      if (!productData.name || !productData.price || !productData.category_id) {
        return res.status(400).json({
          success: false,
          message: 'Name, price, and category are required fields'
        });
      }
      
      const product = await Product.create(productData, images || []);

      // Async best-effort logging and history
      (async () => {
        try {
          const userId = req.user?.id;
          await AdminLog.create({ user_id: userId, action: 'create', resource: 'product', resource_id: product.product_id, details: productData });
          await ProductHistory.create({ product_id: product.product_id, user_id: userId, action: 'create', before_data: null, after_data: product, note: null });
        } catch (e) {
          console.warn('Admin log/product history create failed:', e.message);
        }
      })();
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  },
  
  // Update a product (admin only)
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { images, ...productData } = req.body;
      
      // Check if product exists
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      const updatedProduct = await Product.update(id, productData, images || []);

      // Async best-effort logging and history
      (async () => {
        try {
          const userId = req.user?.id;
          await AdminLog.create({ user_id: userId, action: 'update', resource: 'product', resource_id: Number(id), details: productData });
          await ProductHistory.create({ product_id: Number(id), user_id: userId, action: 'update', before_data: existingProduct, after_data: updatedProduct, note: null });
        } catch (e) {
          console.warn('Admin log/product history update failed:', e.message);
        }
      })();
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  },
  
  // Delete a product (admin only)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      // Check if product exists
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      await Product.delete(id);

      // Async best-effort logging and history
      (async () => {
        try {
          const userId = req.user?.id;
          await AdminLog.create({ user_id: userId, action: 'delete', resource: 'product', resource_id: Number(id), details: null });
          await ProductHistory.create({ product_id: Number(id), user_id: userId, action: 'delete', before_data: existingProduct, after_data: null, note: null });
        } catch (e) {
          console.warn('Admin log/product history delete failed:', e.message);
        }
      })();
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  },
  
  // Search products
  async searchProducts(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      const result = await Product.search(q, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching products',
        error: error.message
      });
    }
  },
  
  // Get featured products
  async getFeaturedProducts(req, res) {
    try {
      const { limit = 8 } = req.query;
      const limitNum = Math.max(1, parseInt(limit));
      
      const sql = `
        SELECT p.*, c.name as category_name,
               (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT ${limitNum}
      `;
      const [products] = await pool.execute(sql);
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching featured products',
        error: error.message
      });
    }
  },
  
  // Get products by category
  async getProductsByCategory(req, res) {
    try {
      const { category_id } = req.params;
      const { page = 1, limit = 12, sortBy = 'created_at', order = 'DESC' } = req.query;
      
      // Check if category exists
      const [categories] = await pool.execute('SELECT * FROM categories WHERE category_id = ?', [category_id]);
      if (categories.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      const result = await Product.findAll({
        categoryId: category_id,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        order
      });
      
      res.json({
        success: true,
        category: categories[0],
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products by category',
        error: error.message
      });
    }
  },
  
  // Get related products
  async getRelatedProducts(req, res) {
    try {
      const { id } = req.params; // route is '/:id/related'
      const { limit = 4 } = req.query;
      const productIdNum = Number(id);
      const limitNum = Math.max(1, parseInt(limit));
      
      // Get the product to find related items from the same category
      const product = await Product.findById(productIdNum);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      const sql = `
        SELECT p.*, 
               (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
        WHERE p.category_id = ? 
          AND p.product_id != ? 
          AND p.is_active = 1
        LIMIT ${limitNum}
      `;
      const [relatedProducts] = await pool.execute(sql, [product.category_id, productIdNum]);
      
      res.json({
        success: true,
        data: relatedProducts
      });
    } catch (error) {
      console.error('Get related products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching related products',
        error: error.message
      });
    }
  }
};

export default productController;
