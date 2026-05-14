const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'student' // 👈 FORCE student
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.passwordHash) return res.status(401).json({ error: 'Please sign in with Google' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
}

// Verify user for password reset (check name + email)
async function verifyUserForReset(req, res) {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const user = await User.findOne({ email, name });
    
    if (!user) {
      return res.status(404).json({ error: 'No account found with this name and email combination' });
    }

    // Return success with user id (we'll use this to reset password)
    return res.json({ 
      success: true, 
      message: 'User verified',
      userId: user._id 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed' });
  }
}

// Reset password
async function resetPassword(req, res) {
  try {
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    return res.json({ 
      success: true, 
      message: 'Password reset successful' 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Password reset failed' });
  }
}

async function googleCallback(req, res) {
  try {
    // User is available in req.user from passport
    const user = req.user;
    const token = signToken(user);
    
    // Redirect to frontend with token
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientURL}/auth/google/success?token=${token}`);
  } catch (err) {
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientURL}/login?error=authentication_failed`);
  }
}

module.exports = { signup, login, googleCallback, verifyUserForReset, resetPassword };


