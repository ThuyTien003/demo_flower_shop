import Slider from '../../models/admin/slider.model.js';

const sliderController = {
  // Public: GET /sliders/active
  async listPublicActive(req, res) {
    try {
      const { limit = 10 } = req.query;
      const result = await Slider.list({ page: 1, limit, activeOnly: true });
      res.json({ success: true, data: result.data });
    } catch (error) {
      console.error('List public sliders error:', error);
      res.status(500).json({ success: false, message: 'Error fetching sliders', error: error.message });
    }
  },
  // GET /admin/sliders
  async list(req, res) {
    try {
      const { page = 1, limit = 20, activeOnly } = req.query;
      const result = await Slider.list({ page, limit, activeOnly: String(activeOnly) === '1' });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      console.error('List sliders error:', error);
      res.status(500).json({ success: false, message: 'Error fetching sliders', error: error.message });
    }
  },

  // POST /admin/sliders
  async create(req, res) {
    try {
      const { title, image_url, link_url, is_active, sort_order } = req.body;
      if (!image_url) return res.status(400).json({ success: false, message: 'image_url is required' });
      const slider = await Slider.create({ title, image_url, link_url, is_active, sort_order });
      res.status(201).json({ success: true, message: 'Slider created', data: slider });
    } catch (error) {
      console.error('Create slider error:', error);
      res.status(500).json({ success: false, message: 'Error creating slider', error: error.message });
    }
  },

  // PUT /admin/sliders/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await Slider.update(id, req.body || {});
      if (!updated) return res.status(404).json({ success: false, message: 'Slider not found' });
      res.json({ success: true, message: 'Slider updated', data: updated });
    } catch (error) {
      console.error('Update slider error:', error);
      res.status(500).json({ success: false, message: 'Error updating slider', error: error.message });
    }
  },

  // DELETE /admin/sliders/:id
  async remove(req, res) {
    try {
      const { id } = req.params;
      const ok = await Slider.remove(id);
      if (!ok) return res.status(404).json({ success: false, message: 'Slider not found' });
      res.json({ success: true, message: 'Slider deleted' });
    } catch (error) {
      console.error('Delete slider error:', error);
      res.status(500).json({ success: false, message: 'Error deleting slider', error: error.message });
    }
  }
};

export default sliderController;
