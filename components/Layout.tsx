import React, { useState, useEffect } from 'react';
import { User, Heart, MessageCircle, GalleryVerticalEnd, Download, Megaphone, LogOut, Coins } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("Para instalar, use a opção 'Adicionar ao Ecrã Principal' do seu navegador.");
    }
  };

  if (location.pathname === '/' || location.pathname === '/onboarding') {
    return <main className="min-h-screen bg-white">{children}</main>;
  }

  const isChatScreen = location.pathname.startsWith('/chat/');

  const navItems = [
    { icon: <GalleryVerticalEnd size={24} />, label: 'Descobrir', path: '/feed' },
    { icon: <Heart size={24} />, label: 'Gostos', path: '/likes' },
    { icon: <MessageCircle size={24} />, label: 'Chat', path: '/messages' },
    { icon: <Coins size={24} />, label: 'Carteira', path: '/wallet' }, // CHANGED
    { icon: <User size={24} />, label: 'Perfil', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 h-screen sticky top-0 z-50">
        <div className="p-6">
           <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-white font-bold text-xl">T</div>
            <h1 className="font-heading font-bold text-2xl tracking-tight text-brand-dark">Txova<span className="text-brand-pink">Love</span></h1>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
               const isActive = location.pathname === item.path;
               return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-brand-pink/10 text-brand-pink' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {item.icon}
                  <span className="text-base">{item.label}</span>
                </Link>
               )
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 space-y-4">
           {deferredPrompt && (
             <button 
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors"
             >
               <Download size={18} />
               Instalar App
             </button>
           )}
           
           <button 
             onClick={() => authService.logout()}
             className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium"
           >
             <LogOut size={18} />
             Terminar Sessão
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header */}
        {!isChatScreen && (
          <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center text-white font-bold">T</div>
              <h1 className="font-heading font-bold text-xl tracking-tight text-brand-dark">Txova<span className="text-brand-pink">Love</span></h1>
            </div>
            {deferredPrompt && (
              <button onClick={handleInstallClick} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full font-bold">
                Instalar
              </button>
            )}
          </header>
        )}

        {/* Scrollable Content */}
        <main className={`flex-1 overflow-y-auto no-scrollbar bg-gray-50/50 ${isChatScreen ? 'pb-0' : 'pb-24 lg:pb-0'}`}>
          <div className="max-w-3xl mx-auto w-full h-full lg:p-6 lg:h-auto">
             <div className="bg-white lg:rounded-3xl lg:shadow-xl lg:min-h-[calc(100vh-3rem)] lg:border border-gray-200 overflow-hidden relative min-h-full">
                {children}
             </div>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        {!isChatScreen && (
          <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 pb-safe flex justify-between items-center z-40 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-brand-pink' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 22 })}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </div>
  );
};