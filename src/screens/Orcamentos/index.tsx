import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, Pressable, ActivityIndicator,
    StyleSheet, Alert,
} from 'react-native';
import { OrcamentoRepository } from '../../repositories';
import { Orcamento } from '../../models';
import { Money } from '../../utils';
import { FormOrcamento } from './FormOrcamento';
import { DetalhesOrcamento } from './DetalhesOrcamento';

type Mode = 'lista' | 'form' | 'detalhe';

const STATUS_CORES: Record<Orcamento['status'], string> = {
    rascunho: '#888',
    enviado: '#f59e0b',
    aprovado: '#10b981',
    recusado: '#e94560',
};

const STATUS_LABELS: Record<Orcamento['status'], string> = {
    rascunho: 'Rascunho',
    enviado: 'Enviado',
    aprovado: 'Aprovado',
    recusado: 'Recusado',
};

export function OrcamentosScreen() {
    const [mode, setMode] = useState<Mode>('lista');
    const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [loading, setLoading] = useState(true);

    const carregar = useCallback(async () => {
        try {
            const repo = new OrcamentoRepository();
            const lista = await repo.findAll();
            setOrcamentos(lista);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    function abrirDetalhe(orc: Orcamento) {
        setOrcamentoSelecionado(orc);
        setMode('detalhe');
    }

    function handleSalvar() {
        setMode('lista');
        setLoading(true);
        carregar();
    }

    async function handleDeletar(orc: Orcamento) {
        Alert.alert(
            'Excluir Orçamento',
            `Deseja excluir o orçamento ${orc.numero}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir', style: 'destructive',
                    onPress: async () => {
                        await new OrcamentoRepository().delete(orc.id);
                        carregar();
                    },
                },
            ]
        );
    }

    if (mode === 'form') {
        return (
            <FormOrcamento
                onSalvar={handleSalvar}
                onCancelar={() => setMode('lista')}
            />
        );
    }

    if (mode === 'detalhe' && orcamentoSelecionado) {
        return (
            <DetalhesOrcamento
                orcamento={orcamentoSelecionado}
                onVoltar={() => { setMode('lista'); carregar(); }}
            />
        );
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0f3460" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orcamentos}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.lista}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.titulo}>Orçamentos</Text>
                            <Text style={styles.subtitulo}>{orcamentos.length} no total</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.centeredFlex}>
                        <Text style={styles.vazio}>Nenhum orçamento ainda.</Text>
                        <Text style={styles.vazioSub}>Toque em + para criar o primeiro.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable style={styles.card} onPress={() => abrirDetalhe(item)}>
                        <View style={styles.cardTop}>
                            <Text style={styles.numero}>{item.numero}</Text>
                            <View style={[styles.badge, { backgroundColor: STATUS_CORES[item.status] }]}>
                                <Text style={styles.badgeTexto}>{STATUS_LABELS[item.status]}</Text>
                            </View>
                        </View>
                        {item.clienteNome && (
                            <Text style={styles.cliente}>👤 {item.clienteNome}</Text>
                        )}
                        <View style={styles.cardBottom}>
                            <Text style={styles.data}>
                                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                            </Text>
                            <Pressable onPress={() => handleDeletar(item)}>
                                <Text style={styles.deletar}>Excluir</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                )}
            />
            <Pressable style={styles.fab} onPress={() => setMode('form')}>
                <Text style={styles.fabTexto}>+</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f8' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    centeredFlex: { alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 40 },
    lista: { padding: 16, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    titulo: { fontSize: 28, fontWeight: '800', color: '#0f3460' },
    subtitulo: { fontSize: 13, color: '#888', marginTop: 2 },
    card: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
        shadowColor: '#0f3460', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    numero: { fontSize: 16, fontWeight: '700', color: '#0f3460' },
    badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
    badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '600' },
    cliente: { fontSize: 14, color: '#333', marginBottom: 2 },
    data: { fontSize: 12, color: '#aaa' },
    deletar: { fontSize: 12, color: '#e94560', fontWeight: '600' },
    vazio: { fontSize: 15, color: '#aaa', textAlign: 'center' },
    vazioSub: { fontSize: 13, color: '#ccc', textAlign: 'center', marginTop: 4 },
    fab: {
        position: 'absolute', bottom: 24, right: 24,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#0f3460', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#0f3460', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
    },
    fabTexto: { color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '300' },
});
