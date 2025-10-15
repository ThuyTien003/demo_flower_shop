import Recommendation from '../../models/product/recommendation.model.js';

// Track product view
export const trackView = async (req, res) => {
  try {
    const { productId, sessionId } = req.body;
    const userId = req.user?.userId || null;

    if (!productId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and session ID are required'
      });
    }

    await Recommendation.trackView(userId, sessionId, productId);

    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking view'
    });
  }
};

// Get personalized recommendations for homepage
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const sessionId = req.query.sessionId || req.headers['x-session-id'];
    const limit = parseInt(req.query.limit) || 8;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const recommendations = await Recommendation.getPersonalizedRecommendations(
      userId,
      sessionId,
      limit
    );

    res.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length
      }
    });
  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations'
    });
  }
};

// Get similar products for product detail page
export const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 8;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const similar = await Recommendation.getSimilarProducts(
      parseInt(productId),
      limit
    );

    res.json({
      success: true,
      data: {
        products: similar,
        count: similar.length
      }
    });
  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting similar products'
    });
  }
};
