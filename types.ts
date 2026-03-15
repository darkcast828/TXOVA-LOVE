export enum UserGender {
  MALE = 'Homem',
  FEMALE = 'Mulher'
}

export enum AccountType {
  FREE = 'Free',
  PREMIUM = 'Premium',
  BUSINESS = 'Business'
}

export interface Story {
  id: string;
  imageUrl: string;
  timestamp: number;
  isViewed: boolean;
}

export interface VoiceIntro {
  url: string; // In a real app, this is an audio URL
  duration: number; // Seconds
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: UserGender;
  city: string;
  district?: string;
  photos: string[];
  bio: string;
  whatsappNumber?: string;
  isVerified: boolean;
  distanceKm?: number;
  profession?: string;
  height?: string;
  maritalStatus?: string;
  isOnline?: boolean;
  lastSeen?: string;
  stories?: Story[];
  voiceIntro?: VoiceIntro; // New: Audio Profile
  isInvisible?: boolean; // New: Invisible Mode
  walletBalance?: number; // New: TxCoins
}

export type AdPlanType = 'basic' | 'highlight' | 'top';

export interface AdContent {
  id: string;
  userId: string;
  type: 'BUSINESS' | 'PROMOTED_PROFILE';
  plan: AdPlanType;
  title: string;
  description: string;
  imageUrl: string;
  whatsappNumber: string;
  ctaLink: string;
  status: 'active' | 'expired' | 'pending_payment';
  createdAt: number;
  expiresAt: number;
  views: number;
  clicks: number;
}

export type FeedItem = 
  | { type: 'profile'; data: UserProfile }
  | { type: 'ad'; data: AdContent };

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

export interface ReportReason {
  id: string;
  label: string;
}

// --- NEW ECONOMY TYPES ---

export interface CoinPackage {
  id: string;
  coins: number;
  price: number; // MZN
  label?: string;
  isPopular?: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'moderator';
}

export interface AdCampaign {
  id: string;
  userId: string;
  type: 'boost_profile' | 'product_ad';
  durationDays: number;
  cost: number;
  status: 'active' | 'expired';
  createdAt: number;
  expiresAt: number;
  content?: {
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
  };
}

export interface VirtualGift {
  id: string;
  name: string;
  icon: string; // Emoji or Image URL
  cost: number; // TxCoins
  animationType: 'pop' | 'slide' | 'shake';
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'gift_sent' | 'gift_received' | 'bonus';
  amount: number;
  description: string;
  timestamp: number;
}

// --- CHAT UPDATES ---

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  isRead: boolean;
  type: 'text' | 'gift'; // New: Support gifts
  giftData?: VirtualGift; // New: Gift details
}

export interface ChatSession {
  userId: string;
  userName: string;
  userPhoto: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  matchId: string;
  isOnline?: boolean;
}

export interface Match {
  id: string;
  users: [string, string];
  createdAt: number;
  isRead: boolean;
}

export interface SwipeAction {
  targetId: string;
  action: 'like' | 'nope' | 'superlike';
  timestamp: number;
}