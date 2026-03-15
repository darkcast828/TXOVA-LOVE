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
    if (!password) {
      throw new Error("Por favor, insira a sua palavra-passe.");
    }

    const sanitizedPhone = phone.replace(/[^0-9]/g, '');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: sanitizedPhone, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer login');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('txova_token', data.token);
      localStorage.setItem('txova_user', JSON.stringify(data.user));

      return {
        ...data.user,
        token: data.token
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro de conexão');
    }
  },

  register: async (data: RegisterData): Promise<AuthUser> => {
    // 0. AGE CHECK
    if (!data.age || data.age < 18) {
      throw new Error("Tens de ter 18 anos ou mais para usar o Txova Love.");
    }

    const sanitizedPhone = data.phone.replace(/[^0-9]/g, '');

    // 2. SAFETY CHECK (TEXT)
    if (!safetyService.analyzeText(data.name)) {
      throw new Error(SAFETY_ERROR_MSG);
    }
    
    if (data.bio && !safetyService.analyzeText(data.bio)) {
      throw new Error(SAFETY_ERROR_MSG);
    }

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

    // Convert photo to base64 or URL (Mock upload)
    // In a real app, upload to S3/Cloudinary first
    const photoUrl = URL.createObjectURL(data.photo);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          phone: sanitizedPhone,
          password: data.password,
          age: data.age,
          province: data.province,
          bio: data.bio,
          photoUrl: photoUrl // Sending blob URL as placeholder
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registar');
      }

      const data = await response.json();

      // Store token
      localStorage.setItem('txova_token', data.token);
      localStorage.setItem('txova_user', JSON.stringify(data.user));

      return {
        ...data.user,
        token: data.token
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro de conexão');
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('txova_token');
  },

  logout: () => {
    localStorage.removeItem('txova_token');
    localStorage.removeItem('txova_user');
    window.location.reload();
  },

  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('txova_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};