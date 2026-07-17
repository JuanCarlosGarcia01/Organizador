export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer';
export type TransactionType = 'income' | 'expense';
export type SavingType = 'savings' | 'stocks' | 'crypto' | 'term_deposit';

export interface Account {
  id: number;
  user_id: string;
  name: string;
  type: 'cash' | 'debit' | 'transfer';
  balance: number;
  created_at: string;
}

export interface CreditCard {
  id: number;
  user_id: string;
  name: string;
  last_digits: string;
  limit_amount: number;
  debt: number;
  due_day: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  payment_method: PaymentMethod;
  account_id: number | null;
  credit_card_id: number | null;
  date: string;
  created_at: string;
}

export interface Installment {
  id: number;
  user_id: string;
  credit_card_id: number;
  description: string;
  total_amount: number;
  total_quotas: number;
  paid_quotas: number;
  created_at: string;
}

export interface SavingAsset {
  id: number;
  user_id: string;
  name: string;
  type: SavingType;
  current_value: number;
  change_percent: number;
  created_at: string;
}

export interface Category {
  id: number;
  user_id: string;
  name: string;
  type: TransactionType | 'both';
}