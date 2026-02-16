import { safetyService, SAFETY_ERROR_MSG } from './safety';

// --- SECURITY SIMULATION UTILS ---
// In a real backend, use 'bcrypt' or 'argon2'.
// Here we simulate hashing to ensure we NEVER store plain text passwords.
const simulateBcryptHash = (password: string): string => {
  // Simple obfuscation for demo purposes (Base64 + Salt)
  // REAL APP MUST USE: await bcrypt.hash(password, 10)
  return `$$bcrypt_v1$$${btoa(password).split('').reverse().join('')}$$secure`;
};

const simulateBcryptCompare = (plainText: string, hash: string): boolean => {
  // REAL APP MUST USE: await bcrypt.compare(plainText, hash)
  const computedHash = simulateBcryptHash(plainText);
  return computedHash === hash;
};

// --- DATABASE SIMULATION ---
const DB_KEY = 'txova_users_db_v1';

interface StoredUser {
  id: string;
  name: string;
  phone: string;
  passwordHash: string; // Storing HASH, not password
  province: string;
  age: number;
  photoUrl: string; // Blob URL or string
  bio?: string;
  createdAt: number;
}

const getDatabase = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveToDatabase = (user: StoredUser) => {
  const db = getDatabase();
  db.push(user);
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- TYPES ---

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  token: string;
  province?: string;
  photoUrl?: string;
  bio?: string;
  age?: number;
}

export interface RegisterData {
  name: string;
  age: number;
  phone: string;
  password: string;
  province: string;
  photo: File;
  bio?: string;
}

export const authService = {
  login: async (phone: string, password?: string): Promise<AuthUser> => {
    // 1. Simulate Network Latency (Anti-timing attack in real scenarios)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 2. Input Sanitization
    const sanitizedPhone = phone.replace(/[^0-9]/g, '');
    
    if (!password) {
      throw new Error("Por favor, insira a sua palavra-passe.");
    }

    // 3. Database Lookup (Backend Logic)
    const db = getDatabase();
    const foundUser = db.find(u => u.phone === sanitizedPhone);

    // 4. SECURITY CHECK
    // Logic: If user not found OR password doesn't match hash -> FAIL
    // We use a generic error message to prevent User Enumeration
    
    let passwordIsValid = false;
    if (foundUser) {
      passwordIsValid = simulateBcryptCompare(password, foundUser.passwordHash);
    }

    if (!foundUser || !passwordIsValid) {
      // Return GENERIC error. Do not say "User not found" or "Wrong password".
      throw new Error("Número de telemóvel ou palavra-passe incorretos.");
    }

    // 5. Generate Session (Success)
    // In a real app, verify 2FA here if enabled.
    return {
      id: foundUser.id,
      name: foundUser.name,
      phone: foundUser.phone,
      token: `jwt-mock-${Date.now()}-${Math.random()}`, // Mock JWT
      province: foundUser.province,
      age: foundUser.age,
      photoUrl: foundUser.photoUrl
    };
  },

  register: async (data: RegisterData): Promise<AuthUser> => {
    // 0. AGE CHECK
    if (!data.age || data.age < 18) {
      throw new Error("Tens de ter 18 anos ou mais para usar o Txova Love.");
    }

    const sanitizedPhone = data.phone.replace(/[^0-9]/g, '');

    // 1. DUPLICATE CHECK
    const db = getDatabase();
    if (db.some(u => u.phone === sanitizedPhone)) {
      throw new Error("Este número já está registado. Tente fazer login.");
    }

    // 2. SAFETY CHECK (TEXT)
    if (!safetyService.analyzeText(data.name)) {
      throw new Error(SAFETY_ERROR_MSG);
    }
    
    if (data.bio && !safetyService.analyzeText(data.bio)) {
      throw new Error(SAFETY_ERROR_MSG);
    }

    // Simulate API upload delay (Uploading + AI Analysis)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. SAFETY CHECK (IMAGE)
    const isImageSafe = await safetyService.analyzeImage(data.photo);
    if (!isImageSafe) {
       console.error("User attempted to upload explicit content. Flagging account.");
       throw new Error(SAFETY_ERROR_MSG);
    }

    // 4. Validate Inputs
    if (!data.name || !data.password || !data.photo || !data.province) {
      throw new Error("Dados incompletos.");
    }

    // 5. HASH PASSWORD (CRITICAL STEP)
    // Never store plain password
    const passwordHash = simulateBcryptHash(data.password);

    // 6. Create User Record
    const newUser: StoredUser = {
      id: `u-${Date.now()}`,
      name: data.name,
      phone: sanitizedPhone,
      passwordHash: passwordHash, // Store Hash
      province: data.province,
      age: data.age,
      photoUrl: URL.createObjectURL(data.photo), // Mock URL for local preview
      createdAt: Date.now()
    };

    // 7. Save to DB
    saveToDatabase(newUser);

    return {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      token: `jwt-mock-${Date.now()}`,
      province: newUser.province,
      age: newUser.age,
      photoUrl: newUser.photoUrl
    };
  },

  isAuthenticated: (): boolean => {
    // Check if token exists and is valid (mock)
    return !!localStorage.getItem('txova_token');
  },

  logout: () => {
    localStorage.removeItem('txova_token');
    // Force reload to ensure App state is reset and prevent router loops
    window.location.reload();
  }
};