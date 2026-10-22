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
  reason?: string;
}

export interface BalanceAdjustmentRecord {
  id: string;
  targetType: "SALE_POINT" | "WALLET";
  targetId?: string;
  targetName: string;
  previousBalance: number;
  newBalance: number;
  difference: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

export interface ShiftCloseReport {
  pointName: string;
  operatorName: string;
  openedAt?: string;
  closedAt: string;
  openingCash: number;
  calculatedCash: number;
  declaredCash: number;
  difference: number;
  totalSalesCash: number;
  totalExpenses: number;
}

export interface SaleInvoiceRecord {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientNif?: string;
  paymentMethod: string;
  total: number;
  operatorName: string;
  createdAt: string;
  salePoint?: {
    id: string;
    name: string;
  };
  items?: Array<{
    operator: string;
    productName: string;
    recipient: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}
