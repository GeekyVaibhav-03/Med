const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_super_secret';

// Try to load MongoDB User model, fallback to MySQL
let User, isMongoUser = false;
try {
  const mongoModels = require('../models/mongodb');
  User = mongoModels.User;
  isMongoUser = true;
  console.log('✅ Auth middleware: Using MongoDB');
} catch (err) {
  const { User: MySQLUser } = require('../models');
  User = MySQLUser;
  console.log('✅ Auth middleware: Using MySQL');
}

/**
 * ✅ Verify token and attach req.user
 */
async function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, error: 'Authorization header required' });
    }

    const token = h.split(' ')[1];
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ ok: false, error: 'Invalid token' });
    }

    if (!payload || !payload.id) {
      return res.status(401).json({ ok: false, error: 'Invalid token payload' });
    }

    // Find user from MongoDB or MySQL
    let user;
    if (isMongoUser) {
      user = await User.findById(payload.id);
    } else {
      user = await User.findByPk(payload.id);
    }

    if (!user) {
      return res.status(401).json({ ok: false, error: 'User not found' });
    }

    // Attach safe user object to request
    req.user = {
      id: user._id || user.id,
      username: user.username,
      role: user.role
    };

    next();
  } catch (err) {
    console.error('requireAuth error', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}

/**
 * ✅ Role Guard
 * Example:
 * requireRole('admin')
 * requireRole('admin', 'doctor')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: `Forbidden: ${allowedRoles.join(' or ')} only`
      });
    }

    next();
  };
}

/**
 * ✅ ADMIN-ONLY GUARD (for creating doctors & staff)
 * Use this on /register route
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      ok: false,
      error: 'Admin access only'
    });
  }

  next();
}

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin
};
