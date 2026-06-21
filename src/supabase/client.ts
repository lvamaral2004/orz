import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ypauzpsxhdlvjnsouruy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYXV6cHN4aGRsdmpuc291cnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTg3NDQsImV4cCI6MjA5NTg5NDc0NH0.2R3fxJrJbciAULriPQtaZRn5iJ-0JdxtOx5v44HSuTA';

// Fallback de memória para o caso do módulo nativo do AsyncStorage falhar ou estar ausente no build do Expo Go
const memoryStorage: Record<string, string> = {};

const safeStorage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            // Verifica se o módulo nativo existe antes de tentar ler
            if (!AsyncStorage) return memoryStorage[key] || null;
            return await AsyncStorage.getItem(key);
        } catch (error) {
            return memoryStorage[key] || null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            if (!AsyncStorage) {
                memoryStorage[key] = value;
                return;
            }
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            memoryStorage[key] = value;
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            if (!AsyncStorage) {
                delete memoryStorage[key];
                return;
            }
            await AsyncStorage.removeItem(key);
        } catch (error) {
            delete memoryStorage[key];
        }
    },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: safeStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
