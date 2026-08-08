import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import {
  validateEmail,
  validateUsername,
  validateRegistrationData,
  validateNormalUserData,
  normalizeUsername
} from './validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'nidus-dev-secret-change-me';
const BCRYPT_ROUNDS = 10;
const AUTH_COOKIE = 'nidus_token';
const TOKEN_EXPIRES_IN = '7d';
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const FREELANCER_ALLOWED_FIELDS = [
  'email',
  'username',
  'businessName',
  'professionalTitle',
  'bio',
  'country',
  'state',
  'website',
  'profilePhoto',
  'banner',
  'socialLinks',
  'availability',
  'experience',
  'projects',
  'services',
  'initialPrice',
  'deliveryTime'
];

const NORMAL_ALLOWED_FIELDS = [
  'name',
  'email',
  'country',
  'state',
  'profilePhoto',
  'banner',
  'bio',
  'company',
  'website',
  'phone',
  'hiringFocus',
  'socialLinks'
];

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const normalUsersFile = path.join(dataDir, 'normalUsers.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

async function loadUsers() {
  try {
    const data = (await fs.readFile(usersFile, 'utf-8')).replace(/^\uFEFF/, '');
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
    const data = (await fs.readFile(normalUsersFile, 'utf-8')).replace(/^\uFEFF/, '');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading normal users file:', err);
    return [];
  }
}

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
    website: user.website || '',
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

function buildPublicFreelancerProfile(user) {
  const full = buildFreelancerResponse(user);
  return {
    id: full.id,
    type: full.type,
    username: full.username,
    businessName: full.businessName,
    professionalTitle: full.professionalTitle,
    bio: full.bio,
    country: full.country,
    state: full.state,
    profilePhoto: full.profilePhoto,
    banner: full.banner,
    socialLinks: full.socialLinks,
    availability: full.availability,
    experience: full.experience,
    projects: full.projects,
    services: full.services,
    posts: full.posts,
    statistics: full.statistics,
    createdAt: full.createdAt,
    updatedAt: full.updatedAt
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
    banner: user.banner || '',
    bio: user.bio || '',
    company: user.company || '',
    website: user.website || '',
    phone: user.phone || '',
    hiringFocus: user.hiringFocus || '',
    socialLinks: user.socialLinks || {
      instagram: '',
      twitter: '',
      linkedin: '',
      facebook: ''
    },
    savedIds: Array.isArray(user.savedIds) ? user.savedIds : [],
    provider: user.provider || 'local',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function slugFromEmail(email) {
  const base = String(email || '')
    .split('@')[0]
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 12) || 'user';
  return `${base}_${randomUUID().slice(0, 4)}`;
}

function findUserById(users, normalUsers, id) {
  const freelancer = users.find((u) => u.id === id);
  if (freelancer) return { user: freelancer, type: 'freelancer' };
  const normal = normalUsers.find((u) => u.id === id);
  if (normal) return { user: normal, type: 'normal' };
  return { user: null, type: null };
}

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

function signToken(payload) {
  return jwt.sign({ id: payload.id, type: payload.type }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN
  });
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_MAX_AGE_MS,
    path: '/'
  });
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
}

function sendServerError(res, context, error) {
  console.error(context, error);
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
}

function pickAllowedFields(body, allowed) {
  const result = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) {
      result[key] = body[key];
    }
  }
  return result;
}

function sanitizeSocialLinks(links) {
  if (!links || typeof links !== 'object' || Array.isArray(links)) {
    return null;
  }

  return {
    instagram: typeof links.instagram === 'string' ? links.instagram : '',
    twitter: typeof links.twitter === 'string' ? links.twitter : '',
    linkedin: typeof links.linkedin === 'string' ? links.linkedin : '',
    facebook: typeof links.facebook === 'string' ? links.facebook : ''
  };
}

async function verifyPasswordAndMaybeRehash(user, plainPassword) {
  const stored = user.password;

  if (isBcryptHash(stored)) {
    return {
      ok: await bcrypt.compare(plainPassword, stored),
      needsRehash: false
    };
  }

  const ok = stored === plainPassword;
  return { ok, needsRehash: ok };
}

function authRequired(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (req.cookies?.[AUTH_COOKIE]) {
      token = req.cookies[AUTH_COOKIE];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado. Faça login para continuar.'
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload?.id || !payload?.type) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado. Faça login novamente.'
      });
    }

    req.auth = { id: payload.id, type: payload.type };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado. Faça login novamente.'
    });
  }
}

function assertOwner(req, res, id) {
  if (!req.auth || req.auth.id !== id) {
    res.status(403).json({
      success: false,
      message: 'Você não tem permissão para realizar esta ação.'
    });
    return false;
  }
  return true;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function checkAccountTaken({ email, username }) {
  const users = await loadUsers();
  const normalUsers = await loadNormalUsers();
  const all = [...users, ...normalUsers];
  const emailNorm = normalizeEmail(email);
  const usernameNorm = username ? normalizeUsername(username) : '';

  return {
    emailTaken: Boolean(
      emailNorm && all.some((user) => normalizeEmail(user.email) === emailNorm),
    ),
    usernameTaken: Boolean(
      usernameNorm &&
        all.some((user) => normalizeUsername(user.username) === usernameNorm),
    ),
  };
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running' });
});

app.get('/api/register/check', async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email);
    const username = normalizeUsername(req.query.username);
    const taken = await checkAccountTaken({ email, username });

    res.status(200).json({
      success: true,
      email: email || null,
      username: username || null,
      emailTaken: taken.emailTaken,
      usernameTaken: taken.usernameTaken,
      available: !taken.emailTaken && !taken.usernameTaken,
    });
  } catch (error) {
    sendServerError(res, 'Register check error:', error);
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const password = req.body.password;
    const businessName = req.body.businessName;
    const professionalTitle = req.body.professionalTitle;
    const bio = req.body.bio;
    const country = req.body.country;
    const state = req.body.state;
    const projects = req.body.projects;
    const initialPrice = req.body.initialPrice;
    const deliveryTime = req.body.deliveryTime;
    const email = normalizeEmail(req.body.email);
    const username = normalizeUsername(req.body.username);

    const validation = validateRegistrationData({ ...req.body, email, username });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join('. '),
        errors: validation.errors
      });
    }

    const users = await loadUsers();
    const { emailTaken, usernameTaken } = await checkAccountTaken({ email, username });

    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: 'Este e-mail já está cadastrado'
      });
    }

    if (usernameTaken) {
      return res.status(409).json({
        success: false,
        message: 'Este username já está em uso'
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const newUser = {
      id: randomUUID(),
      type: 'freelancer',
      email,
      username,
      password: hashedPassword,
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

    const token = signToken({ id: newUser.id, type: 'freelancer' });
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Freelancer cadastrado com sucesso',
      user: buildFreelancerResponse(newUser),
      token
    });
  } catch (error) {
    sendServerError(res, 'Register error:', error);
  }
});

app.post('/api/register-user', async (req, res) => {
  try {
    const { name, password, country, state } = req.body;
    const email = normalizeEmail(req.body.email);

    const validation = validateNormalUserData({ ...req.body, email });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join('. '),
        errors: validation.errors
      });
    }

    const normalUsers = await loadNormalUsers();
    const { emailTaken } = await checkAccountTaken({ email });

    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: 'Este e-mail já está cadastrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const newUser = {
      id: randomUUID(),
      type: 'normal',
      name: String(name).trim(),
      email,
      password: hashedPassword,
      country: country || '',
      state: state || '',
      profilePhoto: '',
      banner: '',
      bio: '',
      company: '',
      website: '',
      phone: '',
      hiringFocus: '',
      socialLinks: {
        instagram: '',
        twitter: '',
        linkedin: '',
        facebook: ''
      },
      savedIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    normalUsers.push(newUser);
    await saveNormalUsers(normalUsers);

    const token = signToken({ id: newUser.id, type: 'normal' });
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: buildNormalUserResponse(newUser),
      token
    });
  } catch (error) {
    sendServerError(res, 'Register normal user error:', error);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!password || (!email && !username)) {
      return res.status(400).json({
        success: false,
        message: 'E-mail/usuário e senha são obrigatórios'
      });
    }

    const users = await loadUsers();
    const normalUsers = await loadNormalUsers();

    const freelancerIndex = users.findIndex((u) => u.email === email || u.username === username);
    const normalIndex = normalUsers.findIndex((u) => u.email === email);

    let type = null;
    let user = null;
    let userIndex = -1;

    if (freelancerIndex !== -1) {
      type = 'freelancer';
      user = users[freelancerIndex];
      userIndex = freelancerIndex;
    } else if (normalIndex !== -1) {
      type = 'normal';
      user = normalUsers[normalIndex];
      userIndex = normalIndex;
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-mail/usuário ou senha inválidos'
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Esta conta entra com Google. Use o botão “Entrar com Google”.'
      });
    }

    const { ok, needsRehash } = await verifyPasswordAndMaybeRehash(user, password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: 'E-mail/usuário ou senha inválidos'
      });
    }

    if (needsRehash) {
      user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
      user.updatedAt = new Date().toISOString();

      if (type === 'freelancer') {
        users[userIndex] = user;
        await saveUsers(users);
      } else {
        normalUsers[userIndex] = user;
        await saveNormalUsers(normalUsers);
      }
    }

    const token = signToken({ id: user.id, type });
    setAuthCookie(res, token);

    const responseUser = type === 'normal'
      ? buildNormalUserResponse(user)
      : buildFreelancerResponse(user);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      user: responseUser,
      token
    });
  } catch (error) {
    sendServerError(res, 'Login error:', error);
  }
});

app.post('/api/login/google', async (req, res) => {
  try {
    const { accessToken } = req.body || {};

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token do Google é obrigatório'
      });
    }

    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!googleRes.ok) {
      return res.status(401).json({
        success: false,
        message: 'Não foi possível validar a conta Google'
      });
    }

    const profile = await googleRes.json();
    const email = String(profile.email || '').trim().toLowerCase();

    if (!email || profile.email_verified === false) {
      return res.status(401).json({
        success: false,
        message: 'E-mail Google não verificado'
      });
    }

    const users = await loadUsers();
    const normalUsers = await loadNormalUsers();

    const freelancerIndex = users.findIndex((u) => String(u.email || '').toLowerCase() === email);
    const normalIndex = normalUsers.findIndex((u) => String(u.email || '').toLowerCase() === email);

    let type = null;
    let user = null;

    if (freelancerIndex !== -1) {
      type = 'freelancer';
      user = users[freelancerIndex];
      user.googleId = profile.sub || user.googleId || '';
      user.provider = user.provider || 'google';
      if (!user.profilePhoto && profile.picture) user.profilePhoto = profile.picture;
      user.updatedAt = new Date().toISOString();
      users[freelancerIndex] = user;
      await saveUsers(users);
    } else if (normalIndex !== -1) {
      type = 'normal';
      user = normalUsers[normalIndex];
      user.googleId = profile.sub || user.googleId || '';
      user.provider = user.provider || 'google';
      if (!user.profilePhoto && profile.picture) user.profilePhoto = profile.picture;
      user.updatedAt = new Date().toISOString();
      normalUsers[normalIndex] = user;
      await saveNormalUsers(normalUsers);
    } else {
      type = 'normal';
      user = {
        id: randomUUID(),
        type: 'normal',
        name: profile.name || profile.given_name || email.split('@')[0],
        email,
        password: null,
        provider: 'google',
        googleId: profile.sub || '',
        country: '',
        state: '',
        profilePhoto: profile.picture || '',
        banner: '',
        bio: '',
        company: '',
        website: '',
        phone: '',
        hiringFocus: '',
        socialLinks: {
          instagram: '',
          twitter: '',
          linkedin: '',
          facebook: ''
        },
        savedIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        username: slugFromEmail(email)
      };
      normalUsers.push(user);
      await saveNormalUsers(normalUsers);
    }

    const token = signToken({ id: user.id, type });
    setAuthCookie(res, token);

    const responseUser = type === 'normal'
      ? buildNormalUserResponse(user)
      : buildFreelancerResponse(user);

    return res.status(200).json({
      success: true,
      message: 'Login com Google realizado com sucesso',
      user: responseUser,
      token
    });
  } catch (error) {
    sendServerError(res, 'Google login error:', error);
  }
});

app.post('/api/logout', (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

app.get('/api/me', authRequired, async (req, res) => {
  try {
    const users = await loadUsers();
    const normalUsers = await loadNormalUsers();
    const { user, type } = findUserById(users, normalUsers, req.auth.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const responseUser = type === 'normal'
      ? buildNormalUserResponse(user)
      : buildFreelancerResponse(user);

    res.status(200).json({
      success: true,
      user: responseUser
    });
  } catch (error) {
    sendServerError(res, 'Error fetching current user:', error);
  }
});

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
    sendServerError(res, 'Error fetching users:', error);
  }
});

app.get('/api/u/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const users = await loadUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user: buildPublicFreelancerProfile(user)
    });
  } catch (error) {
    sendServerError(res, 'Error fetching public profile:', error);
  }
});

app.get('/api/saved', authRequired, async (req, res) => {
  try {
    if (req.auth.type !== 'normal') {
      return res.status(403).json({
        success: false,
        message: 'Apenas usuários comuns podem listar freelancers salvos.'
      });
    }

    const users = await loadUsers();
    const normalUsers = await loadNormalUsers();
    const { user } = findUserById(users, normalUsers, req.auth.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const savedIds = Array.isArray(user.savedIds) ? user.savedIds : [];
    const savedFreelancers = users
      .filter((freelancer) => savedIds.includes(freelancer.id))
      .map(buildPublicFreelancerProfile);

    res.status(200).json({
      success: true,
      count: savedFreelancers.length,
      savedIds,
      users: savedFreelancers
    });
  } catch (error) {
    sendServerError(res, 'Error fetching saved freelancers:', error);
  }
});

app.post('/api/saved/:freelancerId', authRequired, async (req, res) => {
  try {
    if (req.auth.type !== 'normal') {
      return res.status(403).json({
        success: false,
        message: 'Apenas usuários comuns podem salvar freelancers.'
      });
    }

    const { freelancerId } = req.params;
    const users = await loadUsers();
    const freelancer = users.find((u) => u.id === freelancerId);

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer não encontrado'
      });
    }

    const normalUsers = await loadNormalUsers();
    const userIndex = normalUsers.findIndex((u) => u.id === req.auth.id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const current = Array.isArray(normalUsers[userIndex].savedIds)
      ? [...normalUsers[userIndex].savedIds]
      : [];
    const alreadySaved = current.includes(freelancerId);
    const savedIds = alreadySaved
      ? current.filter((id) => id !== freelancerId)
      : [...current, freelancerId];

    normalUsers[userIndex].savedIds = savedIds;
    normalUsers[userIndex].updatedAt = new Date().toISOString();
    await saveNormalUsers(normalUsers);

    res.status(200).json({
      success: true,
      message: alreadySaved ? 'Freelancer removido dos salvos' : 'Freelancer salvo com sucesso',
      saved: !alreadySaved,
      savedIds,
      user: buildNormalUserResponse(normalUsers[userIndex])
    });
  } catch (error) {
    sendServerError(res, 'Error toggling saved freelancer:', error);
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await loadUsers();
    const normalUsers = await loadNormalUsers();
    const { user, type } = findUserById(users, normalUsers, id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const responseUser = type === 'normal'
      ? buildNormalUserResponse(user)
      : buildFreelancerResponse(user);

    res.status(200).json({
      success: true,
      user: responseUser
    });
  } catch (error) {
    sendServerError(res, 'Error fetching user:', error);
  }
});

app.put('/api/users/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    if (!assertOwner(req, res, id)) {
      return;
    }

    const users = await loadUsers();
    const normalUsers = await loadNormalUsers();
    const { user, type } = findUserById(users, normalUsers, id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (type === 'normal') {
      const updates = pickAllowedFields(req.body, NORMAL_ALLOWED_FIELDS);

      if (updates.socialLinks) {
        const sanitized = sanitizeSocialLinks(updates.socialLinks);
        if (!sanitized) {
          return res.status(400).json({
            success: false,
            message: 'Redes sociais inválidas'
          });
        }
        updates.socialLinks = sanitized;
      }

      ['name', 'country', 'state', 'bio', 'company', 'website', 'phone', 'hiringFocus'].forEach((key) => {
        if (typeof updates[key] === 'string') updates[key] = updates[key].trim();
      });

      if (updates.email && !validateEmail(updates.email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      if (updates.email && updates.email !== user.email) {
        const emailTaken = users.some((u) => u.email === updates.email)
          || normalUsers.some((u) => u.id !== id && u.email === updates.email);
        if (emailTaken) {
          return res.status(409).json({
            success: false,
            message: 'E-mail já está em uso'
          });
        }
      }

      if (updates.name) {
        updates.name = String(updates.name).trim();
        if (!updates.name) {
          return res.status(400).json({
            success: false,
            message: 'Nome é obrigatório'
          });
        }
      }

      const normalIndex = normalUsers.findIndex((u) => u.id === id);
      normalUsers[normalIndex] = {
        ...normalUsers[normalIndex],
        ...updates,
        id: normalUsers[normalIndex].id,
        type: 'normal',
        password: normalUsers[normalIndex].password,
        savedIds: Array.isArray(normalUsers[normalIndex].savedIds)
          ? normalUsers[normalIndex].savedIds
          : [],
        createdAt: normalUsers[normalIndex].createdAt,
        updatedAt: new Date().toISOString()
      };

      await saveNormalUsers(normalUsers);

      return res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        user: buildNormalUserResponse(normalUsers[normalIndex])
      });
    }

    const updates = pickAllowedFields(req.body, FREELANCER_ALLOWED_FIELDS);

    if (updates.email && !validateEmail(updates.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    if (updates.username) {
      updates.username = normalizeUsername(updates.username);
      if (!validateUsername(updates.username)) {
        return res.status(400).json({
          success: false,
          message: 'Username deve ter 3-20 caracteres (apenas letras, números e underscore)'
        });
      }
    }

    if (updates.email && updates.email !== user.email) {
      const emailTaken = users.some((u) => u.id !== id && u.email === updates.email)
        || normalUsers.some((u) => u.email === updates.email);
      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: 'E-mail já está em uso'
        });
      }
    }

    if (updates.username && updates.username !== user.username) {
      const usernameTaken = users.some((u) => u.id !== id && u.username === updates.username);
      if (usernameTaken) {
        return res.status(409).json({
          success: false,
          message: 'Nome de usuário já está em uso'
        });
      }
    }

    if (updates.socialLinks) {
      const sanitized = sanitizeSocialLinks(updates.socialLinks);
      if (!sanitized) {
        return res.status(400).json({
          success: false,
          message: 'Links sociais inválidos'
        });
      }
      updates.socialLinks = sanitized;
    }

    if (updates.professionalTitle && !Array.isArray(updates.professionalTitle)) {
      return res.status(400).json({
        success: false,
        message: 'Títulos profissionais devem ser uma lista'
      });
    }

    if (updates.projects && !Array.isArray(updates.projects)) {
      return res.status(400).json({
        success: false,
        message: 'Projetos devem ser uma lista'
      });
    }

    if (updates.services && !Array.isArray(updates.services)) {
      return res.status(400).json({
        success: false,
        message: 'Serviços devem ser uma lista'
      });
    }

    const userIndex = users.findIndex((u) => u.id === id);
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      id: users[userIndex].id,
      type: 'freelancer',
      password: users[userIndex].password,
      finance: users[userIndex].finance,
      messages: users[userIndex].messages,
      statistics: users[userIndex].statistics,
      createdAt: users[userIndex].createdAt,
      updatedAt: new Date().toISOString()
    };

    if (updates.projects) {
      users[userIndex].statistics = {
        ...users[userIndex].statistics,
        projects: updates.projects.length
      };
    }
    if (updates.services) {
      users[userIndex].statistics = {
        ...users[userIndex].statistics,
        services: updates.services.length
      };
    }

    await saveUsers(users);

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: buildFreelancerResponse(users[userIndex])
    });
  } catch (error) {
    sendServerError(res, 'Update error:', error);
  }
});

app.post('/api/users/:id/posts', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    if (!assertOwner(req, res, id)) {
      return;
    }

    if (req.auth.type !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Apenas freelancers podem publicar no feed.'
      });
    }

    const { type, media, caption } = req.body;

    if (!type || !media) {
      return res.status(400).json({
        success: false,
        message: 'Tipo do post e mídia são obrigatórios'
      });
    }

    const users = await loadUsers();
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
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
      message: 'Post publicado com sucesso',
      post: { ...newPost, author },
      user: buildFreelancerResponse(users[userIndex])
    });
  } catch (error) {
    sendServerError(res, 'Add post error:', error);
  }
});

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
        post.author.country || '',
        post.author.state || '',
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

      if (queryText) {
        const tokens = queryText.split(/\s+/).filter(Boolean);
        if (!tokens.every((token) => searchSource.includes(token))) {
          return false;
        }
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
    sendServerError(res, 'Error fetching feed:', error);
  }
});

app.delete('/api/users/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    if (!assertOwner(req, res, id)) {
      return;
    }

    const users = await loadUsers();
    const normalUsers = await loadNormalUsers();
    const freelancerIndex = users.findIndex((u) => u.id === id);
    const normalIndex = normalUsers.findIndex((u) => u.id === id);

    if (freelancerIndex === -1 && normalIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (freelancerIndex !== -1) {
      const deletedUser = users.splice(freelancerIndex, 1)[0];
      await saveUsers(users);
      clearAuthCookie(res);
      return res.status(200).json({
        success: true,
        message: 'Usuário excluído com sucesso',
        user: buildFreelancerResponse(deletedUser)
      });
    }

    const deletedUser = normalUsers.splice(normalIndex, 1)[0];
    await saveNormalUsers(normalUsers);
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: 'Usuário excluído com sucesso',
      user: buildNormalUserResponse(deletedUser)
    });
  } catch (error) {
    sendServerError(res, 'Delete error:', error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

async function startServer() {
  await ensureDataDir();
  app.listen(PORT, () => {
    console.log(`🚀 Nidus Backend running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${dataDir}`);
  });
}

startServer();
