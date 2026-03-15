import React, { useState, useEffect } from 'react';
import { walletService } from '../services/wallet';
import { COIN_PACKAGES } from '../constants';
import { Button } from '../components/ui';
import { Coins, History, Zap, CheckCircle, X } from 'lucide-react';
import { Transaction, CoinPackage } from '../types';

export const WalletPage: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'e-Mola'>('M-Pesa');
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const WHATSAPP_ADMIN_NUMBER = "258849696473";

  useEffect(() => {
    refreshWallet();
  }, []);

  const refreshWallet = () => {
    setBalance(walletService.getBalance());
    setHistory(walletService.getTransactions());
  };

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handlePurchase = () => {
     if (!selectedPackage) return;
     if (!email || !email.includes('@')) {
         alert("Por favor, insira um email válido.");
         return;
     }

     // Construct WhatsApp Message
     const message = `Olá, quero comprar ${selectedPackage.label} (${selectedPackage.coins} TxCoins) por ${selectedPackage.price} MT via ${paymentMethod}. Meu email é ${email}.`;
     const whatsappUrl = `https://wa.me/${WHATSAPP_ADMIN_NUMBER}?text=${encodeURIComponent(message)}`;

     // Redirect to WhatsApp
     window.open(whatsappUrl, '_blank');
     
     // Close modal
     setIsModalOpen(false);
     setEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
       {/* HEADER */}
       <div className="bg-brand-dark text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <Coins size={180} />
          </div>
          
          <div className="relative z-10">
            <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Saldo Disponível</p>
            <div className="flex items-baseline gap-2 mb-4">
               <h1 className="text-5xl font-heading font-bold text-white">{balance}</h1>
               <span className="text-xl font-bold text-brand-pink">TxCoins</span>
            </div>
            
            <div className="flex gap-2">
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium border border-white/10">
                    <Zap size={12} className="text-yellow-400" /> Destaques
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium border border-white/10">
                    <Zap size={12} className="text-brand-pink" /> Presentes
                </div>
            </div>
          </div>
       </div>

       <div className="p-4 space-y-6">
           {/* PACKAGES */}
           <div>
               <h2 className="font-heading font-bold text-lg text-gray-800 mb-3 px-1">Pacotes de Moedas</h2>
               <div className="grid grid-cols-1 gap-3">
                  {COIN_PACKAGES.map(pkg => (
                      <div 
                         key={pkg.id} 
                         onClick={() => handleSelectPackage(pkg)}
                         className={`relative bg-white p-4 rounded-2xl border-2 cursor-pointer transition-all shadow-sm active:scale-95 ${pkg.isPopular ? 'border-brand-pink ring-2 ring-brand-pink/20' : 'border-transparent hover:border-gray-200'}`}
                      >
                          {pkg.isPopular && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-pink text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                                  Mais Popular
                              </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${pkg.isPopular ? 'bg-brand-pink/10 text-brand-pink' : 'bg-gray-100 text-gray-500'}`}>
                                     <Coins size={24} />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{pkg.coins} TxCoins</h3>
                                      <p className="text-xs text-gray-500 font-medium">{pkg.label}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className="block font-bold text-gray-900 text-lg">{pkg.price} MT</span>
                              </div>
                          </div>
                      </div>
                  ))}
               </div>
           </div>

           {/* HISTORY */}
           <div>
               <h2 className="font-heading font-bold text-lg text-gray-800 mb-3 px-1 flex items-center gap-2">
                   <History size={18} /> Histórico
               </h2>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                   {history.length === 0 ? (
                       <div className="p-8 text-center text-gray-400 text-sm">Sem transações recentes.</div>
                   ) : (
                       history.slice(0, 5).map(tx => (
                           <div key={tx.id} className="p-4 border-b border-gray-50 flex justify-between items-center last:border-0 hover:bg-gray-50 transition-colors">
                               <div>
                                   <p className="font-bold text-sm text-gray-800">{tx.description}</p>
                                   <p className="text-[10px] text-gray-400 uppercase tracking-wide">{new Date(tx.timestamp).toLocaleDateString()}</p>
                               </div>
                               <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                   {tx.amount > 0 ? '+' : ''}{tx.amount}
                               </span>
                           </div>
                       ))
                   )}
               </div>
           </div>
       </div>

       {/* PURCHASE MODAL */}
       {isModalOpen && selectedPackage && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                   <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                       <h3 className="font-bold text-gray-800">Confirmar Compra</h3>
                       <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                           <X size={20} className="text-gray-500" />
                       </button>
                   </div>
                   
                   <div className="p-6 space-y-6">
                       <div className="text-center">
                           <p className="text-gray-500 text-sm mb-1">Você está comprando</p>
                           <h2 className="text-3xl font-black text-brand-dark mb-1">{selectedPackage.coins} TxCoins</h2>
                           <p className="text-brand-pink font-bold text-xl">{selectedPackage.price} MT</p>
                       </div>

                       <div className="space-y-3">
                           <label className="block text-sm font-bold text-gray-700">Método de Pagamento</label>
                           <div className="grid grid-cols-2 gap-3">
                               <button 
                                  onClick={() => setPaymentMethod('M-Pesa')}
                                  className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'M-Pesa' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                               >
                                   <span className="font-bold text-sm">M-Pesa</span>
                               </button>
                               <button 
                                  onClick={() => setPaymentMethod('e-Mola')}
                                  className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'e-Mola' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                               >
                                   <span className="font-bold text-sm">e-Mola</span>
                               </button>
                           </div>
                       </div>

                       <div className="space-y-2">
                           <label className="block text-sm font-bold text-gray-700">Seu Email</label>
                           <input 
                              type="email" 
                              placeholder="exemplo@email.com"
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                           />
                           <p className="text-[10px] text-gray-400">Necessário para confirmação manual.</p>
                       </div>

                       <Button onClick={handlePurchase} className="w-full py-4 text-lg shadow-xl shadow-brand-pink/20">
                           Pagar Agora
                       </Button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};