import User from '../../models/admin/user.model.js';
import pool from '../../config/db.config.js';

const userController = {
  // Register a new user
  async register(req, res) {
    try {
      const { username, email, password, full_name, phone, address } = req.body;
      
      // Check if username or email already exists
      const existingUser = await User.findByUsername(username) || await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      
      const user = await User.create({
        username,
        email,
        password,
        full_name,
        phone,
        address
      });
      
      // Generate JWT token
      const token = User.generateToken(user);
      
      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  },
  
  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Generate JWT token
      const token = User.generateToken(user);
      
      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  },
  
  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Error getting profile', error: error.message });
    }
  },
  
  // Update user profile
  async updateProfile(req, res) {
    try {
      const { full_name, phone, address } = req.body;
      const updatedUser = await User.updateProfile(req.user.id, {
        full_name,
        phone,
        address
      });
      
      // Remove password from response
      const { password_hash, ...userWithoutPassword } = updatedUser;
      
      res.json({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
  },
  
  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await User.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({ message: error.message || 'Error changing password' });
    }
  },
  
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const [users] = await pool.execute('SELECT user_id, username, email, full_name, role, created_at FROM users');
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Error getting users', error: error.message });
    }
  },
  
  // Get user by ID (admin only)
  async getUserById(req, res) {
    try {
      const [users] = await pool.execute(
        'SELECT user_id, username, email, full_name, role, created_at FROM users WHERE user_id = ?',
        [req.params.id]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(users[0]);
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ message: 'Error getting user', error: error.message });
    }
  },
  
  // Update user role (admin only)
  async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      await pool.execute('UPDATE users SET role = ? WHERE user_id = ?', [role, req.params.id]);
      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
  },
  
  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      await pool.execute('DELETE FROM users WHERE user_id = ?', [req.params.id]);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  }
};

export default userController;
