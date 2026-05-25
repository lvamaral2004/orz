import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { DashboardScreen } from './src/screens/Dashboard';
import { OrcamentosScreen } from './src/screens/Orcamentos';
import { InsumosScreen } from './src/screens/Insumos';
import { ServicosScreen } from './src/screens/Servicos';

type Tab = 'dashboard' | 'orcamentos' | 'insumos' | 'servicos';

const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Início', icon: '📊' },
    { key: 'orcamentos', label: 'Orçamentos', icon: '📋' },
    { key: 'servicos', label: 'Serviços', icon: '🔧' },
    { key: 'insumos', label: 'Insumos', icon: '📦' },
];

export default function App() {
    const [tabAtiva, setTabAtiva] = useState<Tab>('dashboard');

    function renderTela() {
        switch (tabAtiva) {
            case 'dashboard':   return <DashboardScreen />;
            case 'orcamentos':  return <OrcamentosScreen />;
            case 'servicos':    return <ServicosScreen />;
            case 'insumos':     return <InsumosScreen />;
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
        fontSize: 22,
        marginBottom: 2,
        opacity: 0.4,
    },
    tabIconAtiva: {
        opacity: 1,
    },
    tabLabel: {
        fontSize: 10,
        color: '#aaa',
        fontWeight: '500',
    },
    tabLabelAtiva: {
        color: '#0f3460',
        fontWeight: '700',
    },
});
