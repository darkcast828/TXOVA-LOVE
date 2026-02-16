import React from 'react';
import { UserProfile } from '../types';
import { MessageCircle, X } from 'lucide-react';
import { Button } from './ui';

interface MatchPopupProps {
  isVisible: boolean;
  matchedProfile: UserProfile | null;
  onClose: () => void;
  onChat: () => void;
}

export const MatchPopup: React.FC<MatchPopupProps> = ({ isVisible, matchedProfile, onClose, onChat }) => {
  if (!isVisible || !matchedProfile) return null;

  // Mock "My" Photo
  const myPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-6 animate-in fade-in duration-300">
      
      {/* Celebration Text */}
      <div className="text-center mb-8 animate-in zoom-in duration-500">
        <h1 className="font-heading italic font-black text-5xl text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-blue drop-shadow-lg">
          It's a<br/>Match!
        </h1>
        <p className="text-white/80 mt-2 text-sm">Tu e {matchedProfile.name} gostaram um do outro.</p>
      </div>

      {/* Avatars */}
      <div className="flex items-center justify-center gap-4 mb-12 w-full max-w-xs relative h-32">
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden absolute left-4 transform -rotate-12 animate-in slide-in-from-left duration-700">
          <img src={myPhoto} className="w-full h-full object-cover" alt="Eu" />
        </div>
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden absolute right-4 transform rotate-12 animate-in slide-in-from-right duration-700">
           <img src={matchedProfile.photos[0]} className="w-full h-full object-cover" alt={matchedProfile.name} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-10">
           <div className="text-brand-pink text-xl">❤️</div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3 animate-in slide-in-from-bottom duration-500 delay-200">
        <Button onClick={onChat} className="w-full bg-white text-brand-pink hover:bg-gray-100 border-none">
          <MessageCircle className="mr-2" size={20} />
          Enviar Mensagem
        </Button>

        <button 
          onClick={onClose}
          className="w-full py-4 text-white font-bold border-2 border-white rounded-xl hover:bg-white/10 transition-colors"
        >
          Continuar a Deslizar
        </button>
      </div>
    </div>
  );
};