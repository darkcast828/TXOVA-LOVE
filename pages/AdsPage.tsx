import React, { useState, useEffect } from 'react';
import { AdContent, AdPlanType } from '../types';
import { Button, Modal, Input, ImageUpload } from '../components/ui';
import { Megaphone, Plus, LayoutDashboard, MessageCircle, Clock, Star, Zap, Trash2, Check, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- MOCK PLANS ---
const AD_PLANS: { id: AdPlanType; name: string; price: number; days: number; features: string[]; color: string }[] = [
    { 
        id: 'basic', 
        name: 'Básico', 
        price: 500, 
        days: 30, 
        features: ['Visibilidade Padrão', 'Suporte Básico', '30 Dias Online'],
        color: 'border-gray-200'
    },
    { 
        id: 'highlight', 
        name: 'Destaque', 
        price: 1000, 
        days: 30, 
        features: ['2x Mais Visibilidade', 'Borda Colorida', 'Selo "Destaque"'],
        color: 'border-blue-400 bg-blue-50'
    },
    { 
        id: 'top', 
        name: 'Top Business', 
        price: 2000, 
        days: 30, 
        features: ['Topo da Lista', 'Borda Dourada', 'Selo "Premium"', 'Notificação Push'],
        color: 'border-yellow-400 bg-yellow-50 shadow-md'
    }
];

// --- MOCK STORAGE ---
const getMyAds = (): AdContent[] => {
    const saved = localStorage.getItem('txova_my_ads');
    return saved ? JSON.parse(saved) : [];
};

const saveAd = (ad: AdContent) => {
    const ads = getMyAds();
    // Check if updating or creating
    const index = ads.findIndex(a => a.id === ad.id);
    if (index >= 0) {
        ads[index] = ad;
    } else {
        ads.unshift(ad); // Newest first
    }
    localStorage.setItem('txova_my_ads', JSON.stringify(ads));
};

const AdCardItem: React.FC<{ ad: AdContent; onRenew: () => void; onDelete: () => void }> = ({ ad, onRenew, onDelete }) => {
    const daysLeft = Math.ceil((ad.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    const isExpired = daysLeft <= 0;
    
    // Style based on Plan
    const borderStyle = ad.plan === 'top' ? 'border-yellow-400 border-2' : ad.plan === 'highlight' ? 'border-blue-300 border' : 'border-gray-100 border';
    const badgeColor = ad.plan === 'top' ? 'bg-yellow-100 text-yellow-700' : ad.plan === 'highlight' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';

    return (
        <div className={`bg-white rounded-2xl overflow-hidden shadow-sm mb-4 relative ${borderStyle}`}>
            {ad.plan === 'top' && (
                <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-yellow-400 to-amber-500 h-1.5" />
            )}
            
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${badgeColor}`}>
                            {ad.plan === 'top' && <Star size={10} fill="currentColor" />}
                            {ad.plan === 'highlight' && <Zap size={10} fill="currentColor" />}
                            {ad.plan === 'basic' ? 'Básico' : ad.plan === 'highlight' ? 'Destaque' : 'Premium'}
                        </span>
                        {isExpired ? (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Expirado</span>
                        ) : (
                            <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock size={10} /> {daysLeft} dias restantes
                            </span>
                        )}
                    </div>
                    
                    <button onClick={onDelete} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="flex gap-3 mb-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">{ad.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{ad.description}</p>
                        <div className="mt-2 text-xs font-semibold text-brand-blue flex items-center gap-1">
                           <MessageCircle size={12} /> {ad.whatsappNumber}
                        </div>
                    </div>
                </div>

                {isExpired ? (
                    <Button onClick={onRenew} className="h-10 text-xs" variant="secondary">
                        <RefreshCw size={14} className="mr-1" /> Renovar (500 MT)
                    </Button>
                ) : (
                     <a 
                        href={ad.ctaLink}
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full text-center py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold text-xs transition-colors"
                     >
                        Testar Botão WhatsApp
                     </a>
                )}
            </div>
        </div>
    );
};

export const AdsPage: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<AdContent[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [step, setStep] = useState<'form' | 'plan' | 'payment'>('form');
  
  // Create State
  const [selectedPlan, setSelectedPlan] = useState<AdPlanType>('basic');
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    whatsapp: '',
    image: null as File | null,
    imagePreview: null as string | null
  });
  const [descriptionCount, setDescriptionCount] = useState(0);

  // Payment State
  const [paymentProvider, setPaymentProvider] = useState<'mpesa' | 'emola'>('mpesa');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setAds(getMyAds());
  }, []);

  const resetForm = () => {
    setNewAd({ title: '', description: '', whatsapp: '', image: null, imagePreview: null });
    setDescriptionCount(0);
    setStep('form');
    setView('list');
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Apagar este anúncio permanentemente?")) {
        const updated = ads.filter(a => a.id !== id);
        localStorage.setItem('txova_my_ads', JSON.stringify(updated));
        setAds(updated);
    }
  };

  const handleRenew = (ad: AdContent) => {
      // Mock renewal logic - normally would go to payment flow
      if(window.confirm(`Renovar "${ad.title}" por mais 30 dias? (Simulação de Pagamento)`)) {
          const updatedAd = {
              ...ad,
              status: 'active' as const,
              expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
          };
          saveAd(updatedAd);
          setAds(getMyAds()); // Refresh
      }
  };

  const validateForm = () => {
      if(!newAd.title || !newAd.description || !newAd.whatsapp || !newAd.image) {
          alert("Todos os campos são obrigatórios.");
          return false;
      }
      if(newAd.description.length < 10) {
          alert("Descrição muito curta.");
          return false;
      }
      return true;
  };

  const handlePayment = () => {
      if(paymentPhone.length < 9) {
          alert("Insira um número válido para pagamento.");
          return;
      }
      
      setIsProcessing(true);
      
      // Simulate API Call
      setTimeout(() => {
          const planDetails = AD_PLANS.find(p => p.id === selectedPlan)!;
          
          const createdAd: AdContent = {
              id: `ad-${Date.now()}`,
              userId: 'me',
              type: 'BUSINESS',
              plan: selectedPlan,
              title: newAd.title,
              description: newAd.description,
              whatsappNumber: newAd.whatsapp,
              ctaLink: `https://wa.me/258${newAd.whatsapp.replace(/\D/g, '')}`,
              imageUrl: newAd.imagePreview || '', // In real app, this is the S3 URL
              status: 'active',
              createdAt: Date.now(),
              expiresAt: Date.now() + (planDetails.days * 24 * 60 * 60 * 1000),
              views: 0,
              clicks: 0
          };

          saveAd(createdAd);
          setAds(getMyAds());
          setIsProcessing(false);
          alert("Pagamento Confirmado! Seu anúncio está online.");
          resetForm();
      }, 3000);
  };

  if (view === 'create') {
      return (
          <div className="p-4 h-full flex flex-col">
             <div className="flex items-center gap-3 mb-6">
                 <button onClick={resetForm} className="text-gray-500 font-bold text-sm">Cancelar</button>
                 <h2 className="flex-1 text-center font-heading font-bold text-lg text-gray-800">
                     {step === 'form' ? 'Criar Anúncio' : step === 'plan' ? 'Escolher Plano' : 'Pagamento'}
                 </h2>
                 <div className="w-16"></div> {/* Spacer */}
             </div>

             {/* STEP 1: FORM */}
             {step === 'form' && (
                 <div className="flex-1 overflow-y-auto space-y-4 pb-20">
                    <Input 
                        label="Nome do Negócio" 
                        placeholder="Ex: Restaurante Sabores" 
                        value={newAd.title}
                        onChange={e => setNewAd({...newAd, title: e.target.value})}
                    />
                    
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Descrição</label>
                            <span className={`text-xs font-medium ${descriptionCount >= 500 ? 'text-red-500' : 'text-gray-400'}`}>
                                {descriptionCount}/500
                            </span>
                        </div>
                        <textarea 
                            className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-brand-blue min-h-[120px] resize-none"
                            placeholder="Descreva seus produtos e serviços..."
                            value={newAd.description}
                            onChange={(e) => {
                                if(e.target.value.length <= 500) {
                                    setNewAd({...newAd, description: e.target.value});
                                    setDescriptionCount(e.target.value.length);
                                }
                            }}
                        />
                    </div>

                    <Input 
                        label="Número WhatsApp" 
                        placeholder="Ex: 841234567" 
                        type="tel"
                        icon={<MessageCircle size={18} />}
                        value={newAd.whatsapp}
                        onChange={e => setNewAd({...newAd, whatsapp: e.target.value})}
                    />
                    
                    <ImageUpload 
                        label="Imagem do Anúncio" 
                        previewUrl={newAd.imagePreview}
                        onImageSelect={(file) => setNewAd({...newAd, image: file, imagePreview: URL.createObjectURL(file)})}
                    />

                    <Button onClick={() => { if(validateForm()) setStep('plan'); }} className="mt-4">
                        Continuar
                    </Button>
                 </div>
             )}

             {/* STEP 2: PLAN SELECTION */}
             {step === 'plan' && (
                 <div className="flex-1 overflow-y-auto space-y-4 pb-20">
                     <p className="text-center text-gray-500 text-sm mb-4">Selecione o nível de destaque.</p>
                     
                     {AD_PLANS.map(plan => (
                         <div 
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPlan === plan.id ? 'border-brand-pink bg-pink-50 ring-1 ring-brand-pink' : plan.color}`}
                         >
                            {plan.id === 'top' && (
                                <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                    RECOMENDADO
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-gray-800">{plan.name}</h3>
                                <div className="text-brand-pink font-bold text-lg">{plan.price} MT</div>
                            </div>
                            <ul className="space-y-2">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                                        <Check size={12} className="text-green-500" /> {feat}
                                    </li>
                                ))}
                            </ul>
                         </div>
                     ))}
                     
                     <Button onClick={() => setStep('payment')} className="mt-4">
                        Pagar {AD_PLANS.find(p => p.id === selectedPlan)?.price} MT
                     </Button>
                 </div>
             )}

             {/* STEP 3: PAYMENT */}
             {step === 'payment' && (
                 <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                     {isProcessing ? (
                         <div className="text-center">
                             <div className="w-20 h-20 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                             <h3 className="text-xl font-bold text-gray-800 mb-2">Processando...</h3>
                             <p className="text-gray-500">Confirme a transação no seu telemóvel.</p>
                         </div>
                     ) : (
                         <>
                             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 text-center">
                                 <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Total a Pagar</p>
                                 <div className="text-3xl font-bold text-gray-900 mb-4">{AD_PLANS.find(p => p.id === selectedPlan)?.price} MT</div>
                                 <div className="flex justify-center gap-2">
                                     <button 
                                        onClick={() => setPaymentProvider('mpesa')}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-colors ${paymentProvider === 'mpesa' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400'}`}
                                     >
                                         M-Pesa
                                     </button>
                                     <button 
                                        onClick={() => setPaymentProvider('emola')}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-colors ${paymentProvider === 'emola' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-400'}`}
                                     >
                                         e-Mola
                                     </button>
                                 </div>
                             </div>

                             <Input 
                                label="Número para Pagamento"
                                placeholder={`8${paymentProvider === 'mpesa' ? '4/5' : '6/7'}...`}
                                value={paymentPhone}
                                onChange={e => setPaymentPhone(e.target.value)}
                                type="tel"
                             />
                             
                             <Button onClick={handlePayment} className="mt-6">
                                 Confirmar Pagamento
                             </Button>
                             <p className="text-center text-[10px] text-gray-400 mt-4">
                                 Ambiente seguro. Não guardamos seu PIN.
                             </p>
                         </>
                     )}
                 </div>
             )}
          </div>
      );
  }

  // LIST VIEW (Dashboard)
  return (
    <div className="p-4 pt-6 h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
            <h2 className="text-2xl font-heading font-bold text-gray-800">Meus Anúncios</h2>
            <p className="text-sm text-gray-500">Gerencie suas publicações.</p>
        </div>
        <Button 
            className="w-auto px-4 py-2 text-xs" 
            onClick={() => setView('create')}
        >
            <Plus size={16} /> Criar Novo
        </Button>
      </div>

      {ads.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <Megaphone className="text-gray-300 mb-4" size={48} />
               <h3 className="font-bold text-lg text-gray-800 mb-2">Sem Anúncios Ativos</h3>
               <p className="text-gray-500 text-sm mb-6 max-w-[250px]">
                   Promova o seu negócio para milhares de pessoas em Moçambique.
               </p>
               <Button onClick={() => setView('create')} className="w-auto px-8">
                   Começar Agora
               </Button>
           </div>
      ) : (
          <div className="flex-1 overflow-y-auto pb-20">
              {ads.map(ad => (
                  <AdCardItem 
                    key={ad.id} 
                    ad={ad} 
                    onDelete={() => handleDelete(ad.id)}
                    onRenew={() => handleRenew(ad)}
                  />
              ))}
          </div>
      )}
    </div>
  );
};