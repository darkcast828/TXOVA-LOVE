import React, { useState, useEffect } from 'react';
import { walletService } from '../services/wallet';
import { COIN_PACKAGES } from '../constants';
import { Button, Modal, Input } from '../components/ui';
import { Coins, CreditCard, History, ChevronRight, Zap } from 'lucide-react';
import { Transaction } from '../types';

export const WalletPage: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'input' | 'processing'>('select');
  const [paymentProvider, setPaymentProvider] = useState<'mpesa' | 'emola'>('mpesa');
  const [phone, setPhone] = useState('');

  const WHATSAPP_ADMIN_NUMBER = "258849696473";

  useEffect(() => {
    refreshWallet();
  }, []);

  const refreshWallet = () => {
    setBalance(walletService.getBalance());
    setHistory(walletService.getTransactions());
  };

  const handlePurchase = () => {
     if (phone.length < 9) {
         alert("Número inválido.");
         return;
     }
     
     setPaymentStep('processing');
     const pkg = COIN_PACKAGES.find(p => p.id === selectedPackage);
     
     if (!pkg) return;

     const method = paymentProvider === 'mpesa' ? 'M-Pesa' : 'e-Mola';
     const totalCoins = pkg.coins + pkg.bonus;
     
     // Construct WhatsApp Message
     const message = `Olá, quero comprar ${pkg.coins} TxCoins por ${pkg.price} MT via ${method}. O meu número é ${phone}.`;
     const whatsappUrl = `https://wa.me/${WHATSAPP_ADMIN_NUMBER}?text=${encodeURIComponent(message)}`;

     // Simulate processing delay then redirect
     setTimeout(() => {
         window.open(whatsappUrl, '_blank');
         
         // For demo purposes, we verify the transaction locally so the user can test the app
         walletService.addCoins(totalCoins, `Compra: ${pkg.coins} + ${pkg.bonus} Bónus (Pendente Aprovação)`);
         refreshWallet();
         
         alert(`Pedido enviado para o WhatsApp! As moedas foram adicionadas provisoriamente.`);
         
         // Reset UI
         setPaymentStep('select');
         setSelectedPackage(null);
         setPhone('');
     }, 1500);
  };

  return (
    <div className="p-4 pb-24">
       {/* BALANCE HEADER */}
       <div className="bg-gradient-to-r from-brand-dark to-gray-900 rounded-3xl p-6 text-white mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Coins size={120} />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Saldo Atual</p>
          <div className="flex items-baseline gap-2">
             <h1 className="text-5xl font-heading font-bold">{balance}</h1>
             <span className="text-xl font-bold text-yellow-400">TxCoins</span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-full">
             <Zap size={14} className="text-yellow-400" />
             <span>Use para Destaques e Presentes</span>
          </div>
       </div>

       {/* PACKAGES */}
       <h2 className="font-heading font-bold text-xl text-gray-800 mb-4">Carregar Carteira</h2>
       <div className="grid grid-cols-1 gap-4 mb-8">
          {COIN_PACKAGES.map(pkg => (
              <div 
                 key={pkg.id} 
                 onClick={() => { setSelectedPackage(pkg.id); setPaymentStep('input'); }}
                 className="bg-white p-4 rounded-2xl border-2 border-gray-100 hover:border-yellow-400 cursor-pointer transition-all shadow-sm relative group"
              >
                  {pkg.bonus > 0 && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-xl">
                          +{pkg.bonus} BÓNUS
                      </div>
                  )}
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                             <Coins size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-800 text-lg">{pkg.coins} <span className="text-sm font-normal text-gray-500">TxCoins</span></h3>
                              {pkg.label && <p className="text-xs text-green-600 font-bold">{pkg.label}</p>}
                          </div>
                      </div>
                      <div className="text-right">
                          <span className="block font-bold text-brand-pink text-lg">{pkg.price} MT</span>
                      </div>
                  </div>
              </div>
          ))}
       </div>

       {/* HISTORY */}
       <div className="mb-4">
           <h2 className="font-heading font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
               <History size={20} /> Histórico
           </h2>
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               {history.length === 0 ? (
                   <div className="p-8 text-center text-gray-400 text-sm">Sem transações recentes.</div>
               ) : (
                   history.slice(0, 5).map(tx => (
                       <div key={tx.id} className="p-4 border-b border-gray-50 flex justify-between items-center last:border-0">
                           <div>
                               <p className="font-bold text-sm text-gray-800">{tx.description}</p>
                               <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                           </div>
                           <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                               {tx.amount > 0 ? '+' : ''}{tx.amount}
                           </span>
                       </div>
                   ))
               )}
           </div>
       </div>

       {/* PAYMENT MODAL */}
       <Modal 
         isOpen={!!selectedPackage} 
         onClose={() => { setSelectedPackage(null); setPaymentStep('select'); }}
         title="Comprar Moedas"
       >
         {paymentStep === 'input' && (
             <div className="space-y-6">
                 <div className="text-center mb-2">
                     <p className="text-gray-500 text-sm">Pacote Selecionado</p>
                     <h3 className="font-bold text-2xl text-brand-pink">{COIN_PACKAGES.find(p => p.id === selectedPackage)?.price} MT</h3>
                 </div>
                 
                 <div className="flex gap-4">
                     <button 
                        onClick={() => setPaymentProvider('mpesa')} 
                        className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-1 ${paymentProvider === 'mpesa' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'}`}
                     >
                         <span className="font-bold">M-Pesa</span>
                     </button>
                     <button 
                        onClick={() => setPaymentProvider('emola')} 
                        className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-1 ${paymentProvider === 'emola' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}
                     >
                         <span className="font-bold">e-Mola</span>
                     </button>
                 </div>

                 <Input 
                    label="Número de Telemóvel" 
                    placeholder="84/85 xxx xxxx"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                 />
                 
                 <Button onClick={handlePurchase}>Pagar Agora</Button>
                 <p className="text-[10px] text-gray-400 text-center">Serás redirecionado para o WhatsApp para concluir.</p>
             </div>
         )}
         
         {paymentStep === 'processing' && (
             <div className="py-12 flex flex-col items-center text-center">
                 <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-6"></div>
                 <h3 className="font-bold text-lg text-gray-800 mb-2">A redirecionar...</h3>
                 <p className="text-gray-500 text-sm">A abrir WhatsApp para pagamento.</p>
             </div>
         )}
       </Modal>
    </div>
  );
};