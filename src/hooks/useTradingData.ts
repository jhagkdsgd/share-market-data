// This file now acts as a wrapper to maintain compatibility
// while using the new Supabase-based hook
import { useSupabaseTradingData } from './useSupabaseTradingData';

export const useTradingData = useSupabaseTradingData;