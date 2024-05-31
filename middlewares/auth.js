const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
  authenticateToken: (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(400).send('Invalid Token');
    }
  },
  isAdmin: async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (user.role !== 'admin') return res.status(403).send('Access Denied');
    next();
  },
};
