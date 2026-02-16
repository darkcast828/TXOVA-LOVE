import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Sparkles } from 'lucide-react';
import { chatService } from '../services/chat';
import { ChatSession } from '../types';
import { matchService } from '../services/match';

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [newMatches, setNewMatches] = useState<any[]>([]);

  useEffect(() => {
    setChats(chatService.getChats());
    
    // Get New Matches (Matches with no messages yet or very recent)
    // For demo, we just get matches that don't have user messages yet
    const allMatches = matchService.getMatches();
    // We would need to fetch user profiles for these matches
    // This is a simplified version
  }, []);

  return (
    <div className="p-4 pt-6 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-heading font-bold text-gray-800">Matches & Mensagens</h2>
      </div>

      {/* New Matches Section (Horizontal Scroll) */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-brand-pink uppercase tracking-wide mb-3 flex items-center gap-1">
           <Sparkles size={12} /> Novos Matches
        </h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
           {chats.length === 0 && (
              <div className="text-sm text-gray-400 italic">Desliza para encontrar matches!</div>
           )}
           {chats.map(chat => (
              <div key={chat.matchId} onClick={() => navigate(`/chat/${chat.userId}`)} className="flex flex-col items-center gap-1 cursor-pointer min-w-[70px]">
                 <div className="w-16 h-16 rounded-full border-2 border-brand-pink p-0.5 relative">
                    <img src={chat.userPhoto} className="w-full h-full rounded-full object-cover" alt={chat.userName} />
                 </div>
                 <span className="text-xs font-semibold text-gray-700 truncate w-full text-center">{chat.userName}</span>
              </div>
           ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input 
          placeholder="Pesquisar..." 
          className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 ring-brand-pink/20 outline-none"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      </div>

      {/* Chat List */}
      <div className="space-y-2 flex-1 overflow-y-auto pb-20">
        {chats.map(chat => (
           <div 
              key={chat.userId} 
              onClick={() => navigate(`/chat/${chat.userId}`)}
              className="flex items-center gap-3 bg-white p-3 rounded-2xl active:bg-gray-50 transition-colors cursor-pointer border border-gray-50"
           >
              <div className="relative">
                <img src={chat.userPhoto} className="w-14 h-14 rounded-full object-cover" alt={chat.userName} />
                {chat.unreadCount > 0 && (
                   <div className="absolute top-0 right-0 w-5 h-5 bg-brand-pink text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {chat.unreadCount}
                   </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`text-base truncate ${chat.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                      {chat.userName}
                    </h4>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(chat.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                 </div>
                 <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {chat.lastMessage}
                 </p>
              </div>
           </div>
        ))}
        
        {chats.length === 0 && (
           <div className="text-center py-12 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <MessageCircle size={32} className="opacity-50" />
              </div>
              <p className="text-sm">Sem conversas.</p>
              <p className="text-xs mt-1">É necessário um Match para conversar.</p>
           </div>
        )}
      </div>
    </div>
  )
};