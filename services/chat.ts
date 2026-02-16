import { Message, ChatSession, VirtualGift } from '../types';
import { MOCK_PROFILES } from '../constants';
import { matchService } from './match';

let MOCK_MESSAGES: Record<string, Message[]> = {
  // Pre-seeded message for demo match
  'u2': [
    { id: 'm1', text: 'Parabéns pelo Match! 🎉', senderId: 'system', timestamp: Date.now() - 10000, isRead: false, type: 'text' }
  ]
};

export const chatService = {
  getChats: (): ChatSession[] => {
    const matches = matchService.getMatches();
    const sessions: ChatSession[] = [];
    
    matches.forEach(match => {
      const otherUserId = match.users.find(id => id !== 'me');
      if (!otherUserId) return;

      const user = MOCK_PROFILES.find(p => p.id === otherUserId);
      if (!user) return;

      const msgs = MOCK_MESSAGES[otherUserId] || [];
      // Handle last message preview if it's a gift
      let lastMsgText = "Começa a conversa!";
      let lastMsgTime = match.createdAt;
      
      if (msgs.length > 0) {
          const last = msgs[msgs.length - 1];
          lastMsgTime = last.timestamp;
          lastMsgText = last.type === 'gift' ? `🎁 Enviou ${last.giftData?.name}` : last.text;
      }

      sessions.push({
        userId: user.id,
        userName: user.name,
        userPhoto: user.photos[0],
        lastMessage: lastMsgText,
        lastMessageTime: lastMsgTime,
        unreadCount: msgs.filter(m => !m.isRead && m.senderId !== 'me' && m.senderId !== 'system').length,
        matchId: match.id,
        isOnline: user.isOnline
      });
    });

    return sessions.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  },

  getMessages: (userId: string): Message[] => {
    const matches = matchService.getMatches();
    const isMatched = matches.some(m => m.users.includes(userId));
    if (!isMatched) return [];
    return MOCK_MESSAGES[userId] || [];
  },

  sendMessage: (userId: string, content: string, type: 'text' | 'gift' = 'text', giftData?: VirtualGift) => {
    const matches = matchService.getMatches();
    const isMatched = matches.some(m => m.users.includes(userId));
    if (!isMatched) return;

    if (!MOCK_MESSAGES[userId]) MOCK_MESSAGES[userId] = [];

    const newMessage: Message = {
      id: Date.now().toString(),
      text: content,
      senderId: 'me',
      timestamp: Date.now(),
      isRead: true,
      type,
      giftData
    };

    MOCK_MESSAGES[userId].push(newMessage);
    
    // Reply logic
    if (type === 'gift') {
        setTimeout(() => {
            MOCK_MESSAGES[userId].push({
                id: (Date.now() + 1).toString(),
                text: "Uau! Obrigado pelo presente! 😍",
                senderId: userId,
                timestamp: Date.now(),
                isRead: false,
                type: 'text'
            });
        }, 2000);
    }
  },

  markAsRead: (userId: string) => {
    if (MOCK_MESSAGES[userId]) {
      MOCK_MESSAGES[userId].forEach(m => {
        if (m.senderId !== 'me') m.isRead = true;
      });
    }
  }
};