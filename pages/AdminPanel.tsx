import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletService } from '../services/wallet';
import { MOCK_PROFILES, MOCK_ADS } from '../constants';
import { UserProfile, Transaction, AdContent } from '../types';
import { 
  Users, Coins, AlertTriangle, CheckCircle, XCircle, Search, LogOut, 
  LayoutDashboard, MessageSquare, ShieldAlert, Ban, PlusCircle, Activity,
  ShoppingCart, DollarSign, Menu, X
} from 'lucide-react';
import { Modal, Button, Input } from '../components/ui';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions' | 'requests' | 'ads'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Modals
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('txova_token');
    if (!token) return navigate('/');

    try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        if (activeTab === 'dashboard') {
            const res = await fetch('/api/admin/dashboard', { headers });
            if (res.ok) setStats((await res.json()).stats);
        } else if (activeTab === 'users') {
            const res = await fetch('/api/admin/users', { headers });
            if (res.ok) setUsers(await res.json());
        } else if (activeTab === 'requests') {
            const res = await fetch('/api/admin/purchase-requests', { headers });
            if (res.ok) setRequests(await res.json());
        }
    } catch (err) {
        console.error("Admin fetch error", err);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem('txova_token');
    
    await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banReason, duration: 'permanent' })
    });
    
    setIsBanModalOpen(false);
    fetchData();
    alert('Utilizador banido.');
  };

  const handleAddCoins = async () => {
      if (!selectedUser || !coinAmount) return;
      const token = localStorage.getItem('txova_token');

      await fetch(`/api/admin/users/${selectedUser.id}/add-coins`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: coinAmount })
      });

      setIsCoinModalOpen(false);
      setCoinAmount('');
      fetchData();
      alert('Moedas adicionadas.');
  };

  const handleVerifyUser = async (userId: string) => {
      const token = localStorage.getItem('txova_token');
      await fetch(`/api/admin/users/${userId}/verify`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
  };

  const handleRequestAction = async (reqId: string, action: 'confirm' | 'reject') => {
      const token = localStorage.getItem('txova_token');
      await fetch(`/api/admin/purchase-requests/${reqId}/confirm`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
      });
      fetchData();
  };

  const handleTestCreateRequest = async () => {
      const token = localStorage.getItem('txova_token');
      await fetch('/api/admin/test/create-request', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
      alert('Pedido de teste criado!');
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <div className={`bg-gray-900 text-white w-64 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64'} fixed h-full z-20 md:relative md:translate-x-0`}>
          <div className="p-6 flex justify-between items-center">
              <h1 className="text-xl font-bold font-heading text-brand-pink">Txova Admin</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X size={20} /></button>
          </div>
          
          <nav className="mt-4 px-2 space-y-1">
              <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <SidebarItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={20} />} label="Utilizadores" />
              <SidebarItem active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={<ShoppingCart size={20} />} label="Pedidos WhatsApp" />
              <SidebarItem active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} icon={<AlertTriangle size={20} />} label="Anúncios" />
              <SidebarItem active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<Activity size={20} />} label="Transações" />
              
              <div className="pt-8 mt-8 border-t border-gray-800">
                  <p className="px-4 text-xs text-gray-500 uppercase mb-2">Sistema</p>
                  <button onClick={() => navigate('/feed')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                      <LogOut size={20} /> Sair
                  </button>
              </div>
          </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white shadow-sm p-4 flex items-center justify-between">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600"><Menu /></button>
              <h2 className="text-lg font-bold text-gray-800 capitalize">{activeTab}</h2>
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center text-white font-bold">A</div>
              </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
              
              {/* DASHBOARD */}
              {activeTab === 'dashboard' && stats && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <StatCard title="Total Usuários" value={stats.totalUsers} icon={<Users className="text-blue-500" />} />
                          <StatCard title="Moedas Vendidas" value={stats.totalCoinsSold} icon={<Coins className="text-yellow-500" />} />
                          <StatCard title="Anúncios Ativos" value={stats.activeAds} icon={<AlertTriangle className="text-purple-500" />} />
                          <StatCard title="Receita Estimada" value={`${stats.estimatedRevenue} MT`} icon={<DollarSign className="text-green-500" />} />
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <h3 className="font-bold text-gray-800 mb-4">Ações Rápidas (Modo Teste)</h3>
                          <div className="flex gap-4">
                              <button onClick={handleTestCreateRequest} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                  Simular Pedido de Compra
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {/* USERS */}
              {activeTab === 'users' && (
                  <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-2">
                          <Search className="text-gray-400" />
                          <input 
                              className="w-full outline-none text-gray-700"
                              placeholder="Pesquisar utilizadores..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                          />
                      </div>

                      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                          <table className="w-full text-left">
                              <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                                  <tr>
                                      <th className="p-4">Utilizador</th>
                                      <th className="p-4">Status</th>
                                      <th className="p-4">Saldo</th>
                                      <th className="p-4 text-right">Ações</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {filteredUsers.map(user => (
                                      <tr key={user.id} className="hover:bg-gray-50">
                                          <td className="p-4">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                                      {user.photoUrl && <img src={user.photoUrl} className="w-full h-full object-cover" />}
                                                  </div>
                                                  <div>
                                                      <p className="font-bold text-gray-800">{user.name}</p>
                                                      <p className="text-xs text-gray-500">{user.email || user.phone}</p>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                  {user.isVerified ? 'Verificado' : 'Não Verificado'}
                                              </span>
                                              {user.isBanned && <span className="ml-2 px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">BANIDO</span>}
                                          </td>
                                          <td className="p-4 font-mono text-sm">{user.coins || 0} Tx</td>
                                          <td className="p-4 text-right space-x-2">
                                              <button onClick={() => handleVerifyUser(user.id)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg" title="Verificar">
                                                  <CheckCircle size={16} />
                                              </button>
                                              <button onClick={() => { setSelectedUser(user); setIsCoinModalOpen(true); }} className="text-yellow-600 hover:bg-yellow-50 p-2 rounded-lg" title="Adicionar Moedas">
                                                  <PlusCircle size={16} />
                                              </button>
                                              <button onClick={() => { setSelectedUser(user); setIsBanModalOpen(true); }} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="Banir">
                                                  <Ban size={16} />
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* REQUESTS */}
              {activeTab === 'requests' && (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                              <tr>
                                  <th className="p-4">Utilizador</th>
                                  <th className="p-4">Pacote</th>
                                  <th className="p-4">Valor</th>
                                  <th className="p-4">Método</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-right">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {requests.map(req => (
                                  <tr key={req.id} className="hover:bg-gray-50">
                                      <td className="p-4 font-medium text-gray-800">{req.userName}</td>
                                      <td className="p-4 text-sm">{req.package} ({req.coins} Tx)</td>
                                      <td className="p-4 font-bold text-gray-800">{req.amount} MT</td>
                                      <td className="p-4 text-sm text-gray-500">{req.method}</td>
                                      <td className="p-4">
                                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold 
                                              ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                                req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                                'bg-yellow-100 text-yellow-700'}`}>
                                              {req.status === 'approved' ? 'Aprovado' : req.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                          </span>
                                      </td>
                                      <td className="p-4 text-right space-x-2">
                                          {req.status === 'pending' && (
                                              <>
                                                  <button onClick={() => handleRequestAction(req.id, 'confirm')} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors text-xs font-bold border border-green-200 px-2">
                                                      Confirmar
                                                  </button>
                                                  <button onClick={() => handleRequestAction(req.id, 'reject')} className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors text-xs font-bold border border-red-200 px-2">
                                                      Recusar
                                                  </button>
                                              </>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                              {requests.length === 0 && (
                                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">Nenhum pedido pendente.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              )}

              {/* ADS */}
              {activeTab === 'ads' && (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                      <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-bold text-gray-800">Gestão de Anúncios</h3>
                      <p>Funcionalidade em desenvolvimento.</p>
                  </div>
              )}
          </main>
      </div>

      {/* MODALS */}
      <Modal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} title="Adicionar Moedas">
          <div className="space-y-4">
              <p className="text-sm text-gray-600">Adicionar saldo para <b>{selectedUser?.name}</b></p>
              <Input label="Quantidade" type="number" value={coinAmount} onChange={e => setCoinAmount(e.target.value)} placeholder="Ex: 500" />
              <Button onClick={handleAddCoins}>Confirmar</Button>
          </div>
      </Modal>

      <Modal isOpen={isBanModalOpen} onClose={() => setIsBanModalOpen(false)} title="Banir Utilizador">
          <div className="space-y-4">
              <p className="text-sm text-red-600 font-bold">Atenção: Esta ação impedirá o acesso do utilizador.</p>
              <Input label="Motivo do Banimento" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Ex: Perfil falso" />
              <Button onClick={handleBanUser} className="bg-red-600 hover:bg-red-700">Banir Permanentemente</Button>
          </div>
      </Modal>
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${active ? 'bg-brand-pink text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const StatCard = ({ title, value, icon }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-xl">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);
