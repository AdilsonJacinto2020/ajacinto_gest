export interface CartItem {
  id: string;
  catalogId: string;
  operator: "UNITEL" | "AFRICELL" | "ZAP" | "DSTV";
  name: string;
  category: string;
  price: number;
  recipient: string;
  quantity: number;
}

export interface SalePointState {
  id: string;
  name: string;
  location: string;
  currentCashBalance: number;
  isOpen: boolean;
  assignedOperatorName?: string | null;
  currentOperatorName: string | null;
}

export interface CashExpenseRecord {
  id: string;
  salePointId: string;
  amount: number;
  reason: string;
  operatorName: string;
  createdAt: string;
}

export interface WalletState {
  id: string;
  type: "MSELLER" | "AFRIMONEY" | "TELPLAY_ZAP" | "CAIXA_GERAL";
  name: string;
  balance: number;
}

export interface TransferRecord {
  id: string;
  originName: string;
  destinationName: string;
  amount: number;
  createdAt: string;
  transferredBy: string;
}
