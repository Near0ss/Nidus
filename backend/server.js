import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Aumentar limite de payload para suportar imagens e arquivos grandes
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Paths
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// Load users from JSON file
async function loadUsers() {
  try {
    const data = await fs.readFile(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading users file:', err);
    return [];
  }
}

// Save users to JSON file
async function saveUsers(users) {
  try {
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file:', err);
    throw err;
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running' });
});

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password, businessName, professionalTitle, bio, country, state, projects, initialPrice, deliveryTime } = req.body;

    // Validation
    if (!email || !username || !password || !businessName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, username, password, and business name are required' 
      });
    }

    // Load existing users
    const users = await loadUsers();

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email or username already in use' 
      });
    }

    // Create new user object
    const newUser = {
      id: randomUUID(),
      email,
      username,
      password, // In production, hash the password!
      businessName,
      professionalTitle: professionalTitle || [],
      bio: bio || '',
      country: country || '',
      state: state || '',
      profilePhoto: '',
      banner: '',
      projects: projects || [],
      initialPrice: initialPrice || '',
      deliveryTime: deliveryTime || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add new user to array
    users.push(newUser);

    // Save updated users array
    await saveUsers(users);

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error registering user',
      error: error.message 
    });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!password || (!email && !username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email/username and password are required' 
      });
    }

    // Load users
    const users = await loadUsers();

    // Find user by email or username
    const user = users.find(u => u.email === email || u.username === username);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check password (in production, use bcrypt!)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        businessName: user.businessName,
        professionalTitle: user.professionalTitle,
        profilePhoto: user.profilePhoto || '',
        banner: user.banner || '',
        country: user.country || '',
        state: user.state || '',
        bio: user.bio || '',
        projects: user.projects || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error logging in',
      error: error.message 
    });
  }
});

// Get all users (for testing - remove in production)
app.get('/api/users', async (req, res) => {
  try {
    const users = await loadUsers();
    res.status(200).json({ 
      success: true, 
      count: users.length,
      users 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

// Get specific user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await loadUsers();
    const user = users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user',
      error: error.message 
    });
  }
});

// Update user by ID
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const users = await loadUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update user fields
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      id: users[userIndex].id, // Don't allow ID change
      createdAt: users[userIndex].createdAt, // Don't allow creation date change
      updatedAt: new Date().toISOString()
    };

    await saveUsers(users);

    res.status(200).json({ 
      success: true, 
      message: 'User updated successfully',
      user: users[userIndex]
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user',
      error: error.message 
    });
  }
});

// Delete user by ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await loadUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const deletedUser = users.splice(userIndex, 1);
    await saveUsers(users);

    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully',
      user: deletedUser[0]
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user',
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
  });
});

// Start server
async function startServer() {
  await ensureDataDir();
  app.listen(PORT, () => {
    console.log(`🚀 Nidus Backend running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${dataDir}`);
  });
}

startServer();
