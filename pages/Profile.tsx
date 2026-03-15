import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, Select, Input } from '../components/ui';
import { authService } from '../services/auth';
import { walletService } from '../services/wallet';
import { safetyService, SAFETY_ERROR_MSG } from '../services/safety';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, LogOut, Edit3, Shield, Camera, Check, MapPin, 
  ChevronRight, Eye, Heart, MessageCircle, Lock, Bell, Image as ImageIcon,
  Briefcase, Ruler, User, Coins, Mic, Ghost
} from 'lucide-react';
import { PROVINCES } from '../constants';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  // Mock User State with Stats
  const [user, setUser] = useState({
    name: 'Neyma',
    age: 24,
    phone: '84 123 4567',
    photos: ['https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=800'],
    coverPhoto: 'https://images.unsplash.com/photo-1499363536502-87642509e31b?auto=format&fit=crop&q=80&w=1000',
    isPremium: false,
    isVerified: false,
    isInvisible: false,
    province: localStorage.getItem('txova_user_province') || 'Maputo Cidade',
    profession: 'Estudante',
    height: '1.65m',
    maritalStatus: 'Solteira',
    stats: {
      visits: 120,
      likes: 35,
      messages: 10
    }
  });

  const [walletBalance, setWalletBalance] = useState(0);
  
  const [showVerification, setShowVerification] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [verifyingStep, setVerifyingStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const fetchProfile = async () => {
        const token = localStorage.getItem('txova_token');
        if (!token) return;

        try {
          const res = await fetch('/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Merge API data with local state (preserving stats/mock data if missing from API)
            setUser(prev => ({ 
                ...prev, 
                name: data.name || prev.name,
                age: data.age || prev.age,
                phone: data.phone || prev.phone,
                province: data.province || data.city || prev.province,
                // Add other fields as needed
            }));
          }
        } catch (err) {
          console.error("Failed to fetch profile", err);
        }
      };
      fetchProfile();
      setWalletBalance(walletService.getBalance());
  }, []);

  const handleLogout = () => {
    if(window.confirm("Tem a certeza que deseja terminar a sessão?")) {
      authService.logout();
    }
  };

  const handleSaveProfile = () => {
      localStorage.setItem('txova_user_province', user.province);
      setShowEditProfile(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      try {
        const isSafe = await safetyService.analyzeImage(file);
        if (!isSafe) {
          alert(SAFETY_ERROR_MSG + "\n\nSua conta foi sinalizada por tentar enviar conteúdo impróprio.");
          return;
        }
        const newUrl = URL.createObjectURL(file);
        if (type === 'profile') {
          setUser(prev => ({ ...prev, photos: [newUrl] }));
        } else {
          setUser(prev => ({ ...prev, coverPhoto: newUrl }));
        }
      } catch (err) {
        alert("Erro ao processar imagem.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const startVerification = () => {
    setVerifyingStep(1);
    setTimeout(() => setVerifyingStep(2), 2000);
    setTimeout(() => {
        setUser({...user, isVerified: true});
        setShowVerification(false);
        setVerifyingStep(0);
    }, 4000);
  };

  const startRecording = () => {
      setRecordingState('recording');
      setTimeout(() => setRecordingState('recorded'), 3000); // Simulate 3s recording
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* --- COVER IMAGE --- */}
      <div className="relative h-[180px] w-full bg-gray-300 group">
        <img 
          src={user.coverPhoto} 
          className="w-full h-full object-cover" 
          alt="Capa" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=1000';
          }}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
        
        <button 
          onClick={() => coverInputRef.current?.click()}
          className="absolute bottom-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-all border border-white/20"
        >
          <Camera size={18} />
        </button>
      </div>

      <div className="px-4 relative mb-4">
        {/* --- PROFILE PHOTO --- */}
        <div className="relative -mt-16 mb-3 flex justify-between items-end">
          <div className="relative">
            <div className="w-[110px] h-[110px] rounded-full border-[4px] border-white shadow-lg overflow-hidden bg-white">
              <img 
                src={user.photos[0]} 
                alt="Perfil" 
                className="w-full h-full object-cover"
              />
            </div>
            <button 
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-[#FF4D6D] text-white p-2 rounded-full shadow-md border-2 border-white hover:scale-105 transition-transform"
            >
              <Camera size={16} />
            </button>
          </div>

          <button 
            onClick={() => setShowEditProfile(true)}
            className="mb-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Editar Perfil
          </button>
        </div>

        {/* --- USER INFO --- */}
        <div className="flex flex-col items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {user.name}, {user.age}
            {user.isVerified && <Shield size={20} className="text-blue-500 fill-current" />}
          </h1>
          
          <div className="flex flex-wrap gap-3 mt-2 mb-3">
             <span className="text-sm text-gray-600 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100">
                <Briefcase size={14} className="text-gray-400" /> {user.profession}
             </span>
             <span className="text-sm text-gray-600 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100">
                <Ruler size={14} className="text-gray-400" /> {user.height}
             </span>
          </div>
          
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <span className="bg-blue-50 text-blue-500 p-1 rounded-md">
                  <MapPin size={12} />
                </span>
                <span className="font-medium">{user.province}, Moçambique</span>
             </div>
          </div>
        </div>

        {/* --- WALLET BANNER --- */}
        <div onClick={() => navigate('/wallet')} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 text-white mb-6 flex justify-between items-center shadow-lg cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400">
                    <Coins size={20} />
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Minha Carteira</p>
                    <p className="font-bold text-xl">{walletBalance} TxCoins</p>
                </div>
            </div>
            <div className="bg-white/10 p-2 rounded-full">
                <ChevronRight size={20} />
            </div>
        </div>

        {/* --- VERIFICATION CTA --- */}
        {!user.isVerified && (
           <div className="mb-6">
             <button 
               onClick={() => setShowVerification(true)}
               className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-blue-200 shadow-sm"
             >
               <Shield size={18} />
               Verificar Perfil
             </button>
           </div>
        )}

        {/* --- STATS --- */}
        <div className="grid grid-cols-3 gap-3 mb-8">
           <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1">
              <div className="text-gray-400"><Eye size={20} /></div>
              <span className="font-bold text-lg text-gray-800">{user.stats.visits}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Visitas</span>
           </div>
           <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1">
              <div className="text-[#FF4D6D]"><Heart size={20} className="fill-current" /></div>
              <span className="font-bold text-lg text-gray-800">{user.stats.likes}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Gostos</span>
           </div>
           <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1">
              <div className="text-blue-500"><MessageCircle size={20} /></div>
              <span className="font-bold text-lg text-gray-800">{user.stats.messages}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Msgs</span>
           </div>
        </div>

        {/* --- MENU SECTIONS --- */}
        <div className="space-y-6">
           <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Minha Conta</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <MenuItem icon={<Edit3 size={18} />} color="bg-orange-100 text-orange-600" label="Editar Detalhes" onClick={() => setShowEditProfile(true)} />
                 <MenuItem icon={<Mic size={18} />} color="bg-red-100 text-red-600" label="Gravar Apresentação de Voz" onClick={() => setShowVoiceModal(true)} />
                 <MenuItem icon={<Ghost size={18} />} color="bg-gray-100 text-gray-600" label={`Modo Invisível (${user.isInvisible ? 'Ativado' : 'Desativado'})`} onClick={() => setUser({...user, isInvisible: !user.isInvisible})} />
              </div>
           </div>

           <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Definições</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <MenuItem icon={<Settings size={18} />} color="bg-gray-100 text-gray-600" label="Preferências de Descoberta" />
                 <MenuItem icon={<Lock size={18} />} color="bg-gray-100 text-gray-600" label="Privacidade" />
                 <MenuItem icon={<Shield size={18} />} color="bg-green-100 text-green-600" label="Segurança & Ajuda" />
              </div>
           </div>

           <button 
             onClick={handleLogout}
             className="w-full bg-white border border-gray-200 text-red-500 py-4 rounded-2xl font-bold text-sm shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
           >
             <LogOut size={18} />
             Terminar Sessão
           </button>
        </div>
      </div>

      <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />

      {/* --- MODALS --- */}
      
      <Modal isOpen={showVerification} onClose={() => { if(verifyingStep === 0) setShowVerification(false)}} title="Verificação Facial">
        <div className="text-center py-6">
            {verifyingStep === 0 && (
                <>
                    <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-6">
                        <Camera size={40} className="text-blue-500" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-gray-800 mb-2">Prove que é você</h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        Vamos comparar uma selfie sua agora com as suas fotos de perfil. Custa 50 TxCoins.
                    </p>
                    <Button onClick={startVerification}>Tirar Selfie Agora</Button>
                </>
            )}
            {verifyingStep === 1 && (
                <>
                    <div className="w-24 h-24 bg-gray-50 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-blue-500 border-t-transparent animate-spin">
                    </div>
                    <h3 className="font-bold text-lg mb-2">A analisar biometria...</h3>
                </>
            )}
            {verifyingStep === 2 && (
                <>
                    <div className="w-24 h-24 bg-green-50 rounded-full mx-auto flex items-center justify-center mb-6">
                        <Check size={48} className="text-green-500" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Verificado!</h3>
                </>
            )}
        </div>
      </Modal>

      <Modal isOpen={showVoiceModal} onClose={() => setShowVoiceModal(false)} title="Perfil de Voz">
          <div className="text-center py-6">
              {recordingState === 'idle' && (
                  <>
                      <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4 cursor-pointer hover:bg-red-50" onClick={startRecording}>
                          <Mic size={32} className="text-gray-500" />
                      </div>
                      <p className="text-gray-600 mb-4">Toque para gravar uma apresentação de 10s</p>
                  </>
              )}
              {recordingState === 'recording' && (
                  <>
                       <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
                          <Mic size={32} className="text-red-500" />
                      </div>
                      <p className="text-red-500 font-bold mb-4">Gravando... 3s</p>
                  </>
              )}
              {recordingState === 'recorded' && (
                  <>
                       <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                          <Check size={32} className="text-green-500" />
                      </div>
                      <p className="text-green-600 font-bold mb-4">Áudio Salvo!</p>
                      <Button onClick={() => setShowVoiceModal(false)}>Concluir</Button>
                  </>
              )}
          </div>
      </Modal>

      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="Editar Perfil">
        <div className="space-y-4 pt-2 pb-6">
            <Input label="Nome" value={user.name} onChange={e => setUser({...user, name: e.target.value})} />
            <Input label="Profissão" value={user.profession} onChange={e => setUser({...user, profession: e.target.value})} placeholder="Ex: Estudante" />
            <div className="flex gap-4">
                <div className="flex-1">
                    <Input label="Altura" value={user.height} onChange={e => setUser({...user, height: e.target.value})} placeholder="Ex: 1.70m" />
                </div>
                <div className="flex-1">
                    <Input label="Estado Civil" value={user.maritalStatus} onChange={e => setUser({...user, maritalStatus: e.target.value})} placeholder="Ex: Solteiro" />
                </div>
            </div>
            
            <Select 
                label="Província"
                options={PROVINCES}
                value={user.province}
                onChange={(e) => setUser({...user, province: e.target.value})}
            />
            
            <div className="pt-2">
                 <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode, color: string, label: string, onClick?: () => void }> = ({ icon, color, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <span className="font-semibold text-gray-700 text-sm">{label}</span>
    </div>
    <ChevronRight size={18} className="text-gray-300" />
  </button>
);