const STORAGE_KEYS = {
  TRANSACTION_HISTORY: 'plugit_transaction_history',
  SETTINGS: 'plugit_settings',
};

export interface TransactionRecord {
  id: string;
  txHash: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  fromChain: number;
  toChain: number;
  aggregator: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  explorerUrl: string;
}

export interface UserSettings {
  preferredAggregator: 'squid' | 'paraswap' | 'auto';
  slippage: number;
  defaultFromChain: number;
  defaultToChain: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  preferredAggregator: 'auto',
  slippage: 1,
  defaultFromChain: 1, // Ethereum
  defaultToChain: 137, // Polygon
};

export function getTransactionHistory(): TransactionRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTION_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading transaction history:', error);
    return [];
  }
}

export function saveTransaction(transaction: TransactionRecord): void {
  try {
    const history = getTransactionHistory();
    history.unshift(transaction);
    // Keep only last 100 transactions
    const limited = history.slice(0, 100);
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTION_HISTORY,
      JSON.stringify(limited)
    );
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
}

export function updateTransactionStatus(
  txHash: string,
  status: TransactionRecord['status']
): void {
  try {
    const history = getTransactionHistory();
    const updated = history.map((tx) =>
      tx.txHash === txHash ? { ...tx, status } : tx
    );
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTION_HISTORY,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error('Error updating transaction status:', error);
  }
}

export function getSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<UserSettings>): void {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

