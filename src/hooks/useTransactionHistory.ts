import { useState, useEffect } from 'react';
import {
  getTransactionHistory,
  updateTransactionStatus,
  type TransactionRecord,
} from '../services/storage';

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setLoading(true);
    const history = getTransactionHistory();
    setTransactions(history);
    setLoading(false);
  };

  const addTransaction = (transaction: TransactionRecord) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const updateStatus = (txHash: string, status: TransactionRecord['status']) => {
    updateTransactionStatus(txHash, status);
    setTransactions((prev) =>
      prev.map((tx) => (tx.txHash === txHash ? { ...tx, status } : tx))
    );
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateStatus,
    refresh: loadHistory,
  };
}

