import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROFILES, PROVINCES } from '../constants';
import { UserProfile, UserGender } from '../types';
import { Badge, Modal, Input, Button, Select } from '../components/ui';
import { MatchPopup } from '../components/MatchPopup';
import { matchService } from '../services/match';
import { 
  MapPin, MoreVertical, Flag, ShieldCheck, ChevronDown, 
  X, Heart, Star, RotateCcw, Zap, SlidersHorizontal, Plus, Mic, Play, Pause 
} from 'lucide-react';
import { REPORT_REASONS } from '../constants';

const VoiceButton: React.FC<{ intro?: { url: string, duration: number } }> = ({ intro }) => {
  const [playing, setPlaying] = useState(false);
  
  if (!intro) return null;

  const togglePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPlaying(!playing);
      // Simulate play duration
      if (!playing) {
          setTimeout(() => setPlaying(false), intro.duration * 1000);
      }
  };

  return (
      <button 
        onClick={togglePlay}
        className={`absolute top-[160px] left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md border border-white/30 transition-all ${playing ? 'bg-brand-pink text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}
      >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          <div className="flex flex-col items-start leading-none">
             <span className="text-[10px] font-bold uppercase tracking-wider">{playing ? 'A ouvir...' : 'Ouvir Voz'}</span>
             <span className="text-[9px] opacity-80">{intro.duration}s</span>
          </div>
          {playing && (
              <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 h-3 bg-white animate-pulse"></div>
                  <div className="w-0.5 h-2 bg-white animate-pulse delay-75"></div>
                  <div className="w-0.5 h-4 bg-white animate-pulse delay-150"></div>
              </div>
          )}
      </button>
  );
};

const ProfileCard: React.FC<{ 
  profile: UserProfile; 
  isTop: boolean;
  onSwipe: (dir: 'left' | 'right' | 'up') => void;
}> = ({ profile, isTop, onSwipe }) => {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    if (!isTop) return;
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isTop) return;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setDrag({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isTop) return;
    setIsDragging(false);
    
    const threshold = 100; // px to trigger action

    if (drag.x > threshold) {
      onSwipe('right');
    } else if (drag.x < -threshold) {
      onSwipe('left');
    } else if (drag.y < -threshold) {
      onSwipe('up');
    } else {
      setDrag({ x: 0, y: 0 });
    }
  };

  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => { if (isDragging) handleEnd(); };

  const rotation = drag.x * 0.1;
  const opacity = Math.max(0, 1 - Math.abs(drag.x) / 1000); 

  const style: React.CSSProperties = isTop ? {
    transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: 10,
    opacity
  } : {
    transform: 'scale(0.95) translateY(10px)',
    transition: 'transform 0.3s ease-out',
    zIndex: 5,
    opacity: 0.8,
    pointerEvents: 'none'
  };

  return (
    <div 
      ref={cardRef}
      className="absolute inset-0 bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 select-none"
      style={style}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative h-full flex flex-col">
        {/* SWIPE INDICATORS */}
        {isDragging && (
          <>
            <div 
              className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-2 transform -rotate-12 z-30 font-bold text-3xl text-green-500 tracking-widest bg-black/10 backdrop-blur-sm"
              style={{ opacity: drag.x > 20 ? Math.min(drag.x / 100, 1) : 0 }}
            >
              LIKE
            </div>
            <div 
              className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-2 transform rotate-12 z-30 font-bold text-3xl text-red-500 tracking-widest bg-black/10 backdrop-blur-sm"
              style={{ opacity: drag.x < -20 ? Math.min(Math.abs(drag.x) / 100, 1) : 0 }}
            >
              NOPE
            </div>
            <div 
              className="absolute bottom-32 left-1/2 -translate-x-1/2 border-4 border-blue-400 rounded-lg px-4 py-2 z-30 font-bold text-3xl text-blue-400 tracking-widest bg-black/10 backdrop-blur-sm"
              style={{ opacity: drag.y < -50 ? Math.min(Math.abs(drag.y) / 100, 1) : 0 }}
            >
              SUPER
            </div>
          </>
        )}

        <div className="relative h-full w-full">
          <img 
            src={profile.photos[0]} 
            alt={profile.name} 
            className="w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute bottom-0 left-0 w-full h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

          <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 z-40">
             <ShieldCheck size={12} className="text-green-400" />
             <span className="text-[10px] text-white font-bold tracking-wide uppercase">Foto Real</span>
          </div>
          
          {profile.isOnline && (
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 z-40">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] text-white font-bold tracking-wide uppercase">Online</span>
            </div>
          )}

          {/* VOICE PROFILE BUTTON */}
          <VoiceButton intro={profile.voiceIntro} />

          <div className="absolute bottom-[100px] left-0 w-full px-5 text-white pointer-events-none z-20">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-3xl font-heading font-bold shadow-black drop-shadow-md tracking-tight">{profile.name}, {profile.age}</h3>
              {profile.isVerified && <Badge type="verified">Verificado</Badge>}
            </div>
            
            {/* Extended Info */}
            <div className="flex flex-wrap gap-2 mb-2">
               {profile.distanceKm && (
                   <span className="text-xs bg-brand-pink/90 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1">
                       <MapPin size={10} /> {profile.distanceKm} km daqui
                   </span>
               )}
               {profile.profession && <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg">{profile.profession}</span>}
               {profile.height && <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg">{profile.height}</span>}
            </div>

            <div className="flex items-center gap-1 text-gray-200 text-sm mb-3 font-medium">
              <MapPin size={16} className="text-brand-pink" />
              <span className="drop-shadow-md">{profile.district ? `${profile.district}, ` : ''}{profile.city}</span>
            </div>
            <p className="text-gray-100 text-sm line-clamp-2 opacity-95 leading-relaxed drop-shadow-sm pr-4">{profile.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  // Filters State
  const [filters, setFilters] = useState({
    province: 'Todas as Províncias',
    gender: 'all',
    minAge: 18,
    maxAge: 50
  });

  // Story Viewer
  const [activeStory, setActiveStory] = useState<string | null>(null);

  // Match State
  const [matchPopupData, setMatchPopupData] = useState<UserProfile | null>(null);

  useEffect(() => {
    setSwipedIds(matchService.getSwipedIds());
    const savedProv = localStorage.getItem('txova_user_province');
    if (savedProv) setFilters(prev => ({...prev, province: savedProv}));
  }, []);

  const profiles = useMemo(() => {
    return MOCK_PROFILES.filter(p => {
        if(swipedIds.includes(p.id)) return false;
        
        const provMatch = filters.province === 'Todas as Províncias' || 
                          p.city.includes(filters.province) || 
                          (filters.province.includes('Maputo') && p.city.includes('Maputo'));
        if(!provMatch) return false;

        if(filters.gender !== 'all') {
            const userGender = filters.gender === 'male' ? UserGender.MALE : UserGender.FEMALE;
            if(p.gender !== userGender) return false;
        }

        if(p.age < filters.minAge || p.age > filters.maxAge) return false;

        return true;
    });
  }, [swipedIds, filters]);

  const activeProfiles = profiles.slice(0, 2);
  const storiesUsers = MOCK_PROFILES.filter(p => p.stories && p.stories.length > 0 && !swipedIds.includes(p.id));

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (activeProfiles.length === 0) return;
    const profile = activeProfiles[0];
    
    let action: 'like' | 'nope' | 'superlike' = 'nope';
    if (direction === 'right') action = 'like';
    if (direction === 'up') action = 'superlike';

    const match = matchService.swipe(profile, action);
    setSwipedIds(prev => [...prev, profile.id]);
    if (match) setMatchPopupData(profile);
  };

  const handleUndo = () => {
    const lastAction = matchService.undoLastSwipe();
    if (lastAction) setSwipedIds(prev => prev.filter(id => id !== lastAction.targetId));
    else alert("Nada para desfazer ou funcionalidade Premium.");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-gray-50">
      
      {/* Top Bar with Stories */}
      <div className="bg-white border-b border-gray-100 pb-2 shadow-sm z-20">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="font-heading font-bold text-2xl text-gray-800">Txova</h2>
            <button 
                onClick={() => setShowFilterModal(true)}
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-brand-pink transition-colors"
            >
                <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* Stories Bar */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
             <div className="flex flex-col items-center gap-1 min-w-[64px]">
                 <div className="relative w-16 h-16 rounded-full border-2 border-gray-200 p-0.5">
                     <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                         <Plus size={24} className="text-gray-400" />
                     </div>
                     <div className="absolute bottom-0 right-0 bg-brand-pink text-white rounded-full p-0.5 border-2 border-white">
                        <Plus size={10} />
                     </div>
                 </div>
                 <span className="text-[10px] font-medium text-gray-600">Eu</span>
             </div>

             {storiesUsers.map(user => (
                 <div key={user.id} onClick={() => setActiveStory(user.id)} className="flex flex-col items-center gap-1 cursor-pointer min-w-[64px]">
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-brand-pink">
                       <img src={user.photos[0]} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 truncate w-16 text-center">{user.name}</span>
                 </div>
             ))}
          </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 relative mx-4 mt-4 mb-20">
        {activeProfiles.length > 0 ? (
          activeProfiles.map((profile, index) => (
            <ProfileCard 
              key={profile.id}
              profile={profile} 
              isTop={index === 0}
              onSwipe={handleSwipe}
            />
          )).reverse() 
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Heart className="text-gray-300" size={40} />
             </div>
             <h3 className="font-bold text-xl text-gray-800 mb-2">Sem perfis</h3>
             <p className="text-gray-500 text-sm mb-6">Tente ajustar os filtros.</p>
             <button onClick={() => setShowFilterModal(true)} className="text-brand-pink font-bold text-sm bg-pink-50 px-6 py-3 rounded-full hover:bg-pink-100">
               Ajustar Filtros
             </button>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-24 left-0 w-full px-4 flex justify-center items-center gap-4 z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-white/80 backdrop-blur-md p-2 rounded-full shadow-xl border border-white/40">
           <button onClick={handleUndo} className="w-10 h-10 bg-white border border-yellow-400 text-yellow-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
              <RotateCcw size={18} />
           </button>
           <button onClick={() => handleSwipe('left')} className="w-14 h-14 bg-white border border-red-500 text-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md">
              <X size={30} strokeWidth={3} />
           </button>
           <button onClick={() => handleSwipe('up')} className="w-10 h-10 bg-white border border-blue-400 text-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
              <Star size={18} fill="currentColor" />
           </button>
           <button onClick={() => handleSwipe('right')} className="w-14 h-14 bg-white border border-green-500 text-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md">
              <Heart size={30} fill="currentColor" />
           </button>
           <button onClick={() => navigate('/premium')} className="w-10 h-10 bg-white border border-purple-400 text-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
              <Zap size={18} fill="currentColor" />
           </button>
        </div>
      </div>

      {/* Match Popup */}
      <MatchPopup 
        isVisible={!!matchPopupData} 
        matchedProfile={matchPopupData} 
        onClose={() => setMatchPopupData(null)}
        onChat={() => { if(matchPopupData) navigate(`/chat/${matchPopupData.id}`); }}
      />

      {/* FILTER MODAL */}
      <Modal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} title="Filtros">
        <div className="space-y-6">
            <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Localização</label>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto border border-gray-100 rounded-xl p-2">
                    <button onClick={() => setFilters({...filters, province: 'Todas as Províncias'})} className={`p-2 text-left text-sm rounded-lg ${filters.province === 'Todas as Províncias' ? 'bg-brand-pink text-white' : 'hover:bg-gray-50'}`}>Todas</button>
                    {PROVINCES.map(prov => (
                        <button key={prov} onClick={() => setFilters({...filters, province: prov})} className={`p-2 text-left text-sm rounded-lg ${filters.province === prov ? 'bg-brand-pink text-white' : 'hover:bg-gray-50'}`}>{prov}</button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Interesse</label>
                <div className="flex gap-2">
                    <button onClick={() => setFilters({...filters, gender: 'all'})} className={`flex-1 py-2 rounded-xl text-sm font-bold border ${filters.gender === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-500'}`}>Todos</button>
                    <button onClick={() => setFilters({...filters, gender: 'female'})} className={`flex-1 py-2 rounded-xl text-sm font-bold border ${filters.gender === 'female' ? 'bg-brand-pink text-white border-brand-pink' : 'border-gray-200 text-gray-500'}`}>Mulheres</button>
                    <button onClick={() => setFilters({...filters, gender: 'male'})} className={`flex-1 py-2 rounded-xl text-sm font-bold border ${filters.gender === 'male' ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 text-gray-500'}`}>Homens</button>
                </div>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Faixa Etária: {filters.minAge} - {filters.maxAge}</label>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <span className="text-xs text-gray-400">Mínimo</span>
                        <input type="number" value={filters.minAge} onChange={(e) => setFilters({...filters, minAge: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" />
                    </div>
                    <div className="flex-1">
                        <span className="text-xs text-gray-400">Máximo</span>
                        <input type="number" value={filters.maxAge} onChange={(e) => setFilters({...filters, maxAge: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" />
                    </div>
                </div>
            </div>

            <Button onClick={() => setShowFilterModal(false)}>Aplicar Filtros</Button>
        </div>
      </Modal>

      {/* STORY VIEWER */}
      {activeStory && (
          <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center" onClick={() => setActiveStory(null)}>
              <div className="absolute top-4 right-4 z-50">
                  <button className="text-white"><X size={32} /></button>
              </div>
              <img src={MOCK_PROFILES.find(p => p.id === activeStory)?.stories?.[0].imageUrl} className="w-full h-full object-cover" />
              <div className="absolute bottom-10 left-0 w-full px-6">
                 <div className="flex items-center gap-3 mb-4">
                    <img src={MOCK_PROFILES.find(p => p.id === activeStory)?.photos[0]} className="w-10 h-10 rounded-full border border-white" />
                    <span className="text-white font-bold">{MOCK_PROFILES.find(p => p.id === activeStory)?.name}</span>
                 </div>
                 <input placeholder="Enviar mensagem..." className="w-full bg-transparent border border-white/50 rounded-full px-4 py-3 text-white placeholder-white/70" onClick={(e) => e.stopPropagation()} />
              </div>
          </div>
      )}
    </div>
  );
};