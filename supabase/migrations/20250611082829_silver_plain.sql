/*
  # Initial Trading Journal Schema

  1. New Tables
    - `trades`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date)
      - `time` (text)
      - `asset` (text)
      - `direction` (text, 'long' or 'short')
      - `entry_price` (numeric)
      - `exit_price` (numeric, nullable)
      - `position_size` (numeric)
      - `strategy` (text)
      - `reasoning` (text)
      - `market_conditions` (text)
      - `tags` (text array)
      - `screenshots` (text array, nullable)
      - `is_open` (boolean)
      - `pnl` (numeric, nullable)
      - `fees` (numeric, nullable)
      - `emotional_state` (text, nullable)
      - `created_at` (timestamptz)

    - `assets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `symbol` (text)
      - `name` (text)
      - `category` (text)
      - `exchange` (text, nullable)
      - `sector` (text, nullable)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text)
      - `target` (numeric)
      - `current` (numeric)
      - `deadline` (date)
      - `description` (text)
      - `is_active` (boolean)
      - `priority` (text)
      - `category` (text)
      - `created_at` (timestamptz)

    - `portfolio_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `initial_capital` (numeric)
      - `current_balance` (numeric)
      - `max_daily_loss` (numeric)
      - `max_daily_loss_percentage` (numeric)
      - `max_position_size` (numeric)
      - `max_position_size_percentage` (numeric)
      - `risk_reward_ratio` (numeric)
      - `currency` (text)
      - `timezone` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date)
      - `amount` (numeric)
      - `type` (text, 'deposit' or 'withdrawal')
      - `description` (text, nullable)
      - `created_at` (timestamptz)

    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `theme` (text)
      - `currency` (text)
      - `timezone` (text)
      - `date_format` (text)
      - `notifications` (jsonb)
      - `risk_management` (jsonb)
      - `trading_hours` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
*/

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  asset text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price numeric NOT NULL,
  exit_price numeric,
  position_size numeric NOT NULL,
  strategy text NOT NULL,
  reasoning text NOT NULL DEFAULT '',
  market_conditions text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  screenshots text[],
  is_open boolean NOT NULL DEFAULT false,
  pnl numeric,
  fees numeric DEFAULT 0,
  emotional_state text,
  created_at timestamptz DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  exchange text,
  sector text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'yearly')),
  target numeric NOT NULL,
  current numeric NOT NULL DEFAULT 0,
  deadline date NOT NULL,
  description text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  category text NOT NULL CHECK (category IN ('profit', 'winrate', 'trades', 'drawdown')),
  created_at timestamptz DEFAULT now()
);

-- Create portfolio_settings table
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  initial_capital numeric NOT NULL DEFAULT 10000,
  current_balance numeric NOT NULL DEFAULT 10000,
  max_daily_loss numeric NOT NULL DEFAULT 500,
  max_daily_loss_percentage numeric NOT NULL DEFAULT 5,
  max_position_size numeric NOT NULL DEFAULT 1000,
  max_position_size_percentage numeric NOT NULL DEFAULT 10,
  risk_reward_ratio numeric NOT NULL DEFAULT 2,
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme text NOT NULL DEFAULT 'light',
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'America/New_York',
  date_format text NOT NULL DEFAULT 'MM/DD/YYYY',
  notifications jsonb NOT NULL DEFAULT '{"dailyLossLimit": true, "goalProgress": true, "tradeReminders": false}',
  risk_management jsonb NOT NULL DEFAULT '{"maxDailyLoss": 500, "maxDailyLossPercentage": 5, "maxPositionSize": 1000, "maxPositionSizePercentage": 10, "riskRewardRatio": 2, "stopLossRequired": false, "takeProfitRequired": false}',
  trading_hours jsonb NOT NULL DEFAULT '{"start": "09:30", "end": "16:00", "timezone": "America/New_York"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for trades
CREATE POLICY "Users can read own trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for assets
CREATE POLICY "Users can read own assets"
  ON assets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON assets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON assets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for goals
CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for portfolio_settings
CREATE POLICY "Users can read own portfolio settings"
  ON portfolio_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio settings"
  ON portfolio_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio settings"
  ON portfolio_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_settings
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date);
CREATE INDEX IF NOT EXISTS idx_trades_asset ON trades(asset);
CREATE INDEX IF NOT EXISTS idx_trades_is_open ON trades(is_open);

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON assets(symbol);
CREATE INDEX IF NOT EXISTS idx_assets_is_active ON assets(is_active);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);