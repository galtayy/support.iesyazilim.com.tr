const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to authenticate and verify JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Yetkilendirme hatası. Giriş yapmanız gerekiyor.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findOne({ where: { id: decoded.id } });
    
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Hesabınız devre dışı bırakılmıştır.' });
    }

    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ error: 'Yetkilendirme hatası.' });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Yetkisiz erişim. Yönetici hakları gereklidir.' });
  }
};

// Middleware to check if user is support staff or admin
exports.isSupportOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'support' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ error: 'Yetkisiz erişim.' });
  }
};