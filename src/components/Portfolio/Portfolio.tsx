import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Plus, Minus } from 'lucide-react';
import { MetricCard } from '../Dashboard/MetricCard';
import { useTradingData } from '../../hooks/useTradingData';
import { formatCurrency, formatPercent } from '../../utils/calculations';

export function Portfolio() {
  const { portfolio, setPortfolio, addTransaction } = useTradingData();
  const [showTransaction, setShowTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [maxDailyLoss, setMaxDailyLoss] = useState(portfolio.maxDailyLoss.toString());
  const [maxDailyLossPercentage, setMaxDailyLossPercentage] = useState(portfolio.maxDailyLossPercentage.toString());

  const totalReturn = ((portfolio.currentBalance - portfolio.initialCapital) / portfolio.initialCapital) * 100;
  const totalPnL = portfolio.currentBalance - portfolio.initialCapital;
  
  const totalDeposits = portfolio.deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawals = portfolio.withdrawals.reduce((sum, w) => sum + w.amount, 0);

  const handleTransaction = async () => {
    const transactionAmount = parseFloat(amount);
    if (!transactionAmount || transactionAmount <= 0) return;

    try {
      // Add transaction to database
      await addTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: transactionAmount,
        type: transactionType,
        description: description || `${transactionType} transaction`,
      });

      // Update portfolio balance
      const balanceChange = transactionType === 'deposit' ? transactionAmount : -transactionAmount;
      await setPortfolio({
        currentBalance: portfolio.currentBalance + balanceChange,
      });

      // Reset form
      setAmount('');
      setDescription('');
      setShowTransaction(false);
      
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error adding transaction. Please try again.');
    }
  };

  const handleRiskSettingsUpdate = async () => {
    try {
      await setPortfolio({
        maxDailyLoss: parseFloat(maxDailyLoss) || 0,
        maxDailyLossPercentage: parseFloat(maxDailyLossPercentage) || 0,
      });
      alert('Risk settings updated successfully!');
    } catch (error) {
      console.error('Error updating risk settings:', error);
      alert('Error updating settings. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Portfolio Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Track your trading capital and manage risk settings
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Current Balance"
          value={formatCurrency(portfolio.currentBalance, portfolio.currency)}
          change={`${totalReturn >= 0 ? '+' : ''}${formatPercent(totalReturn)}`}
          changeType={totalReturn >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
          description="Total account value"
        />
        
        <MetricCard
          title="Initial Capital"
          value={formatCurrency(portfolio.initialCapital, portfolio.currency)}
          icon={DollarSign}
          description="Starting capital"
        />
        
        <MetricCard
          title="Total P&L"
          value={formatCurrency(totalPnL, portfolio.currency)}
          changeType={totalPnL >= 0 ? 'positive' : 'negative'}
          icon={totalPnL >= 0 ? TrendingUp : TrendingDown}
          description="Profit/Loss from trading"
        />
        
        <MetricCard
          title="Max Daily Loss"
          value={formatCurrency(portfolio.maxDailyLoss, portfolio.currency)}
          change={`${portfolio.maxDailyLossPercentage}% of capital`}
          icon={AlertTriangle}
          description="Risk management limit"
        />
      </div>

      {/* Transactions Section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Account Transactions</h3>
            <button
              onClick={() => setShowTransaction(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </div>

        {showTransaction && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value as 'deposit' | 'withdrawal')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount ({portfolio.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleTransaction}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowTransaction(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Deposits</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {portfolio.deposits.length === 0 ? (
                  <p className="text-sm text-gray-500">No deposits recorded</p>
                ) : (
                  portfolio.deposits.slice(0, 5).map(deposit => (
                    <div key={deposit.id} className="flex justify-between items-center py-1">
                      <div>
                        <p className="text-sm text-gray-900">{deposit.description}</p>
                        <p className="text-xs text-gray-500">{new Date(deposit.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(deposit.amount, portfolio.currency)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Total Deposits:</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(totalDeposits, portfolio.currency)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Withdrawals</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {portfolio.withdrawals.length === 0 ? (
                  <p className="text-sm text-gray-500">No withdrawals recorded</p>
                ) : (
                  portfolio.withdrawals.slice(0, 5).map(withdrawal => (
                    <div key={withdrawal.id} className="flex justify-between items-center py-1">
                      <div>
                        <p className="text-sm text-gray-900">{withdrawal.description}</p>
                        <p className="text-xs text-gray-500">{new Date(withdrawal.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-medium text-red-600">-{formatCurrency(withdrawal.amount, portfolio.currency)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Total Withdrawals:</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(totalWithdrawals, portfolio.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Management Settings */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <h3 className="text-lg font-medium text-gray-900">Risk Management Settings</h3>
          <p className="text-sm text-gray-500">Set daily loss limits to protect your capital</p>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Daily Loss ({portfolio.currency})</label>
              <input
                type="number"
                step="0.01"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="500.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Daily Loss (%)</label>
              <input
                type="number"
                step="0.1"
                value={maxDailyLossPercentage}
                onChange={(e) => setMaxDailyLossPercentage(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="5.0"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRiskSettingsUpdate}
                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Update Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}