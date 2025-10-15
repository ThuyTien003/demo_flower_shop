import Contact from '../../models/contact/contact.model.js';

const contactController = {
  // POST /api/contacts (public)
  async create(req, res) {
    try {
      const { name, email, phone, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email and message are required' });
      }
      const created = await Contact.create({ name, email, phone, message });
      res.status(201).json({ success: true, message: 'Message received', data: created });
    } catch (error) {
      console.error('Create contact error:', error);
      res.status(500).json({ success: false, message: 'Error submitting contact', error: error.message });
    }
  },

  // GET /api/contacts (admin)
  async list(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await Contact.findAll({ page: Number(page), limit: Number(limit) });
      res.json({ success: true, data: result.items, pagination: result.pagination });
    } catch (error) {
      console.error('List contacts error:', error);
      res.status(500).json({ success: false, message: 'Error fetching contacts', error: error.message });
    }
  }
};

export default contactController;
