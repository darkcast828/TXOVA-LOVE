import { UserProfile, AdContent, SubscriptionPlan, ReportReason, UserGender, CoinPackage, VirtualGift } from './types';

export const PROVINCES = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Niassa',
  'Cabo Delgado'
];

// --- TXCOINS ECONOMY ---

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'starter', coins: 100, price: 199, label: 'Iniciante' },
  { id: 'popular', coins: 500, price: 899, label: 'Popular', isPopular: true },
  { id: 'pro', coins: 1000, price: 1699, label: 'Pro' },
  { id: 'whale', coins: 2000, price: 2999, label: 'Patrão' }
];

export const VIRTUAL_GIFTS: VirtualGift[] = [
  { id: 'rose', name: 'Rosa', icon: '🌹', cost: 10, animationType: 'pop' },
  { id: 'beer', name: '2M Gelada', icon: '🍺', cost: 25, animationType: 'shake' },
  { id: 'heart', name: 'Coração', icon: '❤️', cost: 50, animationType: 'pop' },
  { id: 'capulana', name: 'Capulana', icon: '👘', cost: 100, animationType: 'slide' },
  { id: 'crown', name: 'Rainha', icon: '👑', cost: 250, animationType: 'pop' },
  { id: 'lion', name: 'O Leão', icon: '🦁', cost: 500, animationType: 'shake' },
  { id: 'car', name: 'Txopela', icon: '🛺', cost: 1000, animationType: 'slide' },
  { id: 'ring', name: 'Diamante', icon: '💎', cost: 2000, animationType: 'pop' },
];

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'u1',
    name: 'Neyma',
    age: 23,
    gender: UserGender.FEMALE,
    city: 'Maputo Cidade',
    district: 'Polana Cimento',
    photos: [
      'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=800', 
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800'
    ],
    bio: 'Estudante de arquitetura na UEM. Adoro desenhar, ir à praia na Costa do Sol e ouvir Marrabenta.',
    isVerified: true,
    whatsappNumber: '258840000001',
    profession: 'Estudante',
    height: '1.65m',
    maritalStatus: 'Solteira',
    isOnline: true,
    distanceKm: 2,
    voiceIntro: { url: 'mock', duration: 12 },
    stories: [
      { id: 's1', imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=600', timestamp: Date.now(), isViewed: false }
    ]
  },
  {
    id: 'u2',
    name: 'Dercio',
    age: 27,
    gender: UserGender.MALE,
    city: 'Maputo Província',
    district: 'Matola',
    photos: [
      'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=800'
    ],
    bio: 'Trabalho com TI. Gosto de jogar futebol aos fins de semana e um bom churrasco. Procuro algo sério.',
    isVerified: true,
    whatsappNumber: '258840000002',
    profession: 'Engenheiro de Software',
    height: '1.80m',
    maritalStatus: 'Solteiro',
    isOnline: false,
    lastSeen: 'Há 15 min',
    distanceKm: 15
  },
  {
    id: 'u3',
    name: 'Yara',
    age: 21,
    gender: UserGender.FEMALE,
    city: 'Sofala',
    district: 'Beira',
    photos: [
      'https://images.unsplash.com/photo-1534030347209-7147fd69a3f2?auto=format&fit=crop&q=80&w=800'
    ],
    bio: 'Apaixonada por moda e dança. Se não sabes dançar Kizomba, nem tentes! 😂',
    isVerified: false,
    whatsappNumber: '258840000003',
    profession: 'Modelo',
    height: '1.70m',
    maritalStatus: 'Solteira',
    isOnline: true,
    distanceKm: 850,
    voiceIntro: { url: 'mock', duration: 8 },
    stories: [
      { id: 's2', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600', timestamp: Date.now(), isViewed: false }
    ]
  },
  {
    id: 'u4',
    name: 'Carlos',
    age: 30,
    gender: UserGender.MALE,
    city: 'Inhambane',
    district: 'Tofo',
    photos: [
      'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=800'
    ],
    bio: 'Instrutor de mergulho. Gosto de mar, sol e natureza. Procuro alguém aventureira.',
    isVerified: true,
    whatsappNumber: '258840000004',
    profession: 'Mergulhador',
    height: '1.78m',
    maritalStatus: 'Divorciado',
    isOnline: false,
    distanceKm: 420
  },
  {
    id: 'u5',
    name: 'Jéssica',
    age: 25,
    gender: UserGender.FEMALE,
    city: 'Nampula',
    district: 'Cidade de Nampula',
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800'
    ],
    bio: 'Enfermeira. Gosto de cuidar das pessoas e de ler bons livros. Sinceridade acima de tudo.',
    isVerified: true,
    whatsappNumber: '258840000005',
    profession: 'Enfermeira',
    height: '1.60m',
    maritalStatus: 'Solteira',
    isOnline: true,
    distanceKm: 1400
  },
  // ... keeping other profiles as is, simplified for brevity
  {
    id: 'u10',
    name: 'Sofia',
    age: 26,
    gender: UserGender.FEMALE,
    city: 'Gaza',
    district: 'Xai-Xai',
    photos: [
      'https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&q=80&w=800'
    ],
    bio: 'Empreendedora na área de eventos. Gosto de música ao vivo e boa comida.',
    isVerified: true,
    whatsappNumber: '258840000010',
    profession: 'Empresária',
    height: '1.70m',
    maritalStatus: 'Solteira',
    distanceKm: 210,
    voiceIntro: { url: 'mock', duration: 15 }
  }
];

export const MOCK_ADS: AdContent[] = [];

export const PREMIUM_PLANS: SubscriptionPlan[] = [
  {
    id: 'weekly',
    name: 'Txova Semanal',
    price: 199,
    duration: '7 Dias',
    features: ['Destaque no perfil', 'Ver quem curtiu', 'Sem anúncios']
  },
  {
    id: 'monthly',
    name: 'Txova Mensal',
    price: 500,
    duration: '30 Dias',
    features: ['Tudo do semanal', '3x mais visibilidade', 'Suporte VIP', 'Super Like Diário', 'Desfazer último Swipe']
  }
];

export const REPORT_REASONS: ReportReason[] = [
  { id: 'fake', label: 'Perfil Falso ou Foto Falsa' },
  { id: 'harassment', label: 'Assédio ou Comportamento Abusivo' },
  { id: 'scam', label: 'Tentativa de Golpe / Fraude' },
  { id: 'underage', label: 'Menor de idade' },
  { id: 'inappropriate', label: 'Conteúdo Impróprio' },
];

export const APP_VERSION = '1.3.0 (Economy Update)';