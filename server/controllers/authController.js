const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/logActivity');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// POST /api/auth/register
async function registerUser(req, res, next) {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ message: 'Password is too long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Public registration always creates a standard user.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const token = generateToken(user._id);

    await logActivity({
      req,
      type: 'USER_REGISTERED',
      message: `New user registered: ${user.name} (${user.email})`,
      userId: user._id,
      metadata: { email: user.email, role: user.role },
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    return next(error);
  }
}

// POST /api/auth/login
async function loginUser(req, res, next) {
  try {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const now = new Date();
    await User.findByIdAndUpdate(user._id, { lastLoginAt: now });

    const token = generateToken(user._id);

    await logActivity({
      req,
      type: 'USER_LOGIN',
      message: `User logged in: ${user.name} (${user.email})`,
      userId: user._id,
      metadata: { email: user.email, role: user.role, loginAt: now.toISOString() },
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/auth/me
function getCurrentUser(req, res) {
  return res.status(200).json({
    user: formatUserResponse(req.user),
  });
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 2 and 60 characters' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true },
    );

    await logActivity({
      req,
      type: 'USER_PROFILE_UPDATED',
      message: `User updated profile name to "${name}"`,
      userId: req.user._id,
      metadata: { newName: name, email: req.user.email },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: formatUserResponse(updatedUser),
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    if (Buffer.byteLength(newPassword, 'utf8') > 72) {
      return res.status(400).json({ message: 'New password is too long' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    await logActivity({
      req,
      type: 'USER_PASSWORD_CHANGED',
      message: `Password changed for user ${user.name} (${user.email})`,
      userId: user._id,
      metadata: { email: user.email },
    });

    return res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
};
