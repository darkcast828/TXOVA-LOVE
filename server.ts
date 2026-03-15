import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock Database
const USERS: any[] = [
  {
    id: 'admin-1',
    email: 'admin@txovalove.com',
    password: '123', // In real app, hash this!
    name: 'Super Admin',
    role: 'superadmin',
    coins: 999999,
    isVerified: true,
    city: 'Maputo',
    createdAt: Date.now()
  },
  {
    id: 'u1',
    email: 'neyma@email.com',
    password: '123',
    name: 'Neyma',
    role: 'user',
    coins: 100,
    isVerified: true,
    city: 'Maputo',
    createdAt: Date.now()
  }
];

const TRANSACTIONS: any[] = [];
const ADS: any[] = [];
const PURCHASE_REQUESTS: any[] = [
  { id: 'req-1', userId: 'u1', userName: 'Neyma', package: 'Popular', coins: 500, amount: 899, method: 'M-Pesa', status: 'pending', timestamp: Date.now() }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/register', (req, res) => {
    const { name, email, password, phone, age, city, province, bio, photoUrl } = req.body;
    
    // Basic validation
    if (!password || !name) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Check if email OR phone already exists
    if (USERS.find(u => u.email === email || u.phone === phone)) {
      return res.status(400).json({ error: 'Utilizador já registado' });
    }

    const newUser = {
      id: `u${Date.now()}`,
      name,
      email: email || '', // Optional if phone is primary
      password, // TODO: Hash password
      phone,
      age,
      city: city || province, // Map province to city if needed
      province,
      bio,
      photoUrl,
      role: 'user',
      coins: 0,
      createdAt: Date.now(),
      isVerified: false
    };

    USERS.push(newUser);
    
    // Return user without password
    const { password: _, ...userSafe } = newUser;
    res.status(201).json({ user: userSafe, token: `mock-token-${newUser.id}` });
  });

  app.post('/api/login', (req, res) => {
    const { email, phone, password } = req.body;
    
    const user = USERS.find(u => 
      ((email && u.email === email) || (phone && u.phone === phone)) && 
      u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe, token: `mock-token-${user.id}` });
  });

  // Middleware to verify token (Mock)
  const verifyToken = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || !token.startsWith('mock-token-')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    
    const userId = token.replace('mock-token-', '');
    const user = USERS.find(u => u.id === userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  };

  // Middleware to verify Admin
  const verifyAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Acesso negado" });
    }
    next();
  };

  app.get('/api/profile', verifyToken, (req: any, res) => {
    const { password: _, ...userSafe } = req.user;
    res.json(userSafe);
  });

  // --- ADMIN ROUTES ---

  app.get('/api/admin/dashboard', verifyToken, verifyAdmin, (req: any, res) => {
    res.json({
      stats: {
        totalUsers: USERS.length,
        activeUsers: USERS.length, // Mock
        totalCoinsSold: USERS.reduce((acc, u) => acc + (u.coins || 0), 0),
        activeAds: ADS.filter(a => a.status === 'active').length,
        pendingRequests: PURCHASE_REQUESTS.filter(r => r.status === 'pending').length,
        estimatedRevenue: PURCHASE_REQUESTS.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.amount, 0)
      }
    });
  });

  app.get('/api/admin/users', verifyToken, verifyAdmin, (req: any, res) => {
    res.json(USERS.map(({ password, ...u }) => u));
  });

  app.put('/api/admin/users/:id/ban', verifyToken, verifyAdmin, (req: any, res) => {
    const { id } = req.params;
    const { reason, duration } = req.body;
    const userIndex = USERS.findIndex(u => u.id === id);
    
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    
    // In a real app, we would update a 'banned' status or table
    USERS[userIndex].isBanned = true;
    USERS[userIndex].banReason = reason;
    USERS[userIndex].banDuration = duration;

    res.json({ message: `User ${id} banned`, user: USERS[userIndex] });
  });

  app.put('/api/admin/users/:id/verify', verifyToken, verifyAdmin, (req: any, res) => {
    const { id } = req.params;
    const user = USERS.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.isVerified = true;
    res.json({ message: 'User verified', user });
  });

  app.put('/api/admin/users/:id/add-coins', verifyToken, verifyAdmin, (req: any, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const user = USERS.find(u => u.id === id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.coins = (user.coins || 0) + parseInt(amount);
    
    // Log transaction
    TRANSACTIONS.push({
      id: `tx-${Date.now()}`,
      userId: id,
      type: 'admin_add',
      amount: parseInt(amount),
      timestamp: Date.now()
    });

    res.json({ message: 'Coins added', newBalance: user.coins });
  });

  app.get('/api/admin/purchase-requests', verifyToken, verifyAdmin, (req: any, res) => {
    res.json(PURCHASE_REQUESTS);
  });

  app.put('/api/admin/purchase-requests/:id/confirm', verifyToken, verifyAdmin, (req: any, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'confirm' or 'reject'
    
    const reqIndex = PURCHASE_REQUESTS.findIndex(r => r.id === id);
    if (reqIndex === -1) return res.status(404).json({ error: 'Request not found' });
    
    const request = PURCHASE_REQUESTS[reqIndex];
    request.status = action === 'confirm' ? 'approved' : 'rejected';

    if (action === 'confirm') {
      const user = USERS.find(u => u.id === request.userId);
      if (user) {
        user.coins = (user.coins || 0) + request.coins;
        TRANSACTIONS.push({
          id: `tx-${Date.now()}`,
          userId: user.id,
          type: 'purchase',
          amount: request.coins,
          description: `Compra: ${request.package}`,
          timestamp: Date.now()
        });
      }
    }

    res.json({ message: `Request ${action}ed`, request });
  });

  app.get('/api/admin/ads', verifyToken, verifyAdmin, (req: any, res) => {
    res.json(ADS);
  });

  // Test Mode Routes
  app.post('/api/admin/test/create-request', verifyToken, verifyAdmin, (req: any, res) => {
    const newReq = {
      id: `req-${Date.now()}`,
      userId: 'u1', // Default to Neyma for test
      userName: 'Neyma (Test)',
      package: 'Popular',
      coins: 500,
      amount: 899,
      method: 'M-Pesa',
      status: 'pending',
      timestamp: Date.now()
    };
    PURCHASE_REQUESTS.push(newReq);
    res.json(newReq);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving (if built)
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
