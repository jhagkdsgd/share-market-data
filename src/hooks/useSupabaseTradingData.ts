import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trade, PortfolioSettings, Goal, Asset, UserSettings, Transaction } from '../types';
import { calculatePnL } from '../utils/calculations';

const defaultPortfolioSettings: Omit<PortfolioSettings, 'deposits' | 'withdrawals'> = {
  initialCapital: 10000,
  currentBalance: 10000,
  maxDailyLoss: 500,
  maxDailyLossPercentage: 5,
  maxPositionSize: 1000,
  maxPositionSizePercentage: 10,
  riskRewardRatio: 2,
  currency: 'USD',
  timezone: 'America/New_York',
};

const defaultUserSettings: UserSettings = {
  theme: 'light',
  currency: 'USD',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  notifications: {
    dailyLossLimit: true,
    goalProgress: true,
    tradeReminders: false,
  },
  riskManagement: {
    maxDailyLoss: 500,
    maxDailyLossPercentage: 5,
    maxPositionSize: 1000,
    maxPositionSizePercentage: 10,
    riskRewardRatio: 2,
    stopLossRequired: false,
    takeProfitRequired: false,
  },
  tradingHours: {
    start: '09:30',
    end: '16:00',
    timezone: 'America/New_York',
  },
};

export function useSupabaseTradingData() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [portfolio, setPortfolioState] = useState<PortfolioSettings>({
    ...defaultPortfolioSettings,
    deposits: [],
    withdrawals: [],
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [userSettings, setUserSettingsState] = useState<UserSettings>(defaultUserSettings);
  const [loading, setLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setTrades([]);
      setPortfolioState({ ...defaultPortfolioSettings, deposits: [], withdrawals: [] });
      setGoals([]);
      setAssets([]);
      setUserSettingsState(defaultUserSettings);
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadTrades(),
        loadPortfolio(),
        loadGoals(),
        loadAssets(),
        loadUserSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrades = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading trades:', error);
      return;
    }

    const formattedTrades: Trade[] = data.map(trade => ({
      id: trade.id,
      date: trade.date,
      time: trade.time,
      asset: trade.asset,
      direction: trade.direction,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price,
      positionSize: trade.position_size,
      strategy: trade.strategy,
      reasoning: trade.reasoning,
      marketConditions: trade.market_conditions,
      tags: trade.tags,
      screenshots: trade.screenshots,
      isOpen: trade.is_open,
      pnl: trade.pnl,
      fees: trade.fees,
      emotionalState: trade.emotional_state,
      createdAt: trade.created_at,
    }));

    setTrades(formattedTrades);
    
    // Trigger update event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('tradesUpdated', { detail: formattedTrades }));
    }, 0);
  };

  const loadPortfolio = async () => {
    if (!user) return;

    // Load portfolio settings
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Load transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (portfolioError && portfolioError.code !== 'PGRST116') {
      console.error('Error loading portfolio:', portfolioError);
      return;
    }

    if (transactionsError) {
      console.error('Error loading transactions:', transactionsError);
      return;
    }

    const transactions = transactionsData || [];
    const deposits = transactions.filter(t => t.type === 'deposit').map(t => ({
      id: t.id,
      date: t.date,
      amount: t.amount,
      type: t.type as 'deposit',
      description: t.description,
    }));
    const withdrawals = transactions.filter(t => t.type === 'withdrawal').map(t => ({
      id: t.id,
      date: t.date,
      amount: t.amount,
      type: t.type as 'withdrawal',
      description: t.description,
    }));

    const portfolioSettings: PortfolioSettings = portfolioData ? {
      initialCapital: portfolioData.initial_capital,
      currentBalance: portfolioData.current_balance,
      maxDailyLoss: portfolioData.max_daily_loss,
      maxDailyLossPercentage: portfolioData.max_daily_loss_percentage,
      maxPositionSize: portfolioData.max_position_size,
      maxPositionSizePercentage: portfolioData.max_position_size_percentage,
      riskRewardRatio: portfolioData.risk_reward_ratio,
      currency: portfolioData.currency,
      timezone: portfolioData.timezone,
      deposits,
      withdrawals,
    } : { ...defaultPortfolioSettings, deposits, withdrawals };

    setPortfolioState(portfolioSettings);
    
    // Trigger update event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: portfolioSettings }));
    }, 0);
  };

  const loadGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading goals:', error);
      return;
    }

    const formattedGoals: Goal[] = data.map(goal => ({
      id: goal.id,
      type: goal.type as Goal['type'],
      target: goal.target,
      current: goal.current,
      deadline: goal.deadline,
      description: goal.description,
      isActive: goal.is_active,
      priority: goal.priority as Goal['priority'],
      category: goal.category as Goal['category'],
      createdAt: goal.created_at,
    }));

    setGoals(formattedGoals);
    
    // Trigger update event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: formattedGoals }));
    }, 0);
  };

  const loadAssets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading assets:', error);
      return;
    }

    const formattedAssets: Asset[] = data.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      category: asset.category as Asset['category'],
      exchange: asset.exchange,
      sector: asset.sector,
      isActive: asset.is_active,
      createdAt: asset.created_at,
    }));

    setAssets(formattedAssets);
    
    // Trigger update event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('assetsUpdated', { detail: formattedAssets }));
    }, 0);
  };

  const loadUserSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading user settings:', error);
      return;
    }

    const settings: UserSettings = data ? {
      theme: data.theme,
      currency: data.currency,
      timezone: data.timezone,
      dateFormat: data.date_format,
      notifications: data.notifications,
      riskManagement: data.risk_management,
      tradingHours: data.trading_hours,
    } : defaultUserSettings;

    setUserSettingsState(settings);
  };

  // CRUD Operations
  const addTrade = async (trade: Omit<Trade, 'id' | 'createdAt'>) => {
    if (!user) return;

    const tradeData = {
      user_id: user.id,
      date: trade.date,
      time: trade.time,
      asset: trade.asset,
      direction: trade.direction,
      entry_price: trade.entryPrice,
      exit_price: trade.exitPrice,
      position_size: trade.positionSize,
      strategy: trade.strategy,
      reasoning: trade.reasoning,
      market_conditions: trade.marketConditions,
      tags: trade.tags,
      screenshots: trade.screenshots,
      is_open: trade.isOpen,
      pnl: trade.pnl,
      fees: trade.fees,
      emotional_state: trade.emotionalState,
    };

    const { data, error } = await supabase
      .from('trades')
      .insert(tradeData)
      .select()
      .single();

    if (error) {
      console.error('Error adding trade:', error);
      throw error;
    }

    await loadTrades();
    
    // Update portfolio balance if trade is closed
    if (!trade.isOpen && trade.pnl !== undefined) {
      await updatePortfolioBalance(trade.pnl - (trade.fees || 0));
    }
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    if (!user) return;

    const updateData: any = {};
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.asset !== undefined) updateData.asset = updates.asset;
    if (updates.direction !== undefined) updateData.direction = updates.direction;
    if (updates.entryPrice !== undefined) updateData.entry_price = updates.entryPrice;
    if (updates.exitPrice !== undefined) updateData.exit_price = updates.exitPrice;
    if (updates.positionSize !== undefined) updateData.position_size = updates.positionSize;
    if (updates.strategy !== undefined) updateData.strategy = updates.strategy;
    if (updates.reasoning !== undefined) updateData.reasoning = updates.reasoning;
    if (updates.marketConditions !== undefined) updateData.market_conditions = updates.marketConditions;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.screenshots !== undefined) updateData.screenshots = updates.screenshots;
    if (updates.isOpen !== undefined) updateData.is_open = updates.isOpen;
    if (updates.pnl !== undefined) updateData.pnl = updates.pnl;
    if (updates.fees !== undefined) updateData.fees = updates.fees;
    if (updates.emotionalState !== undefined) updateData.emotional_state = updates.emotionalState;

    const { error } = await supabase
      .from('trades')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating trade:', error);
      throw error;
    }

    await loadTrades();
    
    // Update portfolio balance if trade was closed
    const originalTrade = trades.find(t => t.id === id);
    if (originalTrade?.isOpen && !updates.isOpen && updates.pnl !== undefined) {
      await updatePortfolioBalance(updates.pnl - (updates.fees || 0));
    }
  };

  const deleteTrade = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }

    await loadTrades();
  };

  const setPortfolio = async (portfolioUpdates: Partial<PortfolioSettings>) => {
    if (!user) return;

    const updatedPortfolio = { ...portfolio, ...portfolioUpdates };
    setPortfolioState(updatedPortfolio);

    // Save to database
    const portfolioData = {
      user_id: user.id,
      initial_capital: updatedPortfolio.initialCapital,
      current_balance: updatedPortfolio.currentBalance,
      max_daily_loss: updatedPortfolio.maxDailyLoss,
      max_daily_loss_percentage: updatedPortfolio.maxDailyLossPercentage,
      max_position_size: updatedPortfolio.maxPositionSize,
      max_position_size_percentage: updatedPortfolio.maxPositionSizePercentage,
      risk_reward_ratio: updatedPortfolio.riskRewardRatio,
      currency: updatedPortfolio.currency,
      timezone: updatedPortfolio.timezone,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('portfolio_settings')
      .upsert(portfolioData);

    if (error) {
      console.error('Error updating portfolio:', error);
    }

    // Handle transactions
    if (portfolioUpdates.deposits || portfolioUpdates.withdrawals) {
      await loadPortfolio(); // Reload to get fresh transaction data
    }
    
    // Trigger update event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: updatedPortfolio }));
    }, 0);
  };

  const updatePortfolioBalance = async (amount: number) => {
    const newBalance = portfolio.currentBalance + amount;
    await setPortfolio({ currentBalance: newBalance });
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        ...transaction,
      });

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    await loadPortfolio();
  };

  // Goals CRUD
  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        type: goal.type,
        target: goal.target,
        current: goal.current,
        deadline: goal.deadline,
        description: goal.description,
        is_active: goal.isActive,
        priority: goal.priority,
        category: goal.category,
      });

    if (error) {
      console.error('Error adding goal:', error);
      throw error;
    }

    await loadGoals();
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;

    const updateData: any = {};
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.target !== undefined) updateData.target = updates.target;
    if (updates.current !== undefined) updateData.current = updates.current;
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.category !== undefined) updateData.category = updates.category;

    const { error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }

    await loadGoals();
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }

    await loadGoals();
  };

  // Assets CRUD
  const addAsset = async (asset: Omit<Asset, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        exchange: asset.exchange,
        sector: asset.sector,
        is_active: asset.isActive,
      });

    if (error) {
      console.error('Error adding asset:', error);
      throw error;
    }

    await loadAssets();
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    if (!user) return;

    const updateData: any = {};
    if (updates.symbol !== undefined) updateData.symbol = updates.symbol;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.exchange !== undefined) updateData.exchange = updates.exchange;
    if (updates.sector !== undefined) updateData.sector = updates.sector;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { error } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating asset:', error);
      throw error;
    }

    await loadAssets();
  };

  const deleteAsset = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }

    await loadAssets();
  };

  // User Settings
  const setUserSettings = async (settingsUpdates: Partial<UserSettings>) => {
    if (!user) return;

    const updatedSettings = { ...userSettings, ...settingsUpdates };
    setUserSettingsState(updatedSettings);

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        theme: updatedSettings.theme,
        currency: updatedSettings.currency,
        timezone: updatedSettings.timezone,
        date_format: updatedSettings.dateFormat,
        notifications: updatedSettings.notifications,
        risk_management: updatedSettings.riskManagement,
        trading_hours: updatedSettings.tradingHours,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating user settings:', error);
    }
  };

  // Export/Import (for backup purposes)
  const exportData = () => {
    const data = {
      trades,
      portfolio,
      goals,
      assets,
      userSettings,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      // This would require careful implementation to avoid conflicts
      // For now, just return false to indicate it's not implemented
      console.log('Import data:', data);
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  return {
    trades,
    portfolio,
    goals,
    assets,
    userSettings,
    loading,
    journalEntries: [], // Not implemented yet
    setPortfolio,
    setUserSettings,
    addTrade,
    updateTrade,
    deleteTrade,
    addGoal,
    updateGoal,
    deleteGoal,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    addJournalEntry: () => {}, // Not implemented yet
    exportData,
    importData,
  };
}