import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Account, CreditCard, Transaction, Installment, SavingAsset, Category } from '@/types/finance';

interface FinanceStore {
  accounts: Account[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  installments: Installment[];
  savingAssets: SavingAsset[];
  categories: Category[];
  loading: boolean;

  loadAll: () => Promise<void>;

  addAccount: (name: string, type: string, balance: number) => Promise<void>;
  removeAccount: (id: number) => Promise<void>;

  addCreditCard: (name: string, last_digits: string, limit_amount: number, debt: number, due_day: number) => Promise<void>;
  removeCreditCard: (id: number) => Promise<void>;

  addTransaction: (description: string, amount: number, type: string, category: string, payment_method: string, account_id: number | null, credit_card_id: number | null, date: string) => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;

  addInstallment: (credit_card_id: number, description: string, total_amount: number, total_quotas: number) => Promise<void>;
  payQuota: (id: number, current_paid: number) => Promise<void>;
  removeInstallment: (id: number) => Promise<void>;

  addSavingAsset: (name: string, type: string, current_value: number, change_percent: number) => Promise<void>;
  editSavingAsset: (id: number, current_value: number, change_percent: number) => Promise<void>;
  removeSavingAsset: (id: number) => Promise<void>;

  addCategory: (name: string, type: string) => Promise<void>;
  removeCategory: (id: number) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  accounts: [],
  creditCards: [],
  transactions: [],
  installments: [],
  savingAssets: [],
  categories: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    const [accounts, creditCards, transactions, installments, savingAssets, categories] = await Promise.all([
      supabase.from('accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('credit_cards').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('installments').select('*').order('created_at', { ascending: false }),
      supabase.from('saving_assets').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
    ]);
    set({
      accounts: accounts.data || [],
      creditCards: creditCards.data || [],
      transactions: transactions.data || [],
      installments: installments.data || [],
      savingAssets: savingAssets.data || [],
      categories: categories.data || [],
      loading: false,
    });
  },

  addAccount: async (name, type, balance) => {
    await supabase.from('accounts').insert({ name, type, balance });
    get().loadAll();
  },
  removeAccount: async (id) => {
    await supabase.from('accounts').delete().eq('id', id);
    get().loadAll();
  },

  addCreditCard: async (name, last_digits, limit_amount, debt, due_day) => {
    await supabase.from('credit_cards').insert({ name, last_digits, limit_amount, debt, due_day });
    get().loadAll();
  },
  removeCreditCard: async (id) => {
    await supabase.from('credit_cards').delete().eq('id', id);
    get().loadAll();
  },

  addTransaction: async (description, amount, type, category, payment_method, account_id, credit_card_id, date) => {
    await supabase.from('transactions').insert({ description, amount, type, category, payment_method, account_id, credit_card_id, date });
    // actualizar saldo de cuenta
    if (account_id) {
      const account = get().accounts.find(a => a.id === account_id);
      if (account) {
        const newBalance = type === 'income' ? account.balance + amount : account.balance - amount;
        await supabase.from('accounts').update({ balance: newBalance }).eq('id', account_id);
      }
    }
    // actualizar deuda TC
    if (credit_card_id && type === 'expense') {
      const card = get().creditCards.find(c => c.id === credit_card_id);
      if (card) {
        await supabase.from('credit_cards').update({ debt: card.debt + amount }).eq('id', credit_card_id);
      }
    }
    get().loadAll();
  },
  removeTransaction: async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    get().loadAll();
  },

  addInstallment: async (credit_card_id, description, total_amount, total_quotas) => {
    await supabase.from('installments').insert({ credit_card_id, description, total_amount, total_quotas });
    get().loadAll();
  },
  payQuota: async (id, current_paid) => {
    await supabase.from('installments').update({ paid_quotas: current_paid + 1 }).eq('id', id);
    get().loadAll();
  },
  removeInstallment: async (id) => {
    await supabase.from('installments').delete().eq('id', id);
    get().loadAll();
  },

  addSavingAsset: async (name, type, current_value, change_percent) => {
    await supabase.from('saving_assets').insert({ name, type, current_value, change_percent });
    get().loadAll();
  },
  editSavingAsset: async (id, current_value, change_percent) => {
    await supabase.from('saving_assets').update({ current_value, change_percent }).eq('id', id);
    get().loadAll();
  },
  removeSavingAsset: async (id) => {
    await supabase.from('saving_assets').delete().eq('id', id);
    get().loadAll();
  },

  addCategory: async (name, type) => {
    await supabase.from('categories').insert({ name, type });
    get().loadAll();
  },
  removeCategory: async (id) => {
    await supabase.from('categories').delete().eq('id', id);
    get().loadAll();
  },
}));