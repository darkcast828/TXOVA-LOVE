import React, { useState } from 'react';
import { PREMIUM_PLANS } from '../constants';
import { Button, Input, Modal, Badge } from '../components/ui';
import { Check, Star, Shield, Zap } from 'lucide-react';

export const Premium: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'input' | 'processing'>('select');
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState<'mpesa' | 'emola'>('mpesa');

  const initiatePayment = () => {
    if (phone.length < 9) {
      alert("Insira um número válido");
      return;
    }
    setPaymentStep('processing');
    
    // Simulate USSD Push
    setTimeout(() => {
      alert(`Um pop-up do ${provider === 'mpesa' ? 'M-Pesa' : 'e-Mola'} foi enviado para o número ${phone}. Por favor, confirme com o seu PIN.`);
      setPaymentStep('select');
      setSelectedPlan(null);
      setPhone('');
    }, 3000);
  };

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">Txova <span className="text-brand-pink">Premium</span></h2>
        <p className="text-gray-500 text-sm">Destaque-se e encontre o amor mais rápido.</p>
      </div>

      <div className="space-y-6 mb-12">
        {PREMIUM_PLANS.map((plan) => (
          <div key={plan.id} className="border-2 border-brand-pink/10 rounded-2xl p-6 relative overflow-hidden bg-white shadow-sm">
            {plan.id === 'monthly' && (
              <div className="absolute top-0 right-0 bg-brand-pink text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                MAIS POPULAR
              </div>
            )}
            <h3 className="font-heading font-bold text-xl text-gray-800">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold text-brand-pink">{plan.price} MT</span>
              <span className="text-gray-400 text-sm"> / {plan.duration}</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="bg-green-100 p-1 rounded-full text-green-600">
                    <Check size={12} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Button onClick={() => { setSelectedPlan(plan.id); setPaymentStep('input'); }}>
              Ativar Agora
            </Button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      <Modal 
        isOpen={!!selectedPlan} 
        onClose={() => { setSelectedPlan(null); setPaymentStep('select'); }} 
        title="Pagamento Seguro"
      >
        {paymentStep === 'input' && (
          <div className="space-y-6">
             <div className="flex gap-4">
                <button 
                  onClick={() => setProvider('mpesa')}
                  className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${provider === 'mpesa' ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}
                >
                  <div className="font-bold text-red-600">M-Pesa</div>
                </button>
                <button 
                  onClick={() => setProvider('emola')}
                  className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${provider === 'emola' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}
                >
                  <div className="font-bold text-orange-600">e-Mola</div>
                </button>
             </div>

             <Input 
                label="Número de Telefone" 
                placeholder={`8${provider === 'mpesa' ? '4/5' : '6/7'} xxx xxxx`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
             />

             <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
               Ao confirmar, receberás um pop-up no teu telemóvel para inserir o PIN. Não guardamos o teu PIN.
             </div>

             <Button onClick={initiatePayment}>Pagar {PREMIUM_PLANS.find(p => p.id === selectedPlan)?.price} MT</Button>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="py-12 flex flex-col items-center text-center">
             <div className="w-16 h-16 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mb-6"></div>
             <h3 className="font-bold text-lg text-gray-800 mb-2">A aguardar confirmação...</h3>
             <p className="text-gray-500 text-sm">Verifica o teu telemóvel e insere o PIN do {provider === 'mpesa' ? 'M-Pesa' : 'e-Mola'}.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};