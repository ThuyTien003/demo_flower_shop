import Review from '../../models/product/review.model.js';
import Product from '../../models/product/product.model.js';
import { optionalAuth, verifyToken } from '../../middleware/auth.middleware.js';

const reviewController = {
  // GET /products/:product_id/reviews
  async listByProduct(req, res) {
    try {
      const { product_id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // ensure product exists
      const product = await Product.findById(Number(product_id));
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const result = await Review.findByProduct(product_id, { page, limit });
      res.json({ success: true, data: result.reviews, stats: result.stats, pagination: result.pagination });
    } catch (error) {
      console.error('List reviews error:', error);
      res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
    }
  },

  // GET /products/:product_id/my-review (auth)
  async myReview(req, res) {
    try {
      const { product_id } = req.params;
      const productIdNum = Number(product_id);
      if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product_id' });
      }
      const review = await Review.findByUserAndProduct(req.user.id, productIdNum);
      if (!review) {
        return res.json({ success: true, data: null });
      }
      return res.json({ success: true, data: review });
    } catch (error) {
      console.error('Get my review error:', error);
      res.status(500).json({ success: false, message: 'Error fetching review', error: error.message });
    }
  },

  // POST /products/:product_id/reviews (auth)
  async create(req, res) {
    try {
      const { product_id } = req.params;
      const { rating, comment } = req.body;

      if (!rating || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
      }

      const product = await Product.findById(Number(product_id));
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const userId = req.user.id;
      const existing = await Review.findByUserAndProduct(userId, Number(product_id));
      // If exists, update it (upsert behavior)
      if (existing) {
        const updated = await Review.update(existing.review_id, { rating: Number(rating), comment });
        return res.json({ success: true, message: 'Review updated', data: updated });
      }

      const review = await Review.create({ product_id: Number(product_id), user_id: userId, rating: Number(rating), comment });
      res.status(201).json({ success: true, message: 'Review created', data: review });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ success: false, message: 'Error creating review', error: error.message });
    }
  },

  // PUT /reviews/:review_id (auth - owner or admin)
  async update(req, res) {
    try {
      const { review_id } = req.params;
      const { rating, comment } = req.body;

      // Validate review_id
      const reviewIdNum = Number(review_id);
      if (!Number.isInteger(reviewIdNum) || reviewIdNum <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid review_id' });
      }

      const review = await Review.findById(reviewIdNum);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      // Only owner or admin
      const isOwnerOrAdmin = (req.user?.role === 'admin') || (Number(review.user_id) === Number(req.user?.id));
      if (!isOwnerOrAdmin) {
        return res.status(403).json({ success: false, message: 'Not allowed' });
      }

      // Prepare update payload with validation
      let nextRating = review.rating;
      if (rating !== undefined) {
        const r = Number(rating);
        if (!Number.isFinite(r) || r < 1 || r > 5) {
          return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
        }
        nextRating = r;
      }
      const nextComment = comment !== undefined ? (comment || null) : (review.comment || null);

      const updated = await Review.update(reviewIdNum, { rating: nextRating, comment: nextComment });
      res.json({ success: true, message: 'Review updated', data: updated });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({ success: false, message: 'Error updating review', error: error.message });
    }
  },

  // DELETE /reviews/:review_id (auth - owner or admin)
  async remove(req, res) {
    try {
      const { review_id } = req.params;
      const review = await Review.findById(Number(review_id));
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      if (!(req.user.role === 'admin' || review.user_id === req.user.id)) {
        return res.status(403).json({ success: false, message: 'Not allowed' });
      }

      await Review.delete(Number(review_id));
      res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
    }
  }
};

export default reviewController;
