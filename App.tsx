import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/supabase/client';
import { DashboardScreen } from './src/screens/Dashboard';
import { OrcamentosScreen } from './src/screens/Orcamentos';
import { InsumosScreen } from './src/screens/Insumos';
import { ServicosScreen } from './src/screens/Servicos';
import { ConfiguracoesScreen } from './src/screens/Configuracoes';
import { LoginScreen } from './src/screens/Login';

type Tab = 'dashboard' | 'orcamentos' | 'insumos' | 'servicos' | 'config';

const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Início', icon: '📊' },
    { key: 'orcamentos', label: 'Orçamentos', icon: '📋' },
    { key: 'servicos', label: 'Serviços', icon: '🔧' },
    { key: 'insumos', label: 'Insumos', icon: '📦' },
    { key: 'config', label: 'Config', icon: '⚙️' },
];

export default function App() {
    const [tabAtiva, setTabAtiva] = useState<Tab>('dashboard');
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obter sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Ouvir mudanças no estado de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Carregando sessão...</Text>
            </View>
        );
    }

    if (!session) {
        return (
            <>
                <StatusBar style="light" />
                <LoginScreen />
            </>
        );
    }

    function renderTela() {
        switch (tabAtiva) {
            case 'dashboard':   return <DashboardScreen />;
            case 'orcamentos':  return <OrcamentosScreen />;
            case 'servicos':    return <ServicosScreen />;
            case 'insumos':     return <InsumosScreen />;
            case 'config':      return <ConfiguracoesScreen />;
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Conteúdo da tela ativa */}
            <View style={styles.conteudo}>
                {renderTela()}
            </View>

            {/* Barra de navegação inferior */}
            <View style={styles.tabBar}>
                {TABS.map((tab) => {
                    const ativa = tabAtiva === tab.key;
                    return (
                        <Pressable
                            key={tab.key}
                            style={styles.tabItem}
                            onPress={() => setTabAtiva(tab.key)}
                        >
                            <Text style={[styles.tabIcon, ativa && styles.tabIconAtiva]}>
                                {tab.icon}
                            </Text>
                            <Text style={[styles.tabLabel, ativa && styles.tabLabelAtiva]}>
                                {tab.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f3460',
    },
    conteudo: {
        flex: 1,
        backgroundColor: '#f0f2f8',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0f3460',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingBottom: 8,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 10,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    tabIcon: {
        fontSize: 20,
        marginBottom: 2,
        opacity: 0.4,
    },
    tabIconAtiva: {
        opacity: 1,
    },
    tabLabel: {
        fontSize: 9,
        color: '#aaa',
        fontWeight: '500',
    },
    tabLabelAtiva: {
        color: '#0f3460',
        fontWeight: '700',
    },
});
