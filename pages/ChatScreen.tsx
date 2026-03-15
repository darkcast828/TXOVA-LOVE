import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, ShieldCheck, Home, Flag, Ban, Trash2, Gift, Coins } from 'lucide-react';
import { chatService } from '../services/chat';
import { walletService } from '../services/wallet';
import { Message, VirtualGift } from '../types';
import { MOCK_PROFILES, REPORT_REASONS, VIRTUAL_GIFTS } from '../constants';
import { Modal } from '../components/ui';
import { GiftAnimation } from '../components/GiftAnimation';

export const ChatScreen: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  
  // Gift State
  const [isGiftModalOpen, setGiftModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [currentGift, setCurrentGift] = useState<VirtualGift | null>(null);
  const [giftSender, setGiftSender] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastProcessedMessageIdRef = useRef<string | null>(null);
  const isInitialLoad = useRef(true);
  
  const user = MOCK_PROFILES.find(p => p.id === userId);

  const loadMessages = () => {
    if (userId) {
      const msgs = chatService.getMessages(userId);
      setMessages([...msgs]); 
      chatService.markAsRead(userId);

      // Check for new incoming gifts
      if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        
        // Skip animation on initial load
        if (isInitialLoad.current) {
            lastProcessedMessageIdRef.current = lastMsg.id;
            isInitialLoad.current = false;
            return;
        }
        
        // Only process if it's a new message
        if (lastMsg.id !== lastProcessedMessageIdRef.current) {
            lastProcessedMessageIdRef.current = lastMsg.id;
            
            // If it's a gift from the OTHER user (not me)
            if (lastMsg.type === 'gift' && lastMsg.giftData && lastMsg.senderId !== 'me') {
                setGiftSender(user?.name || 'Alguém');
                setCurrentGift(lastMsg.giftData);
            }
        }
      } else {
          isInitialLoad.current = false;
      }
    }
  };

  useEffect(() => {
    loadMessages();
    setWalletBalance(walletService.getBalance());
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!inputText.trim() || !userId) return;
    chatService.sendMessage(userId, inputText, 'text');
    setInputText('');
    loadMessages();
  };

  const handleSendGift = (gift: VirtualGift) => {
      // Check Balance
      if (walletBalance < gift.cost) {
          if(window.confirm(`Saldo insuficiente (${walletBalance} TxCoins). O presente custa ${gift.cost}. Deseja recarregar?`)) {
              navigate('/wallet');
          }
          return;
      }

      // Spend Coins
      const success = walletService.spendCoins(gift.cost, `Presente para ${user?.name}: ${gift.name}`);
      
      if (success) {
          // Send Message
          chatService.sendMessage(userId!, `Enviou ${gift.name}`, 'gift', gift);
          setWalletBalance(walletService.getBalance()); // Update local balance
          setGiftModalOpen(false);
          
          // Trigger Animation for Sender
          setGiftSender('Tu');
          setCurrentGift(gift);
          
          loadMessages();
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAction = (action: 'report' | 'block' | 'clear') => {
    setShowMenu(false);
    if (action === 'report') {
      setReportModalOpen(true);
    } else if (action === 'block') {
      if(window.confirm(`Tem a certeza que deseja bloquear ${user?.name}?`)) {
         alert("Utilizador bloqueado.");
         navigate('/feed');
      }
    } else if (action === 'clear') {
      alert("Conversa limpa (simulação).");
      setMessages([]);
    }
  };

  const handleReportSubmit = (reasonId: string) => {
    alert(`Denúncia recebida.`);
    setReportModalOpen(false);
  };

  if (!user) return <div className="p-4">Utilizador não encontrado.</div>;

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]">
      <GiftAnimation 
        gift={currentGift} 
        senderName={giftSender} 
        onComplete={() => setCurrentGift(null)} 
      />
      {/* Header */}
      <header className="bg-brand-pink text-white px-4 py-3 flex items-center gap-3 shadow-md z-10 relative">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full">
          <ArrowLeft size={24} />
        </button>
        
        <div className="relative w-10 h-10">
          <img src={user.photos[0]} alt={user.name} className="w-full h-full rounded-full object-cover border border-white/30" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-brand-pink rounded-full"></div>
        </div>
        
        <div className="flex-1">
          <h1 className="font-bold text-base leading-none flex items-center gap-1">
            {user.name}
            {user.isVerified && <ShieldCheck size={14} className="text-blue-200" />}
          </h1>
          <p className="text-xs text-white/80">Online agora</p>
        </div>

        <div className="flex items-center gap-1">
           <button onClick={() => navigate('/feed')} className="p-2 hover:bg-white/10 rounded-full" title="Ir para o início">
             <Home size={20} />
           </button>
           <div className="relative" ref={menuRef}>
             <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
               <MoreVertical size={20} />
             </button>
             {showMenu && (
               <div className="absolute top-10 right-0 w-48 bg-white rounded-xl shadow-xl py-2 text-gray-800 animate-in fade-in zoom-in-95 duration-100 border border-gray-100">
                 <button onClick={() => handleAction('report')} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm"><Flag size={16} /> Denunciar</button>
                 <button onClick={() => handleAction('block')} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600"><Ban size={16} /> Bloquear</button>
                 <button onClick={() => handleAction('clear')} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-500"><Trash2 size={16} /> Limpar Conversa</button>
               </div>
             )}
           </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-white/50 inline-block px-4 py-2 rounded-lg text-xs text-gray-600 shadow-sm">
              Inicia a conversa com {user.name} de forma segura.
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          
          if (msg.type === 'gift' && msg.giftData) {
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className="flex flex-col items-center">
                        <div className={`text-6xl animate-bounce mb-1 drop-shadow-lg`}>
                            {msg.giftData.icon}
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${isMe ? 'bg-brand-pink text-white' : 'bg-white text-brand-pink'}`}>
                            {isMe ? 'Enviaste' : 'Recebeste'} {msg.giftData.name}
                        </div>
                    </div>
                </div>
              );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm relative ${
                  isMe ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap leading-snug">{msg.text}</p>
                <div className="text-[10px] text-gray-400 text-right mt-1 flex justify-end gap-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {isMe && <span className={msg.isRead ? "text-blue-500" : "text-gray-400"}>✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-2 px-3 flex items-end gap-2 border-t border-gray-200 safe-area-bottom">
         <button 
           onClick={() => setGiftModalOpen(true)}
           className="w-11 h-11 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
         >
           <Gift size={20} />
         </button>
         
         <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 min-h-[44px] flex items-center">
            <input 
              className="w-full bg-transparent outline-none text-sm text-gray-800 max-h-32 resize-none"
              placeholder="Escreve uma mensagem..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
         </div>
         <button 
           onClick={handleSend}
           disabled={!inputText.trim()}
           className="w-11 h-11 bg-brand-pink text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:shadow-none hover:scale-105 transition-transform"
         >
           <Send size={20} className="ml-0.5" />
         </button>
      </div>

      {/* GIFT MODAL */}
      <Modal isOpen={isGiftModalOpen} onClose={() => setGiftModalOpen(false)} title="Enviar Presente Virtual">
         <div className="mb-4 flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
             <div className="flex items-center gap-2">
                 <Coins className="text-yellow-500" size={20} />
                 <span className="font-bold text-gray-800">{walletBalance} TxCoins</span>
             </div>
             <button onClick={() => navigate('/wallet')} className="text-xs font-bold text-brand-pink bg-pink-50 px-3 py-1.5 rounded-full">+ Recarregar</button>
         </div>
         
         <div className="grid grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto p-1">
             {VIRTUAL_GIFTS.map(gift => (
                 <button 
                    key={gift.id} 
                    onClick={() => handleSendGift(gift)}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-yellow-50 border border-transparent hover:border-yellow-200 transition-all active:scale-95"
                 >
                     <div className="text-4xl mb-1">{gift.icon}</div>
                     <span className="text-[10px] font-bold text-gray-700 truncate w-full text-center">{gift.name}</span>
                     <span className="text-[10px] text-yellow-600 font-bold flex items-center gap-0.5">
                         <Coins size={8} /> {gift.cost}
                     </span>
                 </button>
             ))}
         </div>
      </Modal>

      <Modal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} title="Denunciar">
        <div className="space-y-2">
           {REPORT_REASONS.map(reason => (
             <button key={reason.id} onClick={() => handleReportSubmit(reason.id)} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 text-sm font-medium border border-transparent hover:border-red-100 flex items-center justify-between">{reason.label} <Flag size={14} /></button>
           ))}
        </div>
      </Modal>
    </div>
  );
};