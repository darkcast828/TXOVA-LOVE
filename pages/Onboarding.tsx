import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, ImageUpload, Select } from '../components/ui';
import { authService } from '../services/auth';
import { SAFETY_ERROR_MSG } from '../services/safety';
import { ShieldCheck, Phone, Camera, AlertTriangle, User, Lock, AlertOctagon } from 'lucide-react';
import { PROVINCES } from '../constants';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'rules' | 'auth'>('welcome');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    password: '',
    confirmPassword: '',
    province: '',
    photo: null as File | null,
    photoPreview: null as string | null
  });

  // Load saved phone number on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('txova_saved_phone');
    if (savedPhone) {
      setFormData(prev => ({ ...prev, phone: savedPhone }));
      // If we have a saved phone, assume user wants to remember it by default
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setErrorMsg(null); // Clear error on typing
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoSelect = (file: File) => {
    setErrorMsg(null);
    const preview = URL.createObjectURL(file);
    setFormData({ ...formData, photo: file, photoPreview: preview });
  };

  const handleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (authMode === 'login') {
        if (!formData.phone || !formData.password) {
           throw new Error("Preencha o telefone e a palavra-passe.");
        }
        
        const user = await authService.login(formData.phone, formData.password);
        
        // Handle "Remember Me" logic for Phone Number
        if (rememberMe) {
          localStorage.setItem('txova_saved_phone', formData.phone);
        } else {
          localStorage.removeItem('txova_saved_phone');
        }

        localStorage.setItem('txova_token', user.token);
        // Save user province preference locally for the feed
        if (user.province) localStorage.setItem('txova_user_province', user.province);
        navigate('/feed');
      } else {
        // Register Logic
        if (!formData.name || !formData.age || !formData.phone || !formData.password || !formData.confirmPassword || !formData.province) {
           throw new Error("Por favor, preencha todos os campos obrigatórios.");
        }
        
        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 18) {
           throw new Error("Tens de ter 18 anos ou mais para usar o Txova Love.");
        }

        if (formData.password !== formData.confirmPassword) {
           throw new Error("As palavras-passe não coincidem.");
        }
        if (!formData.photo) {
           throw new Error("A foto de perfil é obrigatória.");
        }

        const user = await authService.register({
          name: formData.name,
          age: ageNum,
          phone: formData.phone,
          password: formData.password,
          province: formData.province,
          photo: formData.photo
        });
        
        // Auto-save phone on register too for convenience if check is true (default logic for new users usually implies saving)
        localStorage.setItem('txova_saved_phone', formData.phone);
        
        localStorage.setItem('txova_token', user.token);
        localStorage.setItem('txova_user_province', user.province || '');
        navigate('/feed');
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Ocorreu um erro.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'welcome') {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Hero Image Section */}
        <div className="flex-1 relative bg-brand-pink overflow-hidden flex items-end justify-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531123414780-f74242c2b052?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-multiply"></div>
          <div className="relative z-10 p-8 text-center pb-12 w-full">
            <div className="inline-block bg-white/20 backdrop-blur-md p-4 rounded-full mb-6 border border-white/30">
               <span className="text-4xl">🇲🇿</span>
            </div>
            <h1 className="text-4xl font-heading font-bold text-white mb-2 leading-tight">
              Txova<span className="text-brand-blue">Love</span>
            </h1>
            <p className="text-white/90 text-lg font-medium">Encontros em todo Moçambique.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-8 pb-12 bg-white rounded-t-3xl -mt-6 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-4">
            <h2 className="text-center text-gray-800 font-heading font-bold text-xl mb-2">Bem-vindo(a)</h2>
            <Button onClick={() => setStep('rules')}>
              Começar Agora
            </Button>
            
            <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
              Sistema 100% seguro protegido contra fraudes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'rules') {
    return (
      <div className="h-screen flex flex-col p-8 bg-white justify-center max-w-md mx-auto">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertTriangle size={32} />
           </div>
           <h2 className="text-2xl font-heading font-bold text-gray-800">Regras Importantes</h2>
           <p className="text-gray-500 mt-2">Para manter a comunidade segura:</p>
        </div>

        <div className="space-y-4 mb-8">
           <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
             <Camera className="text-brand-pink shrink-0 mt-1" size={20} />
             <div className="text-sm text-gray-600">
               <strong>Foto Real Obrigatória:</strong> Não permitimos fotos de paisagens, desenhos, animais ou famosos.
             </div>
           </div>
           <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
             <ShieldCheck className="text-brand-blue shrink-0 mt-1" size={20} />
             <div className="text-sm text-gray-600">
               <strong>Verificação:</strong> Poderemos pedir uma selfie para provar que és tu.
             </div>
           </div>
           <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-4 rounded-xl">
             <AlertOctagon className="text-red-500 shrink-0 mt-1" size={20} />
             <div className="text-sm text-red-800">
               <strong>Proibido Nudez:</strong> Bloqueio imediato para conteúdo íntimo ou explícito.
             </div>
           </div>
        </div>

        <Button onClick={() => setStep('auth')}>
          Concordo e Continuar
        </Button>
        <button onClick={() => setStep('welcome')} className="w-full text-center text-gray-400 text-sm font-medium mt-4">
          Cancelar
        </button>
      </div>
    );
  }

  // AUTH SCREEN (LOGIN / REGISTER)
  return (
    <div className="min-h-screen flex flex-col p-6 bg-white justify-center max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-pink">
          {authMode === 'login' ? <User size={32} /> : <Camera size={32} />}
        </div>
        <h2 className="text-2xl font-heading font-bold text-gray-800">
          {authMode === 'login' ? 'Bem-vindo de volta' : 'Criar Nova Conta'}
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          {authMode === 'login' ? 'Insere os teus dados para entrar.' : 'Preenche os campos abaixo.'}
        </p>
      </div>
      
      {/* ERROR DISPLAY */}
      {errorMsg && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${errorMsg === SAFETY_ERROR_MSG ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>
          <AlertOctagon className="shrink-0 mt-0.5" size={20} />
          <div className="text-sm font-bold">
            {errorMsg}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Register Fields */}
        {authMode === 'register' && (
          <>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input 
                  name="name"
                  label="Nome" 
                  placeholder="Ex: Neyma" 
                  icon={<User size={18} />}
                  value={formData.name}
                  onChange={handleInputChange}
                  autoComplete="name"
                />
              </div>
              <div className="w-24">
                <Input 
                  name="age"
                  label="Idade" 
                  placeholder="18+" 
                  type="number"
                  min="18"
                  value={formData.age}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <Select 
               name="province"
               label="Província"
               options={PROVINCES}
               value={formData.province}
               onChange={handleInputChange}
            />
            
            <ImageUpload 
              label="Foto de Perfil (Obrigatório)"
              previewUrl={formData.photoPreview}
              onImageSelect={handlePhotoSelect}
            />
          </>
        )}

        {/* Common Fields with Autocomplete */}
        <Input 
          name="phone"
          label="Número de Telemóvel" 
          placeholder="84 123 4567" 
          type="tel"
          icon={<Phone size={18} />}
          value={formData.phone}
          onChange={handleInputChange}
          autoComplete="tel"
        />

        <Input 
          name="password"
          label="Palavra-passe" 
          placeholder="******" 
          type="password"
          icon={<Lock size={18} />}
          value={formData.password}
          onChange={handleInputChange}
          autoComplete={authMode === 'login' ? "current-password" : "new-password"}
        />

        {authMode === 'register' && (
          <Input 
            name="confirmPassword"
            label="Confirmar Palavra-passe" 
            placeholder="******" 
            type="password"
            icon={<Lock size={18} />}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            autoComplete="new-password"
          />
        )}
        
        {/* Remember Me Checkbox (Only for Login) */}
        {authMode === 'login' && (
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-brand-pink rounded border-gray-300 focus:ring-brand-pink accent-brand-pink"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600 select-none cursor-pointer">
              Lembrar-me neste dispositivo
            </label>
          </div>
        )}

        <Button onClick={handleAuth} isLoading={isLoading} className="mt-2" variant={errorMsg === SAFETY_ERROR_MSG ? 'danger' : 'primary'}>
          {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
        </Button>
        
        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {authMode === 'login' ? 'Ainda não tens conta? ' : 'Já tens uma conta? '}
            <button 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                // Don't clear phone if saved
                const savedPhone = localStorage.getItem('txova_saved_phone') || '';
                setFormData({ name: '', age: '', phone: savedPhone, password: '', confirmPassword: '', province: '', photo: null, photoPreview: null });
                setErrorMsg(null);
              }}
              className="text-brand-pink font-bold hover:underline"
            >
              {authMode === 'login' ? 'Criar Agora' : 'Entrar'}
            </button>
          </p>
        </div>

        <button onClick={() => setStep('rules')} className="w-full text-center text-gray-400 text-xs font-medium hover:text-gray-600 mt-2">
          Voltar às regras
        </button>
      </div>
    </div>
  );
};