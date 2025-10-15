import BlogCategory from '../../models/blog/blogCategory.model.js';
import BlogPost from '../../models/blog/blogPost.model.js';
import BlogComment from '../../models/blog/blogComment.model.js';

const blogController = {
  // Categories
  async listCategories(req, res) {
    try {
      const categories = await BlogCategory.findAll();
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error('List blog categories error:', error);
      res.status(500).json({ success: false, message: 'Error fetching blog categories', error: error.message });
    }
  },

  async getCategory(req, res) {
    try {
      const { id } = req.params;
      const cat = await BlogCategory.findById(Number(id));
      if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
      res.json({ success: true, data: cat });
    } catch (error) {
      console.error('Get blog category error:', error);
      res.status(500).json({ success: false, message: 'Error fetching blog category', error: error.message });
    }
  },

  async createCategory(req, res) {
    try {
      const { name, slug, description } = req.body;
      if (!name || !slug) return res.status(400).json({ success: false, message: 'Name and slug are required' });
      const cat = await BlogCategory.create({ name, slug, description });
      res.status(201).json({ success: true, message: 'Category created', data: cat });
    } catch (error) {
      console.error('Create blog category error:', error);
      res.status(500).json({ success: false, message: 'Error creating blog category', error: error.message });
    }
  },

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, slug, description } = req.body;
      const exists = await BlogCategory.findById(Number(id));
      if (!exists) return res.status(404).json({ success: false, message: 'Category not found' });
      const cat = await BlogCategory.update(Number(id), { name, slug, description });
      res.json({ success: true, message: 'Category updated', data: cat });
    } catch (error) {
      console.error('Update blog category error:', error);
      res.status(500).json({ success: false, message: 'Error updating blog category', error: error.message });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await BlogCategory.delete(Number(id));
      res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
      console.error('Delete blog category error:', error);
      res.status(500).json({ success: false, message: 'Error deleting blog category', error: error.message });
    }
  },

  // Posts
  async listPosts(req, res) {
    try {
      const { category_id, page = 1, limit = 10 } = req.query;
      const result = await BlogPost.findAll({ category_id, page, limit });
      res.json({ success: true, data: result.posts, pagination: result.pagination });
    } catch (error) {
      console.error('List blog posts error:', error);
      res.status(500).json({ success: false, message: 'Error fetching blog posts', error: error.message });
    }
  },

  async getPost(req, res) {
    try {
      const { id } = req.params;
      const post = await BlogPost.findById(Number(id));
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      res.json({ success: true, data: post });
    } catch (error) {
      console.error('Get blog post error:', error);
      res.status(500).json({ success: false, message: 'Error fetching blog post', error: error.message });
    }
  },

  async createPost(req, res) {
    try {
      const { category_id, title, slug, content, image_url } = req.body;
      if (!title || !slug || !content) return res.status(400).json({ success: false, message: 'Title, slug, and content are required' });
      const author_id = req.user?.id || null;
      const post = await BlogPost.create({ category_id, author_id, title, slug, content, image_url });
      res.status(201).json({ success: true, message: 'Post created', data: post });
    } catch (error) {
      console.error('Create blog post error:', error);
      res.status(500).json({ success: false, message: 'Error creating blog post', error: error.message });
    }
  },

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const exists = await BlogPost.findById(Number(id));
      if (!exists) return res.status(404).json({ success: false, message: 'Post not found' });

      const { category_id, title, slug, content, image_url } = req.body;
      const post = await BlogPost.update(Number(id), { category_id, title, slug, content, image_url });
      res.json({ success: true, message: 'Post updated', data: post });
    } catch (error) {
      console.error('Update blog post error:', error);
      res.status(500).json({ success: false, message: 'Error updating blog post', error: error.message });
    }
  },

  async deletePost(req, res) {
    try {
      const { id } = req.params;
      await BlogPost.delete(Number(id));
      res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
      console.error('Delete blog post error:', error);
      res.status(500).json({ success: false, message: 'Error deleting blog post', error: error.message });
    }
  },

  // Comments
  async listComments(req, res) {
    try {
      const { post_id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const result = await BlogComment.findByPost(Number(post_id), { page, limit });
      res.json({ success: true, data: result.comments, pagination: result.pagination });
    } catch (error) {
      console.error('List blog comments error:', error);
      res.status(500).json({ success: false, message: 'Error fetching comments', error: error.message });
    }
  },

  async createComment(req, res) {
    try {
      const { post_id } = req.params;
      const { comment } = req.body;
      if (!comment) return res.status(400).json({ success: false, message: 'Comment is required' });
      // Ensure the post exists to avoid FK constraint errors
      const post = await BlogPost.findById(Number(post_id));
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      const user_id = req.user.id;
      const created = await BlogComment.create({ post_id: Number(post_id), user_id, comment });
      res.status(201).json({ success: true, message: 'Comment added', data: created });
    } catch (error) {
      console.error('Create blog comment error:', error);
      res.status(500).json({ success: false, message: 'Error adding comment', error: error.message });
    }
  },

  async deleteComment(req, res) {
    try {
      const { comment_id } = req.params;
      // Only admin can delete; in the future, allow owner deletion after fetching record
      await BlogComment.delete(Number(comment_id));
      res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      console.error('Delete blog comment error:', error);
      res.status(500).json({ success: false, message: 'Error deleting comment', error: error.message });
    }
  }
};

export default blogController;
