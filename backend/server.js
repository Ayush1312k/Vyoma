const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Fixes missing fetch in older Node versions (if needed)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

// Set security HTTP headers
app.use(helmet());

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));

// Global Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);

// Auth Rate Limiting
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 login/register requests per hour
  message: { error: 'Too many authentication attempts, please try again after an hour.' }
});
app.use('/api/auth/', authLimiter);

// Code Execution Rate Limiting
const executeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 code executions per minute
  message: { error: 'Execution rate limit exceeded. Please wait a minute before running code again.' }
});

// Input sanitization helper
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>&"'/\\]/g, (char) => {
    const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;', '\\': '&#x5C;' };
    return entities[char] || char;
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required. Set it in your .env file.');
  process.exit(1);
}

// ========== PostgreSQL Database Setup ==========
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'vyoma',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

// Initialize database table for users
let dbConnected = false;

// ========== Local Fallback Persistence (For local dev without DB) ==========
const DB_FILE = path.join(__dirname, 'db.json');
let memoryUsers = {};
let projects = [];
let rooms = {};
let completedProjects = [];
let marketplaceListings = [];
let notifications = [];
let roomUsers = {};
const avatarColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

try {
  if (fs.existsSync(DB_FILE)) {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    memoryUsers = data.users || {};
    projects = data.projects || [];
    rooms = data.rooms || {};
    completedProjects = data.completedProjects || [];
    marketplaceListings = data.marketplaceListings || [];
    notifications = data.notifications || [];
  }
} catch (e) {
  console.error('Failed to load DB file:', e.message);
}

let saveTimeout = null;
function saveDB() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: memoryUsers, projects, rooms, completedProjects, marketplaceListings, notifications }));
    } catch (e) {
      console.error('Failed to save DB file:', e.message);
    }
  }, 1000);
}

// Helper: initialize default files for a room
function createDefaultFiles(title, creatorName, stack) {
  const files = {};
  const stackLower = (stack || []).map(s => s.toLowerCase());
  // Always include a README
  files['README.md'] = { content: `# ${title}\nCreated by ${creatorName} on Vyoma\n`, language: 'markdown' };
  // JS/React
  if (stackLower.some(s => ['react','javascript','node.js','node','js'].includes(s))) {
    files['src/App.js'] = { content: `import React from 'react';\n\nfunction App() {\n  return <div>Hello ${title}</div>;\n}\n\nexport default App;\n`, language: 'javascript' };
    files['src/index.js'] = { content: `import App from './App';\nconsole.log('Starting ${title}...');\n`, language: 'javascript' };
    files['package.json'] = { content: JSON.stringify({ name: title.toLowerCase().replace(/\\s+/g,'-'), version: '1.0.0', main: 'src/index.js' }, null, 2), language: 'json' };
  }
  // Python
  if (stackLower.some(s => ['python','tensorflow','pytorch','flask','django','ai','ml'].includes(s))) {
    files['main.py'] = { content: `# ${title} - Python Backend\nimport os\n\ndef main():\n    print("Hello from ${title}!")\n\nif __name__ == "__main__":\n    main()\n`, language: 'python' };
    files['requirements.txt'] = { content: '# Add your Python dependencies here\n', language: 'plaintext' };
  }
  // HTML/CSS
  if (stackLower.some(s => ['html','css','web','frontend'].includes(s))) {
    files['index.html'] = { content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${title}</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>${title}</h1>\n</body>\n</html>\n`, language: 'html' };
    files['styles.css'] = { content: `/* ${title} Styles */\nbody {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n`, language: 'css' };
  }
  // Flutter/Dart
  if (stackLower.some(s => ['flutter','dart','mobile','android','ios'].includes(s))) {
    files['lib/main.dart'] = { content: `import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(const MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: '${title}',\n      home: Scaffold(\n        appBar: AppBar(title: const Text('${title}')),\n        body: const Center(child: Text('Hello Flutter!')),\n      ),\n    );\n  }\n}\n`, language: 'dart' };
    files['pubspec.yaml'] = { content: `name: ${title.toLowerCase().replace(/\\s+/g,'_')}\ndescription: A Flutter project\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\ndependencies:\n  flutter:\n    sdk: flutter\n`, language: 'yaml' };
  }
  // Go
  if (stackLower.some(s => ['go','golang'].includes(s))) {
    files['main.go'] = { content: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello from ${title}!")\n}\n`, language: 'go' };
  }
  // Rust
  if (stackLower.some(s => ['rust'].includes(s))) {
    files['src/main.rs'] = { content: `fn main() {\n    println!("Hello from ${title}!");\n}\n`, language: 'rust' };
  }
  // Default if nothing matched
  if (Object.keys(files).length === 1) {
    files['main.js'] = { content: `// ${title}\n// Welcome to Vyoma Live Editor\nconsole.log("Hello World!");\n`, language: 'javascript' };
  }
  return files;
}

// ========== Auth Middleware ==========
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
}

// ========== Auth Routes (PostgreSQL + Fallback) ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, accountType, country, city, username } = req.body;
    if (!name || !email || !password || !username) return res.status(400).json({ error: 'All fields required (name, email, password, username)' });
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (!validatePassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (!validateUsername(username)) return res.status(400).json({ error: 'Username must be 3-30 characters, alphanumeric, hyphens, or underscores only' });
    const safeName = sanitizeInput(name.trim().slice(0, 100));
    const safeUsername = username.trim().slice(0, 30);
    
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    if (dbConnected) {
      const { rows: emailRows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (emailRows.length > 0) return res.status(400).json({ error: 'Email already exists' });
      
      // Need to try adding username column if it doesn't exist, but here we just attempt inserting
      try {
        await pool.query(
          'INSERT INTO users (id, name, email, password_hash, provider, accountType, country, city, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [id, safeName, email, passwordHash, 'email', accountType || 'developer', country || '', city || '', safeUsername]
        );
      } catch (err) {
        // Fallback for schema missing username
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255)');
        await pool.query(
          'INSERT INTO users (id, name, email, password_hash, provider, accountType, country, city, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [id, safeName, email, passwordHash, 'email', accountType || 'developer', country || '', city || '', safeUsername]
        );
      }
    } else {
      if (memoryUsers[email]) return res.status(400).json({ error: 'User already exists' });
      const usernameExists = Object.values(memoryUsers).some(u => u.username === username);
      if (usernameExists) return res.status(400).json({ error: 'Username is already taken' });
      
      memoryUsers[email] = { id, name: safeName, email, password_hash: passwordHash, provider: 'email', accountType: accountType || 'developer', country: country || '', city: city || '', username: safeUsername, balance: 1000 };
      saveDB();
    }
    
    const userObj = { id, name: safeName, email, provider: 'email', accountType: accountType || 'developer', country: country || '', city: city || '', username: safeUsername, balance: 1000 };
    const token = jwt.sign({ id: userObj.id, email: userObj.email, accountType: userObj.accountType }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: userObj });
  } catch (err) { console.error('Register error:', err); res.status(500).json({ error: 'An internal error occurred. Please try again.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });
    
    let user;
    if (dbConnected) {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (rows.length === 0) return res.status(400).json({ error: 'User not found' });
      user = rows[0];
    } else {
      user = memoryUsers[email];
      if (!user) return res.status(400).json({ error: 'User not found' });
    }
    
    if (user.provider !== 'email') return res.status(400).json({ error: `Please log in using ${user.provider}` });
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });
    
    const userObj = { id: user.id, name: user.name, email: user.email, provider: user.provider, accountType: user.accountType, country: user.country, city: user.city, username: user.username, balance: user.balance || 1000 };
    const token = jwt.sign({ id: userObj.id, email: userObj.email, accountType: userObj.accountType }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: userObj });
  } catch (err) { console.error('Login error:', err); res.status(500).json({ error: 'An internal error occurred. Please try again.' }); }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { code, redirect_uri: bodyRedirectUri } = req.body;
    if (!code) return res.status(400).json({ error: 'OAuth code required' });
    const redirect_uri = bodyRedirectUri || `${process.env.OAUTH_REDIRECT_BASE_URL || 'http://localhost:5173'}/auth/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, code, grant_type: 'authorization_code', redirect_uri })
    });
    const tokenData = await tokenRes.json();
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    const googleUser = await userRes.json();
    const email = googleUser.email;
    let user = dbConnected ? (await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0] : memoryUsers[email];
    if (!user) {
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 25) + Math.floor(Math.random() * 1000);
      user = { id: uuidv4(), name: googleUser.name, email, provider: 'google', accountType: 'developer', profile_photo: googleUser.picture, username: baseUsername };
      if (dbConnected) {
        try {
          await pool.query('INSERT INTO users (id, name, email, provider, accountType, profile_photo, username) VALUES ($1, $2, $3, $4, $5, $6, $7)', [user.id, user.name, email, 'google', 'developer', user.profile_photo, user.username]);
        } catch {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255)');
          await pool.query('INSERT INTO users (id, name, email, provider, accountType, profile_photo, username) VALUES ($1, $2, $3, $4, $5, $6, $7)', [user.id, user.name, email, 'google', 'developer', user.profile_photo, user.username]);
        }
      }
      else { memoryUsers[email] = user; saveDB(); }
    }
    const token = jwt.sign({ id: user.id, email: user.email, accountType: user.accountType || 'developer' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) { console.error('Google auth error:', err); res.status(500).json({ error: 'Authentication failed. Please try again.' }); }
});

app.post('/api/auth/github', async (req, res) => {
  try {
    const { code, redirect_uri: bodyRedirectUri } = req.body;
    if (!code) return res.status(400).json({ error: 'OAuth code required' });
    
    const redirect_uri = bodyRedirectUri || `${process.env.OAUTH_REDIRECT_BASE_URL || 'http://localhost:5173'}/auth/callback`;
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code, redirect_uri })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) return res.status(400).json({ error: tokenData.error_description });

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${tokenData.access_token}` }
    });
    const githubUser = await userRes.json();
    
    let email = githubUser.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${tokenData.access_token}` }
      });
      const emails = await emailRes.json();
      const primary = emails.find(e => e.primary);
      email = primary ? primary.email : emails[0]?.email;
    }

    if (!email) return res.status(400).json({ error: 'GitHub email not found' });

    let user = dbConnected ? (await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0] : memoryUsers[email];
    if (!user) {
      const baseUsername = githubUser.login.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 25) + Math.floor(Math.random() * 100);
      user = { id: uuidv4(), name: githubUser.name || githubUser.login, email, provider: 'github', accountType: 'developer', profile_photo: githubUser.avatar_url, username: baseUsername, profile: { socials: { github: `https://github.com/${githubUser.login}` } } };
      if (dbConnected) {
        try {
          await pool.query('INSERT INTO users (id, name, email, provider, accountType, profile_photo, username) VALUES ($1, $2, $3, $4, $5, $6, $7)', [user.id, user.name, email, 'github', 'developer', user.profile_photo, user.username]);
        } catch {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255)');
          await pool.query('INSERT INTO users (id, name, email, provider, accountType, profile_photo, username) VALUES ($1, $2, $3, $4, $5, $6, $7)', [user.id, user.name, email, 'github', 'developer', user.profile_photo, user.username]);
        }
      }
      else { memoryUsers[email] = user; saveDB(); }
    }
    const token = jwt.sign({ id: user.id, email: user.email, accountType: user.accountType || 'developer' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) { console.error('GitHub auth error:', err); res.status(500).json({ error: 'Authentication failed. Please try again.' }); }
});

app.get('/api/projects', (req, res) => {
  const activeProjects = projects.filter(p => !p.completed);
  res.json({ projects: activeProjects.map(p => ({ ...p, password: undefined, isProtected: !!p.password })) });
});

app.get('/api/completed-projects', (req, res) => {
  res.json({ projects: completedProjects });
});

app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (projects[idx].creator !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
  projects.splice(idx, 1);
  delete rooms[req.params.id];
  saveDB();
  res.json({ success: true });
});

app.post('/api/projects/:id/complete', authMiddleware, (req, res) => {
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (projects[idx].creator !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
  const { github, live, contributors } = req.body;
  const completed = { ...projects[idx], completed: true, github, live, contributors, completedAt: new Date().toISOString() };
  completedProjects.unshift(completed);
  projects.splice(idx, 1);
  delete rooms[req.params.id];
  saveDB();
  res.json({ success: true });
});

app.post('/api/projects', authMiddleware, (req, res) => {
  const { title, stack, roles, maxUsers, duration, password } = req.body;
  const id = 'proj-' + uuidv4().slice(0, 8);
  const project = { id, title, roles: roles || [], stack: stack || [], users: 1, maxUsers: maxUsers || 5, duration: duration || 'A few hours', creator: req.user.email, creatorName: req.user.name, password };
  projects.unshift(project);
  rooms[id] = { messages: [], files: createDefaultFiles(title, req.user.name, stack), github: null, deployment: null, visitors: [req.user.email], settings: { theme: 'vs-dark', fontSize: 14, tabSize: 2, wordWrap: true } };
  saveDB();
  res.json({ project });
});

app.get('/api/rooms/:id/files', authMiddleware, (req, res) => {
  const room = rooms[req.params.id];
  if (!room) return res.status(404).json({ error: 'Not found' });
  res.json({ files: room.files });
});

app.post('/api/rooms/:id/files', authMiddleware, (req, res) => {
  const room = rooms[req.params.id];
  if (!room) return res.status(404).json({ error: 'Not found' });
  const { filename, content, language } = req.body;
  if (!filename || typeof filename !== 'string') return res.status(400).json({ error: 'Invalid filename' });
  
  // Security path traversal check
  if (filename.includes('..') || filename.includes('\0') || path.isAbsolute(filename)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  // Storage limits: max file size (100KB), max files per room (50), total storage (2MB)
  if (typeof content === 'string' && content.length > 100 * 1024) {
    return res.status(400).json({ error: 'File size exceeds limit of 100KB' });
  }

  const existingFiles = Object.keys(room.files || {});
  if (!room.files[filename] && existingFiles.length >= 50) {
    return res.status(400).json({ error: 'Maximum file limit (50 files) reached for this room' });
  }

  let totalSize = 0;
  for (const key of existingFiles) {
    if (key !== filename) totalSize += (room.files[key]?.content?.length || 0);
  }
  totalSize += (content?.length || 0);
  if (totalSize > 2 * 1024 * 1024) {
    return res.status(400).json({ error: 'Total room file storage limit (2MB) exceeded' });
  }

  room.files[filename] = { content: content || '', language: language || 'plaintext' };
  saveDB();
  res.json({ success: true });
});

// Code execution endpoint - Sandboxed for Node.js and Python
app.post('/api/execute', authMiddleware, executeLimiter, (req, res) => {
  const { code, language, filename } = req.body;
  if (!code || !language) return res.status(400).json({ error: 'Code and language required' });
  if (typeof code !== 'string' || code.length > 50000) {
    return res.status(400).json({ error: 'Code payload exceeds size limit (max 50KB)' });
  }

  const normalizedLang = language.toLowerCase().trim();
  if (normalizedLang !== 'javascript' && normalizedLang !== 'python') {
    return res.status(400).json({
      success: false,
      output: [`Execution for language '${sanitizeInput(language)}' is disabled for security reasons. Only JavaScript and Python are supported.`]
    });
  }
  
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const safeName = path.basename(filename || 'script').replace(/[^a-zA-Z0-9_.-]/g, '');
  const tempFile = path.join(tempDir, `exec_${uuidv4().slice(0, 8)}_${safeName}`);
  
  let command = '';
  if (normalizedLang === 'javascript') command = `node "${tempFile}"`;
  else if (normalizedLang === 'python') command = `python "${tempFile}"`;

  try {
    fs.writeFileSync(tempFile, code, 'utf-8');
    const stdout = execSync(command, {
      timeout: 3000,
      maxBuffer: 64 * 1024,
      encoding: 'utf-8',
      windowsHide: true
    });
    res.json({ success: true, output: stdout.split('\n').filter(Boolean) });
  } catch (error) {
    const stderrMsg = error.stderr ? error.stderr.toString('utf-8') : (error.message || 'Execution failed');
    const stdoutMsg = error.stdout ? error.stdout.toString('utf-8') : '';
    const outputLines = stderrMsg.split('\n').filter(Boolean).map(l => `[ERROR] ${l}`)
      .concat(stdoutMsg.split('\n').filter(Boolean));
    res.json({ success: false, output: outputLines.length ? outputLines : ['[ERROR] Execution failed or timed out'] });
  } finally {
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (unlinkErr) {
        console.error(`[TEMP CLEANUP ERROR] Failed to delete temp file ${tempFile}:`, unlinkErr.message);
      }
    }
  }
});

// ========== Hiring & Notifications ==========

app.get('/api/notifications', authMiddleware, (req, res) => {
  const userNotifs = notifications.filter(n => n.recipientEmail === req.user.email);
  res.json({ notifications: userNotifs });
});

app.post('/api/notifications/read', authMiddleware, (req, res) => {
  notifications.forEach(n => {
    if (n.recipientEmail === req.user.email) n.read = true;
  });
  saveDB();
  res.json({ success: true });
});

app.post('/api/hire', authMiddleware, async (req, res) => {
  const { targetUserId, type } = req.body; // type = 'job' or 'freelance'
  if (req.user.accountType !== 'employer') return res.status(403).json({ error: 'Only employers can hire talent.' });
  
  let targetUser = Object.values(memoryUsers).find(u => u.id === targetUserId);
  if (dbConnected && !targetUser) {
    const dbRes = await pool.query('SELECT * FROM users WHERE id=$1', [targetUserId]);
    targetUser = dbRes.rows[0];
  }
  if (!targetUser) return res.status(404).json({ error: 'User not found' });
  
  if (req.user.id === targetUserId || req.user.email === targetUser.email) {
    return res.status(400).json({ error: 'You cannot hire yourself.' });
  }
  
  // Create in-app notification
  const notif = {
    id: uuidv4(),
    recipientEmail: targetUser.email,
    senderName: req.user.name,
    senderEmail: req.user.email,
    type,
    message: `${req.user.name} has requested to hire you for a ${type === 'job' ? 'full-time job' : 'freelance project'}.`,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(notif);
  saveDB();

  // Send email if not github provider
  if (targetUser.provider !== 'github') {
    try {
      let transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 587,
        secure: false, // TLS
        auth: { 
          user: process.env.RESEND_SMTP_USER, 
          pass: process.env.RESEND_SMTP_PASS 
        }
      });
      await transporter.sendMail({
        from: '"Vyoma Network" <notifications@vyoma.com>',
        to: targetUser.email,
        subject: 'Vyoma Hire Request',
        html: `<h3>New Hire Request</h3><p>${notif.message}</p><p>Please log in to Vyoma to respond.</p>`
      });
      console.log(`[EMAIL SENT] To: ${targetUser.email} | Subject: Vyoma Hire Request`);
    } catch (e) {
      console.error('Failed to send email:', e.message);
    }
  }

  res.json({ success: true });
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
  const { name, role, status, country, city, socials, projects, accountType } = req.body;
  const email = req.user.email;
  const profileData = { role, status, country, city, socials, projects };
  if (dbConnected) {
    await pool.query('UPDATE users SET name=$1, country=$2, city=$3 WHERE email=$4', [name, country, city, email]).catch(()=>{});
  }
  if (memoryUsers[email]) {
    if (name) memoryUsers[email].name = name;
    if (country) memoryUsers[email].country = country;
    if (city) memoryUsers[email].city = city;
    if (accountType) memoryUsers[email].accountType = accountType;
    memoryUsers[email].profile = profileData;
    saveDB();
  }
  
  const updatedUser = memoryUsers[email] || req.user;
  const newAccountType = accountType || updatedUser.accountType;
  const newToken = jwt.sign({ id: updatedUser.id, email: updatedUser.email, accountType: newAccountType }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ success: true, profile: profileData, accountType: newAccountType, token: newToken });
});

app.get('/api/users/profile', authMiddleware, async (req, res) => {
  const email = req.user.email;
  const name = req.user.name;
  const user = memoryUsers[email] || (dbConnected ? (await pool.query('SELECT * FROM users WHERE email=$1', [email])).rows[0] : null);
  if (!user) return res.status(404).json({ error: 'Not found' });
  
  const userProfile = user.profile || {};
  
  const userLiveProjects = projects.filter(p => p.creator === email);
  const userCompletedProjects = completedProjects.filter(p => p.creator === email || (p.contributors && p.contributors.some(c => c.name === name)));
  
  const purchasedProjects = marketplaceListings.filter(l => l.status === 'sold' && (l.buyerEmail === email || l.buyer === email)).map(l => ({
    name: l.title,
    price: l.currentBid || l.price,
    date: l.soldAt || l.createdAt,
    seller: l.creatorName,
    type: l.listingType
  }));

  const soldProjects = marketplaceListings.filter(l => l.status === 'sold' && l.creatorEmail === email).map(l => ({
    name: l.title,
    price: l.currentBid || l.price,
    date: l.soldAt || l.createdAt,
    buyer: l.buyerName || l.buyer || 'No one',
    type: l.listingType
  }));
  
  res.json({
    ...userProfile,
    liveProjects: userLiveProjects.map(p => ({
      name: p.title,
      role: p.creator === email ? 'Creator' : 'Contributor',
      roomId: p.id,
      techStack: p.stack
    })),
    completedProjects: userCompletedProjects.map(p => ({
      name: p.title,
      role: p.creator === email ? 'Creator' : 'Contributor',
      roomId: p.id,
      techStack: p.stack,
      status: p.status || 'Completed'
    })),
    purchasedProjects,
    soldProjects
  });
});

app.get('/api/users/stats', authMiddleware, (req, res) => {
  const email = req.user.email;
  const name = req.user.name;
  let projectsCompleted = 0;
  completedProjects.forEach(p => {
    if (p.creator === email || (p.contributors && p.contributors.some(c => c.name === name))) {
      projectsCompleted++;
    }
  });
  const roomsJoined = memoryUsers[email]?.roomsJoined || 0;
  const reputationScore = Math.min((projectsCompleted * 50) + (roomsJoined * 5), 9999);
  res.json({ projectsCompleted, roomsJoined, reputationScore });
});

app.get('/api/users/discover', authMiddleware, (req, res) => {
  const allUsers = Object.values(memoryUsers).filter(u => u.name && u.email).map(u => {
    const { password_hash, ...safeUser } = u;
    return safeUser;
  });
  res.json({ users: allUsers });
});

// ========== Marketplace Routes ==========
app.get('/api/marketplace', (req, res) => {
  const now = new Date();
  let changed = false;
  marketplaceListings.forEach(l => {
    if (l.listingType === 'auction' && l.status === 'active') {
      if (!l.expiresAt) {
        l.expiresAt = new Date(new Date(l.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
        changed = true;
      }
      if (new Date(l.expiresAt) <= now) {
        l.status = 'sold';
        l.buyerEmail = l.highestBidderEmail || null;
        l.buyerName = l.highestBidder || null;
        l.soldAt = new Date().toISOString();
        changed = true;
      }
    }
  });
  if (changed) saveDB();
  res.json({ listings: marketplaceListings });
});

app.post('/api/marketplace/list', authMiddleware, (req, res) => {
  const { title, description, images, link, type, listingType, price, teamMembers } = req.body;
  if (!title || !description || !listingType || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newListing = {
    id: 'listing_' + Date.now(),
    title,
    description,
    images: images || [],
    link,
    type, // 'personal' or 'team'
    listingType, // 'sale' or 'auction'
    price: Number(price), // Fixed price OR starting bid
    currentBid: listingType === 'auction' ? Number(price) : null,
    highestBidder: null,
    creatorEmail: req.user.email,
    creatorName: req.user.name,
    teamMembers: type === 'team' ? (teamMembers || []) : [], // array of { name, email }
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: listingType === 'auction' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null
  };

  marketplaceListings.unshift(newListing);
  saveDB();
  res.json({ success: true, listing: newListing });
});

app.post('/api/marketplace/:id/buy', authMiddleware, (req, res) => {
  const listing = marketplaceListings.find(l => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.status !== 'active') return res.status(400).json({ error: 'Listing is not active' });
  if (listing.listingType !== 'sale') return res.status(400).json({ error: 'This is an auction, please place a bid.' });
  if (listing.creatorEmail === req.user.email) return res.status(400).json({ error: 'You cannot buy your own listing' });

  listing.status = 'sold';
  listing.buyerEmail = req.user.email;
  listing.buyerName = req.user.name;
  listing.soldAt = new Date().toISOString();

  saveDB();
  res.json({ success: true, listing });
});

app.post('/api/marketplace/:id/bid', authMiddleware, (req, res) => {
  const { bidAmount } = req.body;
  const listing = marketplaceListings.find(l => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.status !== 'active') return res.status(400).json({ error: 'Listing is not active' });
  if (listing.listingType !== 'auction') return res.status(400).json({ error: 'This is a fixed price sale.' });
  if (listing.creatorEmail === req.user.email) return res.status(400).json({ error: 'You cannot bid on your own listing' });

  const bid = Number(bidAmount);
  if (isNaN(bid) || bid <= listing.currentBid) return res.status(400).json({ error: 'Bid must be higher than the current bid' });

  listing.currentBid = bid;
  listing.highestBidder = req.user.name;
  listing.highestBidderEmail = req.user.email;
  
  saveDB();
  res.json({ success: true, currentBid: bid });
});

app.delete('/api/marketplace/:id', authMiddleware, (req, res) => {
  const idx = marketplaceListings.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Listing not found' });
  if (marketplaceListings[idx].creatorEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You can only delete your own listings.' });
  }
  marketplaceListings.splice(idx, 1);
  saveDB();
  res.json({ success: true });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ALLOWED_ORIGINS, credentials: true } });

io.on('connection', (socket) => {
  socket.on('join_room', ({ roomId, userObj }) => {
    socket.join(roomId);
    
    if (userObj?.email && memoryUsers[userObj.email]) {
      memoryUsers[userObj.email].roomsJoined = (memoryUsers[userObj.email].roomsJoined || 0) + 1;
      saveDB();
    }
    
    if (!roomUsers[roomId]) roomUsers[roomId] = [];
    const name = userObj?.name || 'Anonymous';
    const email = userObj?.email || '';
    const color = getAvatarColor(name);
    
    roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
    roomUsers[roomId].push({ socketId: socket.id, name, email, color });
    io.to(roomId).emit('room_users_update', roomUsers[roomId]);

    if (rooms[roomId]) {
      socket.emit('files_sync', rooms[roomId].files);
      socket.emit('chat_history', rooms[roomId].messages);
    }
  });

  socket.on('disconnect', () => {
    Object.keys(roomUsers).forEach(roomId => {
      const users = roomUsers[roomId];
      const idx = users.findIndex(u => u.socketId === socket.id);
      if (idx !== -1) {
        users.splice(idx, 1);
        io.to(roomId).emit('room_users_update', users);
        io.to(roomId).emit('cursor_remove', { socketId: socket.id });
      }
    });
  });

  socket.on('cursor_move', (data) => {
    socket.to(data.roomId).emit('cursor_update', {
      socketId: socket.id,
      ...data
    });
  });
  socket.on('file_content_change', ({ roomId, filename, content }) => {
    if (filename && (filename.includes('..') || filename.includes('\0') || path.isAbsolute(filename))) return;
    if (typeof content === 'string' && content.length > 100 * 1024) return;
    if (rooms[roomId]?.files[filename]) {
      rooms[roomId].files[filename].content = content;
      socket.to(roomId).emit('file_content_update', { filename, content });
      saveDB();
    }
  });
  socket.on('send_message', ({ roomId, message, sender }) => {
    if (rooms[roomId]) {
      const msg = { id: Date.now(), text: message, sender, time: new Date().toLocaleTimeString() };
      rooms[roomId].messages.push(msg);
      io.to(roomId).emit('receive_message', msg);
      saveDB();
    }
  });

  // WebRTC Voice Signaling
  socket.on('voice-offer', (data) => {
    socket.to(data.to).emit('voice-offer', {
      from: socket.id,
      offer: data.offer,
      name: data.name
    });
  });
  
  socket.on('voice-answer', (data) => {
    socket.to(data.to).emit('voice-answer', {
      from: socket.id,
      answer: data.answer
    });
  });
  
  socket.on('voice-ice-candidate', (data) => {
    socket.to(data.to).emit('voice-ice-candidate', {
      from: socket.id,
      candidate: data.candidate
    });
  });
  
  socket.on('voice-user-joined', (data) => {
    socket.to(data.roomId).emit('voice-user-joined', { socketId: socket.id, name: data.name });
  });
  
  socket.on('voice-user-left', (data) => {
    socket.to(data.roomId).emit('voice-user-left', { socketId: socket.id });
  });
});

async function initPostgresSchema(pgPool) {
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        provider VARCHAR(50) DEFAULT 'email',
        accountType VARCHAR(50) DEFAULT 'developer',
        country VARCHAR(100),
        city VARCHAR(100),
        username VARCHAR(255) UNIQUE,
        profile_photo TEXT,
        balance NUMERIC DEFAULT 1000,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        roles JSONB DEFAULT '[]',
        stack JSONB DEFAULT '[]',
        users INT DEFAULT 1,
        maxUsers INT DEFAULT 5,
        duration VARCHAR(100),
        creator VARCHAR(255) NOT NULL,
        creatorName VARCHAR(255),
        password VARCHAR(255),
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(255) PRIMARY KEY,
        messages JSONB DEFAULT '[]',
        files JSONB DEFAULT '{}',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS marketplace_listings (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        images JSONB DEFAULT '[]',
        link VARCHAR(500),
        type VARCHAR(50),
        listing_type VARCHAR(50),
        price NUMERIC,
        current_bid NUMERIC,
        highest_bidder VARCHAR(255),
        creator_email VARCHAR(255),
        creator_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        recipient_email VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255),
        sender_email VARCHAR(255),
        type VARCHAR(50),
        message TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DB] PostgreSQL schema verified/initialized successfully.');
  } catch (err) {
    console.error('[DB SCHEMA ERROR] Failed to initialize PostgreSQL tables:', err.message);
  }
}

async function startServer() {
  if (process.env.NODE_ENV === 'production' && !process.env.PGHOST) {
    console.error("FATAL: PostgreSQL env vars are required in production. Set PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT in your .env file.");
    process.exit(1);
  }

  try {
    await pool.query('SELECT 1');
    dbConnected = true;
    console.log('[DB] PostgreSQL connected successfully.');
    await initPostgresSchema(pool);
  } catch {
    dbConnected = false;
    if (process.env.NODE_ENV === 'production') {
      console.error("FATAL: Failed to connect to PostgreSQL in production!");
      process.exit(1);
    }
    console.warn('[DB WARNING] PostgreSQL connection failed! Falling back to in-memory/JSON storage.');
  }

  // Clean up temp directory on startup
  const tempDir = path.join(__dirname, 'temp');
  if (fs.existsSync(tempDir)) {
    try {
      fs.readdirSync(tempDir).forEach(f => fs.unlinkSync(path.join(tempDir, f)));
    } catch (e) { console.warn('Failed to clean temp directory:', e.message); }
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`[SERVER] Vyoma backend running on port ${PORT}`));
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
  saveDB();
  console.log('[SHUTDOWN] Closing socket connections...');
  io.close(() => {
    console.log('[SHUTDOWN] Sockets closed. Closing HTTP server...');
    server.close(() => {
      console.log('[SHUTDOWN] HTTP server closed. Closing Postgres pool...');
      pool.end();
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('[SERVER] SIGINT received. Shutting down...');
  saveDB();
  console.log('[SHUTDOWN] Closing socket connections...');
  io.close(() => {
    console.log('[SHUTDOWN] Sockets closed. Closing HTTP server...');
    server.close(() => {
      console.log('[SHUTDOWN] HTTP server closed. Closing Postgres pool...');
      pool.end();
      process.exit(0);
    });
  });
});

startServer();
