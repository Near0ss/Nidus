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
const normalUsersFile = path.join(dataDir, 'normalUsers.json');

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

async function loadNormalUsers() {
  try {
    const data = await fs.readFile(normalUsersFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading normal users file:', err);
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

async function saveNormalUsers(users) {
  try {
    await fs.writeFile(normalUsersFile, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving normal users file:', err);
    throw err;
  }
}

function buildFreelancerResponse(user) {
  return {
    id: user.id,
    type: user.type || 'freelancer',
    email: user.email,
    username: user.username,
    businessName: user.businessName,
    professionalTitle: user.professionalTitle || [],
    bio: user.bio || '',
    country: user.country || '',
    state: user.state || '',
    profilePhoto: user.profilePhoto || '',
    banner: user.banner || '',
    socialLinks: user.socialLinks || {
      instagram: '',
      twitter: '',
      linkedin: '',
      facebook: ''
    },
    availability: user.availability || '',
    experience: user.experience || '',
    projects: user.projects || [],
    services: user.services || [],
    posts: user.posts || [],
    statistics: user.statistics || {
      services: 0,
      projects: (user.projects || []).length,
      followers: 0,
      likes: 0,
      posts: (user.posts || []).length,
      reviews: 0,
      views: 0,
      recentActivities: 0
    },
    finance: user.finance || {
      balance: 0,
      earnings: 0,
      expenses: 0
    },
    messages: user.messages || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function buildNormalUserResponse(user) {
  return {
    id: user.id,
    type: 'normal',
    name: user.name,
    email: user.email,
    country: user.country || '',
    state: user.state || '',
    profilePhoto: user.profilePhoto || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function findUserById(users, normalUsers, id) {
  const freelancer = users.find((u) => u.id === id);
  if (freelancer) return { user: freelancer, type: 'freelancer' };
  const normal = normalUsers.find((u) => u.id === id);
  if (normal) return { user: normal, type: 'normal' };
  return { user: null, type: null };
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running' });
});

// Register new freelancer
app.post('/api/register', async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      businessName,
      professionalTitle,
      bio,
      country,
      state,
      projects,
      initialPrice,
      deliveryTime
    } = req.body;

    if (!email || !username || !password || !businessName) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, password, and business name are required'
      });
    }

    const users = await loadUsers();
    const existingUser = users.find((u) => u.email === email || u.username === username);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email or username already in use'
      });
    }

    const newUser = {
      id: randomUUID(),
      type: 'freelancer',
      email,
      username,
      password,
      businessName,
      professionalTitle: Array.isArray(professionalTitle) ? professionalTitle : [],
      bio: bio || '',
      country: country || '',
      state: state || '',
      profilePhoto: '',
      banner: '',
      socialLinks: {
        instagram: '',
        twitter: '',
        linkedin: '',
        facebook: ''
      },
      availability: '',
      experience: '',
      projects: Array.isArray(projects) ? projects : [],
      services: [],
      posts: [],
      statistics: {
        services: 0,
        projects: Array.isArray(projects) ? projects.length : 0,
        followers: 0,
        likes: 0,
        posts: 0,
        reviews: 0,
        views: 0,
        recentActivities: 0
      },
      finance: {
        balance: 0,
        earnings: 0,
        expenses: 0
      },
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      initialPrice: initialPrice || '',
      deliveryTime: deliveryTime || ''
    };

    users.push(newUser);
    await saveUsers(users);

    res.status(201).json({
      success: true,
      message: 'Freelancer registered successfully',
      user: buildFreelancerResponse(newUser)
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering freelancer',
      error: error.message
    });
  }
});

// Register normal user
app.post('/api/register-user', async (req, res) => {
  try {
    const { name, email, password, country, state } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const normalUsers = await loadNormalUsers();
    const existingNormal = normalUsers.find((u) => u.email === email);

    if (existingNormal) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    const newUser = {
      id: randomUUID(),
      type: 'normal',
      name,
      email,
      password,
      country: country || '',
      state: state || '',
      profilePhoto: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    normalUsers.push(newUser);
    await saveNormalUsers(normalUsers);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: buildNormalUserResponse(newUser)
    });
  } catch (error) {
    console.error('Register normal user error:', error);
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

    if (!password || (!email && !username)) {
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required'
      });
    }

    const users = await loadUsers();
    const normalUsers = await loadNormalUsers();

    const freelancer = users.find((u) => u.email === email || u.username === username);
    const normal = normalUsers.find((u) => u.email === email);
    const user = freelancer || normal;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    const responseUser = user.type === 'normal' ? buildNormalUserResponse(user) : buildFreelancerResponse(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: responseUser
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

// Get all freelancers
app.get('/api/users', async (req, res) => {
  try {
    const users = await loadUsers();
    const freelancers = users.map(buildFreelancerResponse);
    res.status(200).json({
      success: true,
      count: freelancers.length,
      users: freelancers
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
    const normalUsers = await loadNormalUsers();
    const { user, type } = findUserById(users, normalUsers, id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const responseUser = type === 'normal' ? buildNormalUserResponse(user) : buildFreelancerResponse(user);
    res.status(200).json({
      success: true,
      user: responseUser
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
    const normalUsers = await loadNormalUsers();
    const { user, type } = findUserById(users, normalUsers, id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (type === 'normal') {
      const normalIndex = normalUsers.findIndex((u) => u.id === id);
      normalUsers[normalIndex] = {
        ...normalUsers[normalIndex],
        ...updates,
        id: normalUsers[normalIndex].id,
        createdAt: normalUsers[normalIndex].createdAt,
        updatedAt: new Date().toISOString()
      };
      await saveNormalUsers(normalUsers);
      return res.status(200).json({
        success: true,
        message: 'Normal user updated successfully',
        user: buildNormalUserResponse(normalUsers[normalIndex])
      });
    }

    const userIndex = users.findIndex((u) => u.id === id);
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      id: users[userIndex].id,
      createdAt: users[userIndex].createdAt,
      updatedAt: new Date().toISOString()
    };

    if (updates.projects) {
      users[userIndex].statistics = {
        ...users[userIndex].statistics,
        projects: Array.isArray(updates.projects) ? updates.projects.length : users[userIndex].statistics.projects
      };
    }
    if (updates.services) {
      users[userIndex].statistics = {
        ...users[userIndex].statistics,
        services: Array.isArray(updates.services) ? updates.services.length : users[userIndex].statistics.services
      };
    }
    if (updates.posts) {
      users[userIndex].statistics = {
        ...users[userIndex].statistics,
        posts: Array.isArray(updates.posts) ? updates.posts.length : users[userIndex].statistics.posts
      };
    }

    await saveUsers(users);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: buildFreelancerResponse(users[userIndex])
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

// Add post to user feed
app.post('/api/users/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, media, caption } = req.body;

    if (!type || !media) {
      return res.status(400).json({
        success: false,
        message: 'Post type and media are required'
      });
    }

    const users = await loadUsers();
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newPost = {
      id: randomUUID(),
      type,
      media,
      caption: caption || '',
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      savedBy: []
    };

    users[userIndex].posts = [...(users[userIndex].posts || []), newPost];
    users[userIndex].statistics = {
      ...users[userIndex].statistics,
      posts: (users[userIndex].posts || []).length
    };
    users[userIndex].updatedAt = new Date().toISOString();

    await saveUsers(users);

    const author = {
      id: users[userIndex].id,
      username: users[userIndex].username,
      businessName: users[userIndex].businessName,
      profilePhoto: users[userIndex].profilePhoto,
      banner: users[userIndex].banner,
      country: users[userIndex].country,
      state: users[userIndex].state,
      professionalTitle: users[userIndex].professionalTitle || []
    };

    res.status(201).json({
      success: true,
      message: 'Post added successfully',
      post: { ...newPost, author },
      user: buildFreelancerResponse(users[userIndex])
    });
  } catch (error) {
    console.error('Add post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding post',
      error: error.message
    });
  }
});

// Get social feed
app.get('/api/feed', async (req, res) => {
  try {
    const { country, city, categories, tools, q } = req.query;
    const users = await loadUsers();

    const categoriesFilter = categories
      ? categories.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
      : [];
    const toolsFilter = tools
      ? tools.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
      : [];
    const queryText = q?.trim().toLowerCase() || '';

    const feed = users.reduce((posts, user) => {
      const userPosts = (user.posts || []).map((post) => ({
        ...post,
        author: {
          id: user.id,
          username: user.username,
          businessName: user.businessName,
          profilePhoto: user.profilePhoto,
          banner: user.banner,
          country: user.country,
          state: user.state,
          professionalTitle: user.professionalTitle || []
        }
      }));
      return [...posts, ...userPosts];
    }, []);

    const filteredFeed = feed.filter((post) => {
      if (country && post.author.country?.toLowerCase() !== country.toLowerCase()) {
        return false;
      }

      if (city && !post.author.state?.toLowerCase().includes(city.toLowerCase())) {
        return false;
      }

      const searchSource = [
        post.caption || '',
        post.author.businessName || '',
        post.author.username || '',
        ...(post.author.professionalTitle || []),
        post.type || ''
      ]
        .join(' ')
        .toLowerCase();

      if (categoriesFilter.length > 0 && !categoriesFilter.some((category) => searchSource.includes(category))) {
        return false;
      }

      if (toolsFilter.length > 0 && !toolsFilter.some((tool) => searchSource.includes(tool))) {
        return false;
      }

      if (queryText && !searchSource.includes(queryText)) {
        return false;
      }

      return true;
    });

    filteredFeed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: filteredFeed.length,
      feed: filteredFeed
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feed',
      error: error.message
    });
  }
});

// Delete user by ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await loadUsers();
    const userIndex = users.findIndex((u) => u.id === id);

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
app.use((err, req, res, _next) => {
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
