import ProductHistory from '../../models/product/productHistory.model.js';

const productHistoryController = {
  // GET /admin/product-history
  async list(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await ProductHistory.listAll({ page, limit });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      console.error('List product history error:', error);
      res.status(500).json({ success: false, message: 'Error fetching product history', error: error.message });
    }
  },

  // GET /admin/product-history/:product_id
  async listByProduct(req, res) {
    try {
      const { product_id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const result = await ProductHistory.listByProduct(product_id, { page, limit });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      console.error('List product history by product error:', error);
      res.status(500).json({ success: false, message: 'Error fetching product history', error: error.message });
    }
  }
};

export default productHistoryController;
