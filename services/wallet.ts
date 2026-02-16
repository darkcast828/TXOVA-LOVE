import { Transaction } from '../types';

const BALANCE_KEY = 'txova_wallet_balance';
const TRANSACTIONS_KEY = 'txova_wallet_transactions';

export const walletService = {
  getBalance: (): number => {
    const bal = localStorage.getItem(BALANCE_KEY);
    return bal ? parseInt(bal) : 0;
  },

  getTransactions: (): Transaction[] => {
    const txs = localStorage.getItem(TRANSACTIONS_KEY);
    return txs ? JSON.parse(txs) : [];
  },

  addCoins: (amount: number, description: string) => {
    const current = walletService.getBalance();
    const newBalance = current + amount;
    localStorage.setItem(BALANCE_KEY, newBalance.toString());
    
    walletService.recordTransaction({
        id: `tx-${Date.now()}`,
        type: 'purchase',
        amount,
        description,
        timestamp: Date.now()
    });

    // Notify user via alert (mock)
    // alert(`Recebeste ${amount} TxCoins! Novo saldo: ${newBalance}`);
    return newBalance;
  },

  spendCoins: (amount: number, description: string): boolean => {
    const current = walletService.getBalance();
    if (current < amount) return false;

    const newBalance = current - amount;
    localStorage.setItem(BALANCE_KEY, newBalance.toString());

    walletService.recordTransaction({
        id: `tx-${Date.now()}`,
        type: 'gift_sent',
        amount: -amount,
        description,
        timestamp: Date.now()
    });

    return true;
  },

  recordTransaction: (tx: Transaction) => {
    const txs = walletService.getTransactions();
    txs.unshift(tx); // Newest first
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  }
};