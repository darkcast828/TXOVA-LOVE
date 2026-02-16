import { Match, SwipeAction, UserProfile } from '../types';
import { MOCK_PROFILES } from '../constants';

const LIKES_KEY = 'txova_likes';
const MATCHES_KEY = 'txova_matches';
const HISTORY_KEY = 'txova_swipe_history';

// Simulate some users who already liked "me" to trigger matches during demo
const MOCK_INCOMING_LIKES = ['u2', 'u5', 'u8', 'u10']; 

export const matchService = {
  
  // 1. SWIPE LOGIC
  swipe: (targetProfile: UserProfile, action: 'like' | 'nope' | 'superlike'): Match | null => {
    // Save to history (for Undo)
    const history: SwipeAction[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.push({ targetId: targetProfile.id, action, timestamp: Date.now() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    if (action === 'nope') return null;

    // Save Like
    const myLikes: string[] = JSON.parse(localStorage.getItem(LIKES_KEY) || '[]');
    if (!myLikes.includes(targetProfile.id)) {
      myLikes.push(targetProfile.id);
      localStorage.setItem(LIKES_KEY, JSON.stringify(myLikes));
    }

    // CHECK FOR MATCH
    // Logic: If the other person is in our "Mock Incoming Likes", it's a match!
    if (MOCK_INCOMING_LIKES.includes(targetProfile.id)) {
      const newMatch: Match = {
        id: `m-${Date.now()}`,
        users: ['me', targetProfile.id],
        createdAt: Date.now(),
        isRead: false
      };

      const matches: Match[] = JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]');
      matches.push(newMatch);
      localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
      
      return newMatch;
    }

    return null;
  },

  // 2. UNDO LOGIC (Premium)
  undoLastSwipe: (): SwipeAction | null => {
    const history: SwipeAction[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (history.length === 0) return null;

    const lastAction = history.pop(); // Remove last
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    // If it was a like, remove from likes
    if (lastAction?.action !== 'nope') {
      const myLikes: string[] = JSON.parse(localStorage.getItem(LIKES_KEY) || '[]');
      const updatedLikes = myLikes.filter(id => id !== lastAction?.targetId);
      localStorage.setItem(LIKES_KEY, JSON.stringify(updatedLikes));
      
      // Note: In a real app, we would also need to delete the Match if it happened.
      // For this demo, we assume Undo is immediate before chatting.
    }

    return lastAction || null;
  },

  // 3. GETTERS
  getMatches: (): Match[] => {
    return JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]');
  },

  getSwipedIds: (): string[] => {
    const history: SwipeAction[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return history.map(h => h.targetId);
  },

  // Used for "See who liked you" (Premium)
  getWhoLikedMe: (): UserProfile[] => {
    return MOCK_PROFILES.filter(p => MOCK_INCOMING_LIKES.includes(p.id));
  }
};